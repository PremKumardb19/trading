import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    if (!localStorage.getItem('email')) {
      this.transitionTo('login');
    }
  },

  model() {
    return Ember.$.getJSON("http://localhost:1010/trading-backend/all-crypto").then(data => {
      if (!Array.isArray(data)) {
        console.warn("Crypto data is not ready:", data);
        return { cryptos: [] };
      }

      return {
        cryptos: data.map(c => {
          const rawSymbol = typeof c.symbol === 'string' ? c.symbol : '';
          const iconUrl = `https://cryptoicon-api.pages.dev/api/icon/${rawSymbol.toLowerCase()}`;
          
          return {
            id: c.id,
            name: c.name,
            priceUsd: parseFloat(c.priceUsd).toFixed(2),
            changePercent24Hr: parseFloat(c.changePercent24Hr).toFixed(2),
            symbol: rawSymbol,          
            iconUrl: iconUrl            
          };
        })
      };
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('cryptos', model.cryptos);

    let iconMap = {};
    model.cryptos.forEach(c => {
      iconMap[c.symbol] = c.iconUrl;
    });
    controller.set('iconMap', iconMap);
  },

  activate() {
    this.controllerFor('dashboard').startPolling();
  },

  deactivate() {
    this.controllerFor('dashboard').stopPolling();
  }
});
