/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'trading-app',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
      ENV.contentSecurityPolicy = {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
    'style-src': "'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    'connect-src': "'self' http://localhost:1010 https://api.coingecko.com",
    'img-src': "'self' data: https:",
    'font-src': "'self' https://fonts.googleapis.com https://fonts.gstatic.com",
  };
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
  ENV.baseURL = '/';
  ENV.locationType = 'none';
  ENV.APP.LOG_ACTIVE_GENERATION = false;
  ENV.APP.LOG_VIEW_LOOKUPS = false;
  ENV.APP.rootElement = '#ember-testing';

  ENV.contentSecurityPolicy = {
    'report-uri': null
  };
}

  if (environment === 'production') {

  }

  return ENV;
};
