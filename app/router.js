import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('register');
  this.route('register',{path:'/'});
  this.route('login');
  this.route('dashboard');
  this.route('crypto', { path: '/crypto/:id' });
  this.route('funding');
  this.route('news');
  this.route('converter');
});

export default Router;
