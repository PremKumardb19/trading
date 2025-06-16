import Ember from 'ember';

export default Ember.Controller.extend({
  amount: '',
  status: '',

  init() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, function () {
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

      const email = localStorage.getItem("email");
      const amount = this.get('amount');

      if (!email || !amount) {
        this.set('status', 'Email or amount missing.');
        return;
      }

      fetch('http://localhost:1010/trading-backend/funding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
