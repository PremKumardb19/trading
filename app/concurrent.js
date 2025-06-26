var http = require('http');
var querystring = require('querystring');

var tokens = {
  "bazi@gmail.com": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYXppQGdtYWlsLmNvbSIsImVtYWlsIjoiYmF6aUBnbWFpbC5jb20iLCJpYXQiOjE3NTA5Mjk1MTUsImV4cCI6MTc1MTAxNTkxNX0.VDm1ebHMXUQuUzpzVoNdCe_K0xWwJPrQvHOfnJYT9Uk",
  "pb@gmail.com": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYkBnbWFpbC5jb20iLCJlbWFpbCI6InBiQGdtYWlsLmNvbSIsImlhdCI6MTc1MDkyOTU3MCwiZXhwIjoxNzUxMDE1OTcwfQ.ZZS1O1P6zYOmwwCMAzu-2wMgoIwLePNXG-96me192x0",
  "register@reg.com": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZWdpc3RlckByZWcuY29tIiwiZW1haWwiOiJyZWdpc3RlckByZWcuY29tIiwiaWF0IjoxNzUwOTI5NTk0LCJleHAiOjE3NTEwMTU5OTR9.sFRljmbwSM_yQd2PnqcIBF9xuKkej9c1-Vl733NxSa8"
};


var cryptoId = "shiba-inu";
var cryptoName = "Shiba Inu"; 
var priceUsd = 0.000011568973869;
var amount =35000;
var type = "buy";
var http = require('http');
var querystring = require('querystring');

function sendTradeRequest(email, token) {
  var encodedEmail = querystring.escape(email);

  var tradeData = JSON.stringify({
    cryptoId: cryptoId,
    cryptoName: cryptoName,
    email: email,
    type: type,
    amount: amount,
    priceUsd: priceUsd,
    timestamp: new Date().toISOString()
  });

  var options = {
    hostname: 'localhost',
    port: 1010,
    path: '/trading-backend/trade?email=' + encodedEmail,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    }
  };

  var req = http.request(options, function(res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      try {
        var json = JSON.parse(data);
        console.log("Trade Response for " + email + ":", json);
      } catch (e) {
        console.error("Parse error for " + email + ":", e.message);
      }
    });
  });

  req.on('error', function(e) {
    console.error("Request error for " + email + ":", e.message);
  });

  req.write(tradeData);
  req.end();
}

for (var email in tokens) {
  if (tokens.hasOwnProperty(email)) {
    sendTradeRequest(email, tokens[email]);
  }
}
