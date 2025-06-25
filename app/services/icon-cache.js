import Ember from 'ember';

export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    this.set('availableIcons', new Set([
      'btc', 'eth', 'usdt', 'xrp', 'bnb', 'sol', 'usdc', 'trx', 'doge', 'ada', 'wbtc', 'bch',
      'leo', 'link', 'xlm', 'avax', 'ltc', 'xmr', 'dai', 'dot', 'uni', 'aave', 'icp', 'etc',
      'vet', 'algo', 'fil', 'kcs', 'grt', 'theta', 'sand', 'nexo', 'paxg', 'qnt', 'stx', 'crv',
      'btt', 'zec', 'atom', 'matic'
    ]));
  },

  getIconUrl(symbol) {
    let key = (symbol || '').toLowerCase();
    return this.availableIcons.has(key)
      ? `/icons/${key}.png`
      : '/icons/eth.png';
  }
});
