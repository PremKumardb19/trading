import Ember from 'ember';

export default Ember.Controller.extend({
  chart: null,
  pollinginterval: null,

  startPolling() {
    this.fetchCryptos();
    if (!this.pollinginterval) {
      this.pollinginterval = setInterval(() => this.fetchCryptos(), 2000);
    }
  },

  stopPolling() {
    if (this.pollinginterval) {
      clearInterval(this.pollinginterval);
      this.pollinginterval = null;
    }
  },
   
  isNegative(value) {
    return parseFloat(value) < 0;
  },

  fetchCryptos() {
    Ember.$.getJSON("http://localhost:1010/trading-backend/all-crypto", (response) => {
      if (!Array.isArray(response)) {
        console.warn("Response not ready:", response);
        return;
      }

      this.set("model.cryptos", response.map(c => ({
        id: c.id,
        name: c.name,
        priceUsd: parseFloat(c.priceUsd).toFixed(2),
        changePercent24Hr: parseFloat(c.changePercent24Hr).toFixed(2),
        symbol: c.symbol.toLowerCase()
      })));
    });
  },

  actions: {
    logout() {
      localStorage.removeItem("email");
      this.transitionToRoute('login');
    },
    goToCrypto(id, price, changePercent) {
      alert(`Navigating to: ${id}\nPrice: $${price}\nChange: ${changePercent}%`);
      this.transitionToRoute('crypto', id, {
        queryParams: {
          price: price,
          change: changePercent
        }
      });
    },
  }
});
