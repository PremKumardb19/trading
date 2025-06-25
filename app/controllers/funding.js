import Ember from 'ember';

export default Ember.Controller.extend({
  amount: '',
  status: '',

  init() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, () => {
      Ember.$('#fundingForm').on('submit', (event) => {
        this.send('submitFunding', event);
      });
    });
  },

  actions: {
    updateAmount(event) {
      this.set('amount', event.target.value);
    },

    submitFunding(event) {
      event.preventDefault();

      const email = localStorage.getItem('email');
      const token = localStorage.getItem('token');
      const amount = this.get('amount');

      if (!email || !amount || !token) {
        this.set('status', 'Email, amount, or token missing.');
        return;
      }

      fetch(`http://localhost:1010/trading-backend/wallet?action=funding&amount=${amount}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`
        },
        body: `email=${encodeURIComponent(email)}&amount=${encodeURIComponent(amount)}`
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            this.set('status', 'Funds added successfully!');
            this.transitionToRoute('dashboard');
          } else {
            this.set('status', 'Funding failed.');
          }
        })
        .catch(error => {
          this.set('status', 'Error: ' + error.message);
        });
    }
  }
});
