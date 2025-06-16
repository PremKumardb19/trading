import Ember from 'ember';

export default Ember.Controller.extend({
  username: '',
  password: '',
  status: '',

  init() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, function () {
      Ember.$('#loginForm').on('submit', (event) => {
        this.send('login', event);
      });
    });
  },

  actions: {
    login(event) {
      event.preventDefault(); 

      let self = this;

      Ember.$.ajax({
        url: 'http://localhost:1010/trading-backend/login',
        method: 'POST',
        data: {
          username: this.get('username'),
          password: this.get('password')
        },
        success(response) {
          if (response.status === "success") {
            localStorage.setItem("email", response.email || self.get('username')); 
            self.set('status', 'Login successful!');
            self.transitionToRoute('dashboard');
          } else {
            self.set('status', 'Login failed.');
          }
        },
        error(xhr) {
          self.set('status', 'Login error: ' + xhr.responseText);
        }
      });
    }
  }
});
