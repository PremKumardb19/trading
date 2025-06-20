import Ember from 'ember';
import $ from 'jquery';

export default Ember.Route.extend({
  beforeModel() {
    if (!localStorage.getItem('email')) {
      this.transitionTo('login');
    }
  },

  model(params) {
    const baseId = params.id;
    const token = localStorage.getItem('token');

    const ajaxHeaders = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const candleRequest = $.ajax({
      url: `http://localhost:1010/trading-backend/candles?baseId=${baseId}&quoteId=tether`,
      method: 'GET',
      ...ajaxHeaders
    });

    const allCryptoRequest = $.ajax({
      url: 'http://localhost:1010/trading-backend/all-crypto',
      method: 'GET',
      ...ajaxHeaders
    });

    return Ember.RSVP.hash({
      candleData: candleRequest,
      allCryptos: allCryptoRequest
    }).then(function(result) {
      const crypto = result.allCryptos.find(c => c.id === baseId);
      if (!crypto) {
        return { error: "Crypto not found" };
      }

      return {
        details: {
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol,
          priceUsd: parseFloat(crypto.priceUsd).toFixed(2),
          changePercent24Hr: parseFloat(crypto.changePercent24Hr).toFixed(2)
        },
        candles: result.candleData
      };
    }).catch(function(error) {
      console.error("API fetch error:", error);
      return { error: "Failed to load data" };
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('model', model);

    
    Ember.run.scheduleOnce('afterRender', this, function () {
      controller.setupChart();         
      controller.startPolling();       
      controller.fetchBalance();       
      controller.fetchHoldings();      
    });
  },

  deactivate() {
    this.controllerFor('crypto').stopPolling();
  }


  /*
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.setProperties({
        chart: null,
        amount: '',
        tradeType: 'buy',
        tradeStatus: '',
        usdBalance: '0.00',
        holdingAmount: '0.00000000',
        holdingProfit: 0,
        holdingLoss: 0
      });
    }
  }
  */
});
