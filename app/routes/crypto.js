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

    return Promise.all([
      $.getJSON(`http://localhost:1010/trading-backend/candles?baseId=${baseId}&quoteId=tether`),
      $.getJSON("http://localhost:1010/trading-backend/all-crypto")
    ]).then(([candleData, allCryptos]) => {
      const crypto = allCryptos.find(c => c.id === baseId);
      if (!crypto) {
        return { error: "Crypto not found" };
      }

      return {
        baseId,
        details: {
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol,
          priceUsd: parseFloat(crypto.priceUsd).toFixed(2),
          changePercent24Hr: parseFloat(crypto.changePercent24Hr).toFixed(2),
        },
        candles: candleData
      };
    }).catch(err => {
      console.error("API fetch error:", err);
      return { error: "Failed to load data" };
    });
  },

  setupController(controller, model) {
    this._super(controller, model);

 
    Ember.run.scheduleOnce('afterRender', controller, 'setupChart');

    
    controller.fetchBalance();
    controller.fetchHoldings(model.baseId);
  },
  // resetController(controller, isExiting) {
  //   if (isExiting) {
  //     controller.set('chart', null);
  //     controller.set('amount', '');
  //     controller.set('tradeType','buy');
  //     controller.set('tradeStatus', '');
  //     controller.set('usdBalance','0.00');
  //     controller.set('holdingAmount','0.00000000');
  //     controller.set('holdingProfit',0);
  //     controller.set('holdingLoss',0);
  //     controller.set('buySelected',true);
  //     controller.set('sellSelected',false);
  //   }
  // }
});
