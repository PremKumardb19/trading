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
     const allParams = this.paramsFor('crypto');
     const passedMarketCap = allParams.marketCap;
     console.log("all params",allParams)
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    console.log("params",params)
    console.log("cap",passedMarketCap)
    console.log("baseId",baseId)

    const ajaxHeaders = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const candleRequest = $.ajax({
      url: `http://localhost:1010/trading-backend/fetch?action=candle&baseId=${baseId}&quoteId=tether&email=${encodeURIComponent(email)}`,
      method: 'GET',
      ...ajaxHeaders
    });

    const allCryptoRequest = $.ajax({
      url: `http://localhost:1010/trading-backend/fetch?action=crypto&email=${encodeURIComponent(email)}`,
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
          priceUsd: parseFloat(crypto.priceUsd),
          changePercent24Hr: parseFloat(crypto.changePercent24Hr).toFixed(2),
          marketCapUsd: passedMarketCap || "Unknown" 
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
      controller.fetchCryptoInfo();
    });
  },

  deactivate() {
    this.controllerFor('crypto').stopPolling();
  }
});
