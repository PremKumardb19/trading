import Ember from 'ember';
import $ from 'jquery';

export default Ember.Route.extend({
  beforeModel() {
    if (!localStorage.getItem('email')) {
      this.transitionTo('login');
    }
  },

  model(params) {
    var baseId = params.id;

    return Ember.RSVP.hash({
      candleData: $.getJSON('http://localhost:1010/trading-backend/candles?baseId=' + baseId + '&quoteId=tether'),
      allCryptos: $.getJSON('http://localhost:1010/trading-backend/all-crypto')
    }).then(function(result) {
      var crypto = result.allCryptos.find(function(c) {
        return c.id === baseId;
      });

      if (!crypto) {
        return { error: "Crypto not found" };
      }

      return {
        baseId: baseId,
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

  activate() {
    this.controllerFor('crypto').startPolling();
  },

  deactivate() {
    this.controllerFor('crypto').stopPolling();
  },

  setupController(controller, model) {
    this._super(controller, model);

    Ember.run.scheduleOnce('afterRender', controller, 'setupChart');

    controller.fetchBalance();
    controller.fetchHoldings(model.baseId);
  }

  // resetController(controller, isExiting) {
  //   if (isExiting) {
  //     controller.setProperties({
  //       chart: null,
  //       amount: '',
  //       tradeType: 'buy',
  //       tradeStatus: '',
  //       usdBalance: '0.00',
  //       holdingAmount: '0.00000000',
  //       holdingProfit: 0,
  //       holdingLoss: 0,
  //       buySelected: true,
  //       sellSelected: false
  //     });
  //   }
  // }
});
