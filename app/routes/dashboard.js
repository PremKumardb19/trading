import Ember from 'ember';
import $ from 'jquery';

export default Ember.Route.extend({
  iconCache: Ember.inject.service(),

  beforeModel() {
    if (!localStorage.getItem('email')) {
      this.transitionTo('login');
    }
  },

  authAjax(url, options = {}) {
    const token = localStorage.getItem('token');
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${token}`;

    return $.ajax(url, options).fail((jqXHR) => {
      if (jqXHR.status === 401) {
        alert("crypto polling forbidden");
        this.transitionTo('login');
      }
      return Ember.RSVP.reject(jqXHR);
    });
  },
  
  model() {
    const email = localStorage.getItem('email');
    const iconCache = this.get('iconCache');

    return this.authAjax(`http://localhost:1010/trading-backend/fetch?action=crypto&email=${encodeURIComponent(email)}`, {
      method: 'GET'
    }).then((data) => {
      if (!Array.isArray(data)) {
        console.warn('Crypto data is not ready:', data);
        return { cryptos: [] };
      }

      const cryptos = data.map((c) => {
        const rawSymbol = typeof c.symbol === 'string' ? c.symbol : '';
        const iconUrl = iconCache.getIconUrl(rawSymbol);

        return {
          id: c.id,
          name: c.name,
          priceUsd: parseFloat(c.priceUsd),
          priceFormatted: parseFloat(c.priceUsd),
          changePercent24Hr: parseFloat(c.changePercent24Hr).toFixed(2),
          symbol: rawSymbol,
          iconUrl: iconUrl,
          marketCap: c.marketCapUsd
        };
      });

      return { cryptos };
    }).fail((error) => {
      console.error('Failed to load cryptos:', error);
      return { cryptos: [] };
    }); 
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('cryptos', model.cryptos);

    
  },

  activate() {
    this.controllerFor('dashboard').startPolling();
  },

  deactivate() {
    this.controllerFor('dashboard').stopPolling();
  }
});
