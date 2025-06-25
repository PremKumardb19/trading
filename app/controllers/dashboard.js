import Ember from 'ember';

export default Ember.Controller.extend({
  init(){
    this._super(...arguments)
  const savedSortField = localStorage.getItem('sortField');
  const savedSortOrder = localStorage.getItem('sortOrder');
  const savedItemsPerPage = localStorage.getItem('itemsPerPage');

  if (savedSortField) this.set('sortField', savedSortField);
  if (savedSortOrder) this.set('sortOrder', savedSortOrder);
  if (savedItemsPerPage) this.set('itemsPerPage', parseInt(savedItemsPerPage));

  this.set('currentPage', 1);

  },
  iconCache: Ember.inject.service(),

  chart: null,
  pollinginterval: null,

  // Sorting & Pagination state
  sortField: 'name',
  sortOrder: 'asc',
  itemsPerPage: 10,
  currentPage: 1,

  // Sorting dropdown options
  sortDefinition: Ember.computed('sortField', 'sortOrder', function () {
    let field = this.get('sortField');
    let order = this.get('sortOrder');
    return [`${field}:${order}`];
  }),

  // Computed: apply sorting
  sortedCryptos: Ember.computed.sort('model.cryptos', 'sortDefinition'),

  // Computed: paged result
  pagedCryptos: Ember.computed('sortedCryptos.[]', 'currentPage', 'itemsPerPage', function () {
    let page = this.get('currentPage');
    let perPage = this.get('itemsPerPage');
    let start = (page - 1) * perPage;
    return this.get('sortedCryptos').slice(start, start + perPage);
  }),

  // Computed: pagination info
  totalPages: Ember.computed('sortedCryptos.length', 'itemsPerPage', function () {
    return Math.ceil(this.get('sortedCryptos.length') / this.get('itemsPerPage'));
  }),
  isFirstPage: Ember.computed.equal('currentPage', 1),
  isLastPage: Ember.computed('currentPage', 'totalPages', function () {
    return this.get('currentPage') >= this.get('totalPages');
  }),

  topGainer: Ember.computed('model.cryptos', function () {
    return this.get('model.cryptos')
      .map(c => ({ ...c, change: parseFloat(c.changePercent24Hr) }))
      .sortBy('change')
      .reverse()[0];
  }),

  topLoser: Ember.computed('model.cryptos', function () {
    return this.get('model.cryptos')
      .map(c => ({ ...c, change: parseFloat(c.changePercent24Hr) }))
      .sortBy('change')[0];
  }),

  topTrending: Ember.computed('model.cryptos', function () {
    var cryptos = this.get('model.cryptos') || [];
    return cryptos
      .slice()
      .sort((a, b) => parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr))
      .slice(0, 10);
  }),

  startPolling: function () {
    this.fetchCryptos();
    if (!this.pollinginterval) {
      this.set('pollinginterval', setInterval(() => this.fetchCryptos(), 2000));
    }
  },

  stopPolling: function () {
    if (this.pollinginterval) {
      clearInterval(this.pollinginterval);
      this.set('pollinginterval', null);
    }
  },

  isNegative: function (value) {
    return parseFloat(value) < 0;
  },

  fetchCryptos: function () {
    var token = localStorage.getItem("token");
    var email = localStorage.getItem("email");
    var iconCache = this.get('iconCache');

    if (!token || !email) {
      console.warn("No token or email found. Redirecting to login.");
      this.transitionToRoute('login');
      return;
    }

    Ember.$.ajax({
      url: `http://localhost:1010/trading-backend/fetch?action=crypto&email=${encodeURIComponent(email)}`,
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      },
      success: (response) => {
        if (!Array.isArray(response)) {
          console.warn("Response not ready:", response);
          return;
        }

        this.set("model.cryptos", response.map(function (c) {
          var symbol = (c.symbol && typeof c.symbol === 'string') ? c.symbol.toLowerCase() : '';
          var iconUrl = iconCache.getIconUrl(symbol);
          return {
            id: c.id,
            name: c.name,
            priceUsd: parseFloat(c.priceUsd),  
            priceFormatted: parseFloat(c.priceUsd).toFixed(2),
            changePercent24Hr: parseFloat(c.changePercent24Hr).toFixed(2),
            symbol: symbol,
            iconUrl: iconUrl,
            marketCap: c.marketCapUsd
          };
        }));
      },
      error: (xhr) => {
        console.error("Failed to fetch cryptos:", xhr.responseText);
        if (xhr.status === 401 || xhr.status === 403) {
          alert("Session expired or unauthorized. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("email");
          this.transitionToRoute('login');
        }
      }
    });
  },

  actions: {
    logout: function () {
      localStorage.removeItem("email");
      localStorage.removeItem("token");
      this.transitionToRoute('login');
    },

goToCrypto: function (crypto) {
  console.log("at goto crypto the obj is",crypto)
  const id = crypto.id;
  const price = crypto.priceUsd;
  const changePercent = crypto.changePercent24Hr;
  const marketCap = crypto.marketCap;

  alert("Navigating to: " + id + "\nPrice: $" + price + "\nChange: " + changePercent + "%");
  console.log("at goto crypto",marketCap)
  this.transitionToRoute('crypto', id, {
    queryParams: {
      price: price,
      change: changePercent,
      marketCap: marketCap
    }
  });
},

setSortField(field) {
  this.set('sortField', field);
  localStorage.setItem('sortField', field);
},

setSortOrder(order) {
  this.set('sortOrder', order);
  localStorage.setItem('sortOrder', order);
},

setItemsPerPage(count) {
  const num = parseInt(count);
  this.set('itemsPerPage', num);
  this.set('currentPage', 1);
  localStorage.setItem('itemsPerPage', num);
},

    nextPage() {
      if (!this.get('isLastPage')) {
        this.incrementProperty('currentPage');
      }
    },

    prevPage() {
      if (!this.get('isFirstPage')) {
        this.decrementProperty('currentPage');
      }
    }
  }
});
