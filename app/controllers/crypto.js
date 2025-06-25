import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['price', 'change', 'marketCap'],

  price: null,
  change: null,
  marketCap: null,
  username: '',
  email: '',
  password: '',
  usdBalance: '0.00',
  holdingAmount: '0.00000000',
  holdingProfit: '0.00',
  holdingLoss: '0.00',
  chart: null,
  amount: '',
  tradeType: 'buy',
  tradeStatus: '',
  pollinginterval: null,

  buySelected: Ember.computed.equal('tradeType', 'buy'),
  sellSelected: Ember.computed.equal('tradeType', 'sell'),

  init() {
    this._super(...arguments);
  },

  startPolling() {
    if (!this.pollinginterval) {
      this.fetchCandle();
      this.pollinginterval = setInterval(() => {
        this.fetchCandle();
        console.log("Polling...",this.pollinginterval, this.model && this.model.details ? this.model.details.id : 'N/A');
      }, 2000);
    }
  },

  stopPolling() {
    if (this.pollinginterval) {
      clearInterval(this.pollinginterval);
      this.set('pollinginterval', null);
    }
  },

  fetchCandle() {
    const baseId = this.model && this.model.details && this.model.details.id ? this.model.details.id : null;
    if (!baseId) return console.log("No baseId in fetchCandle");

    const token = localStorage.getItem("token");
    const self = this;
    let email=localStorage.getItem('email')
    return Ember.$.ajax({
      url: `http://localhost:1010/trading-backend/fetch?action=candle&baseId=${baseId}&quoteId=tether&email=${encodeURIComponent(email)}`,
      headers: { 'Authorization': `Bearer ${token}` },
      success(candleData) {
        self.model.candles = candleData;
        self.set('model', self.model);
        self.set('model.priceUsd', parseFloat(candleData[candleData.length - 1][1]).toFixed(2));
        const seriesData = candleData.map(d => ({
          x: new Date(d[0] + (5.5 * 60 * 60 * 1000)),
          y: [parseFloat(d[1]), parseFloat(d[2]), parseFloat(d[3]), parseFloat(d[4])]
        }));

        let currentMin = null, currentMax = null;
        if (self.chart && self.chart.w && self.chart.w.globals) {
          const xAxis = self.chart.w.globals.minX;
          const maxX = self.chart.w.globals.maxX;
          currentMin = xAxis;
          currentMax = maxX;
        }

        if (self.chart) {
          self.chart.updateSeries([{ data: seriesData }], true);

          if (currentMin && currentMax) {
            self.chart.zoomX(currentMin, currentMax);
          }
        } else {
          self.setupChart();
        }
      },
      error(err) {
        console.error("API fetch error:", err);
      }
    });
  },

  fetchBalance() {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    if (!email) return;

    fetch(`http://localhost:1010/trading-backend/wallet?action=balance&email=${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (isNaN(data.balance)) {
          this.set('usdBalance', '0.00');
        } else if (data.balance) {
          console.log("in response");
          this.set('usdBalance', parseFloat(data.balance).toFixed(2));
        }
      })
      .catch(err => {
        console.error("Error fetching balance", err);
        this.set('usdBalance', '0.00');
      });
    console.log("after fetch");
  },

  fetchHoldings() {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    const { id: cryptoId, priceUsd } = this.get('model.details') || {};

    if (!email || !cryptoId || !priceUsd) return;

    fetch(`http://localhost:1010/trading-backend/wallet?action=holdings&email=${encodeURIComponent(email)}&cryptoId=${cryptoId}&priceUsd=${priceUsd}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const holdingAmount = data.amountHeld || 0;
        const diff = holdingAmount === 0 ? 0 : data.profitOrLoss;

        this.set('holdingAmount', holdingAmount.toFixed(8));
        this.set('holdingProfit', diff >= 0 ? diff.toFixed(2) : '0.00');
        this.set('holdingLoss', diff < 0 ? Math.abs(diff).toFixed(2) : '0.00');
      })
      .catch(err => {
        console.error("Error fetching holdings", err);
        this.set('holdingAmount', '0.00000000');
        this.set('holdingProfit', '0.00');
        this.set('holdingLoss', '0.00');
      });
  },

  setupChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    Ember.run.scheduleOnce('afterRender', this, function () {
      Ember.run.later(this, function () {
        const chartEl = document.querySelector("#cryptoChart");

        if (!chartEl) {
          console.warn("Chart container #cryptoChart not found.");
          return;
        }

        const model = this.get('model');
        const candles = model && model.candles;
        if (!candles || !Array.isArray(candles)) return;

        const seriesData = candles.map(d => ({
          x: new Date(d[0] + (5.5 * 60 * 60 * 1000)),
          y: [parseFloat(d[1]), parseFloat(d[2]), parseFloat(d[3]), parseFloat(d[4])]
        }));

        const options = {
          chart: {
            id: 'realtime',
            type: 'candlestick',
            height: 500,
            toolbar: { show: true },
            zoom: {
              enabled: true,
              type: 'x',
              autoScaleYaxis: false,
              allowMouseWheelZoom: true,
              zoomedArea: {
                fill: {
                  color: '#90CAF9',
                  opacity: 0.4
                },
                stroke: {
                  color: '#0D47A1',
                  opacity: 0.4,
                  width: 1
                }
              }
            }
          },
          series: [{ data: seriesData }],
          xaxis: { type: 'datetime', labels: { rotate: -45 } },
          plotOptions: { candlestick: { wick: { useFillColor: true } } },
          yaxis: { tooltip: { enabled: true }, decimalsInFloat: 2 },
          tooltip: {
            shared: true,
            custom({ series, seriesIndex, dataPointIndex, w }) {
              const ohlc = w.globals.initialSeries[seriesIndex].data[dataPointIndex].y;
              return `<div style="padding: 6px"><b>O:</b> ${ohlc[0]}<br><b>H:</b> ${ohlc[1]}<br><b>L:</b> ${ohlc[2]}<br><b>C:</b> ${ohlc[3]}</div>`;
            }
          }
        };

        this.chart = new ApexCharts(chartEl, options);
        this.chart.render();

      }, 200);
    });
  },

  actions: {
    updateAmount(event) {
      this.set('amount', event.target.value);
    },

    updateType(value) {
      this.set('tradeType', value);
    },

    handleTrade(event) {
      if (event && event.preventDefault) event.preventDefault();

      const amount = parseFloat(this.get('amount'));
      const type = this.get('tradeType');
      const email = localStorage.getItem('email');
      const token = localStorage.getItem('token');
      const { id: cryptoId, name: cryptoName, priceUsd } = this.get('model.details') || {};

      if (!amount || isNaN(amount)) {
        this.set('tradeStatus', 'Missing or invalid input.');
        return;
      }

      const tradeData = {
        cryptoId,
        cryptoName,
        email,
        type,
        amount,
        priceUsd: parseFloat(priceUsd),
        timestamp: new Date().toISOString()
      };

      fetch(`http://localhost:1010/trading-backend/trade?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tradeData)
      })
        .then(response => {
          if (!response.ok) throw new Error('Trade failed');
          return response.json();
        })
        .then(data => {
          this.set('tradeStatus', 'Trade successful!');
          this.fetchBalance();
          this.fetchHoldings();

          const updatedHold = data.amountHeld <= 0.00000001 ? 0 : data.amountHeld;
          const pnl = parseFloat(data.unrealizedProfit) || 0;

          this.set('usdBalance', parseFloat(data.updatedBalance).toFixed(2));
          this.set('holdingAmount', updatedHold.toFixed(8));

          if (updatedHold === 0) {
            this.set('holdingProfit', '0.00');
            this.set('holdingLoss', '0.00');
          } else if (pnl > 0) {
            this.set('holdingProfit', pnl.toFixed(2));
            this.set('holdingLoss', '0.00');
          } else {
            this.set('holdingProfit', '0.00');
            this.set('holdingLoss', Math.abs(pnl).toFixed(2));
          }
        })
        .catch(err => {
          console.error(err);
          this.set('tradeStatus', 'Trade failed. Please try again.');
        });
    }
  }
});
