import Ember from 'ember';

export default Ember.Controller.extend({
  username: '',
  email: '',
  password: '',

  init() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, function () {
      Ember.$('#registerForm').on('submit', (event) => {
        this.handleRegister(event);
      });
    });
  },

  handleRegister(event) {
    event.preventDefault();

    const username = this.get('username');
    const email = this.get('email');
    const password = this.get('password');

    if (!username || !email || !password) {
      alert('All fields are required!');
      return;
    }

    const payload = { username, email, password };
    

    fetch('http://localhost:1010/trading-backend/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success' && data.token) {
          localStorage.setItem("email", email);
          localStorage.setItem("token", data.token); 
          alert('Registration successful!');
          this.set('username', '');
          this.set('email', '');
          this.set('password', '');
          this.transitionToRoute('dashboard');
        } else {
          alert('Registration failed: ' + (data.message || 'Unknown error'));
        }
      })
      .catch((err) => {
        alert('Error connecting to backend: ' + err.message);
      });
  },
});
