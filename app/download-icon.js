const https = require('https');
const fs = require('fs');
const path = require('path');
const urlModule = require('url');

const coins = [
  'btc', 'eth', 'usdt', 'xrp', 'bnb', 'sol', 'usdc', 'trx', 'doge', 'steth', 'ada', 'wbtc',
  'hyperliquid', 'bch', 'sui', 'leo', 'link', 'weth', 'xlm', 'avax', 'ton', 'btcb', 'shib', 'ltc',
  'usde', 'hbar', 'xmr', 'dai', 'dot', 'bgb', 'uni', 'pepe', 'pi', 'aave', 'okb', 'tao', 'apt',
  'cro', 'icp', 'near', 'etc', 'ondo', 'mnt', 'gt', 'matic', 'trump', 'vet', 'kas', 'fdusd', 'asi',
  'atom', 'fil', 'ethena', 'rndr', 'algo', 'kcs', 'wld', 'arb', 'sei', 'qnt', 'kaia', 'jup', 'pyusd',
  'wbnb', 'tia', 'flr', 'bonk', 'inj', 'xdc', 'four', 'virtuals', 'fartcoin', 'xaut', 'stx', 'story',
  'op', 'sonic', 'paxg', 'nexo', 'grt', 'crv', 'jto', 'wif', 'usda', 'dexe', 'cake', 'imx', 'zec',
  'floki', 'ens', 'aero', 'theta', 'ldo', 'sand', 'bsv', 'gala', 'iota', 'btt', 'jasmy', 'pendle'
];

const ICONS_DIR = path.join(__dirname, 'icons');

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR);
}

function downloadIcon(symbol, callback) {
  const url = 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/' + symbol.toLowerCase() + '.png';
  const filePath = path.join(ICONS_DIR, symbol.toLowerCase() + '.png');

  https.get(url, (res) => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(' Downloaded ' + symbol);
          callback(null);
        });
      });
    } else {
      console.warn(`❌ Failed to download ${symbol} - HTTP status: ${res.statusCode}`);
      callback(true);
    }
  }).on('error', (err) => {
    console.warn(`❌ Failed to download ${symbol} - Error: ${err.message}`);
    callback(true);
  });
}

function downloadAll(coins) {
  var index = 0;

  function next() {
    if (index >= coins.length) {
      console.log('🎉 All done!');
      return;
    }
    const symbol = coins[index++];
    downloadIcon(symbol, () => {
      next(); // continue even if error occurs
    });
  }

  next();
}

downloadAll(coins);
