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
      .then((response) => {
        if (response.ok) {
          localStorage.setItem("email", email);
          alert('Registration successful!');
          this.set('username','');
          this.set('email','');
          this.set('password','');
          this.transitionToRoute('dashboard');
        } else {
          response.text().then((errorText) =>
            alert('Registration failed: ' + errorText)
          );
        }
      })
      .catch((err) => {
        alert('Error connecting to backend: ' + err.message);
      });
  },
});
