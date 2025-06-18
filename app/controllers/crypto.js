import Ember from 'ember';

export default Ember.Controller.extend({
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
  usdBalance: '0.00',
  holdingAmount: '0.00000000',
  holdingProfit: 0,
  holdingLoss: 0,
  pollinginterval: null,

  buySelected: Ember.computed.equal('tradeType', 'buy'),
  sellSelected: Ember.computed.equal('tradeType', 'sell'),


  init() {
    this._super(...arguments);
  },  pollinginterval: null,

  startPolling() {
    this.fetchCandle();
    this.setupChart();
    if (!this.pollinginterval) {
      this.pollinginterval = setInterval(() => {
        this.fetchCandle()
        this.setupChart()
      }, 2000);
    }
  },

  stopPolling() {
    if (this.pollinginterval) {
      clearInterval(this.pollinginterval);
      this.set('pollinginterval', null);
    }
  },


  handleRegister(event) {
    event.preventDefault();

    const username = this.get('username');
    const email = this.get('email');
    const password = this.get('password');

    if (!username || !email || !password) {
      alert('All fields are required!');
      return;
    }

    const payload = { username, email, password };

    fetch('http://localhost:1010/trading-backend/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success' && data.token) {
          localStorage.setItem("email", email);
          localStorage.setItem("token", data.token);
          alert('Registration successful!');
          this.set('username', '');
          this.set('email', '');
          this.set('password', '');
          this.transitionToRoute('dashboard');
        } else {
          alert('Registration failed: ' + (data.message || 'Unknown error'));
        }
      })
      .catch((err) => {
        alert('Error connecting to backend: ' + err.message);
      });
  },

  fetchCandle() {
    let model = this.get('model');
    let baseId = model && model.baseId;
    if (!baseId){
      return;
    }

    const token = localStorage.getItem("token");
    let self=this;
    return Ember.$.ajax({
      url: `http://localhost:1010/trading-backend/candles?baseId=${baseId}&quoteId=tether`,
      headers: { 'Authorization': `Bearer ${token}` }
    ,success(candleData){
      model.candles = candleData;
      self.set('model', model);

      
    }
    ,error(err) {
      console.error("API fetch error:", err);
    }
    });
  },

  fetchBalance() {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    if (!email){
      return;
    }

    fetch(`http://localhost:1010/trading-backend/balance?email=${email}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.balance) {
        this.set('usdBalance', parseFloat(data.balance).toFixed(2));
      }
    })
    .catch(err => {
      console.error("Error fetching balance", err);
      this.set('usdBalance', '0.00');
    });
  },

  fetchHoldings() {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    const details = this.get('model.details') || {};
    const cryptoId = details.id;
    const priceUsd = details.priceUsd;

    if (!email || !cryptoId || !priceUsd){
      return;
    }

    fetch(`http://localhost:1010/trading-backend/holdings?email=${email}&cryptoId=${cryptoId}&priceUsd=${priceUsd}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
    }

    const model = this.get('model');
    const candles = model && model.candles;
    if (!candles || !Array.isArray(candles)) return;

    const seriesData = candles.map(d => ({
      x: new Date(d[0] + (5.5 * 60 * 60 * 1000)),
      y: [parseFloat(d[1]), parseFloat(d[2]), parseFloat(d[3]), parseFloat(d[4])]
    }));

    const options = {
      chart: { type: 'candlestick', height: 500, toolbar: { show: true } },
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

    Ember.run.scheduleOnce('afterRender', this, function () {
      const chartEl = document.querySelector("#cryptoChart");
      if (chartEl) {
        this.chart = new ApexCharts(chartEl, options);
        this.chart.render();
      }
    });
  },
  actions: {
 updateAmount(event) {
      this.set('amount', event.target.value);
    },handleTrade(event) {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }

      const amount = this.get('amount');
      const type = this.get('tradeType');
      const email = localStorage.getItem('email');
      const details = this.get('model.details') || {};
      const cryptoId = details.id;
      const cryptoName = details.name;
      const priceUsd = parseFloat(details.priceUsd);

      if (!amount || isNaN(amount)) {
        this.set('tradeStatus', 'Missing or invalid input.');
        return;
      }

      const tradeData = {
        cryptoId,
        cryptoName,
        email,
        type,
        amount: parseFloat(amount),
        priceUsd,
        timestamp: new Date().toISOString()
      };

      fetch('http://localhost:1010/trading-backend/trade', {
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
          console.log('Trade success:', data);
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
  ,
      updateType(value){
       this.set('tradeType', value);
    },
    login(event) {
      event.preventDefault();

      const self = this;
      const username = this.get('username');
      const password = this.get('password');

      Ember.$.ajax({
        url: 'http://localhost:1010/trading-backend/login',
        method: 'POST',
        data: { username, password },
        success(response) {
          if (response.status === "success") {
            localStorage.setItem("email", response.email || username);
            if (response.token) {
              localStorage.setItem("token", response.token);
            }
            self.set('status', 'Login successful!');
            self.transitionToRoute('dashboard');
          } else {
            self.set('status', 'Login failed.');
          }
        },
        error(xhr) {
          self.set('status', 'Login error: ' + xhr.responseText);
        }
      });
    },

    logout() {
      localStorage.removeItem("email");
      localStorage.removeItem("token");
      this.transitionToRoute('login');
    }
  }
})
