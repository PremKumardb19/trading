import Ember from 'ember';

export default Ember.Controller.extend({
  chart: null,
  pollinginterval: null,
topGainer: Ember.computed('model.cryptos', function () {
  return this.model.cryptos
    .map(c => ({ ...c, change: parseFloat(c.changePercent24Hr) }))
    .sortBy('change')
    .reverse()[0];
}),
topTrending: Ember.computed('model.cryptos', function () {
    let cryptos = this.get('model.cryptos') || [];
    return cryptos
      .slice()
      .sort(function (a, b) {
        return parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr);
      })
      .slice(0, 10); 
  }),

topLoser: Ember.computed('model.cryptos', function () {
  return this.model.cryptos
    .map(c => ({ ...c, change: parseFloat(c.changePercent24Hr) }))
    .sortBy('change')[0];
}),
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
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found. Redirecting to login.");
      this.transitionToRoute('login');
      return;
    }

    Ember.$.ajax({
      url: "http://localhost:1010/trading-backend/all-crypto",
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      success: (response) => {
        if (!Array.isArray(response)) {
          console.warn("Response not ready:", response);
          return;
        }

        this.set("model.cryptos", response.map(c => ({
          id: c.id,
          name: c.name,
          priceUsd: parseFloat(c.priceUsd).toFixed(2),
          changePercent24Hr: parseFloat(c.changePercent24Hr).toFixed(2),
          symbol: c.symbol.toLowerCase(),
          iconUrl: `https://cryptoicon-api.pages.dev/api/icon/${c.symbol && typeof c.symbol === 'string' ? c.symbol.toLowerCase() : ''}`
        })));
      },
      error: (xhr) => {
        console.error("Failed to fetch cryptos:", xhr.responseText);
        if (xhr.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          this.transitionToRoute('login');
        }
      }
    });
  },

  actions: {
    
    logout() {
      localStorage.removeItem("email");
      localStorage.removeItem("token");
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
