import Ember from 'ember';

export default Ember.Route.extend({
     beforeModel() {
    if (!localStorage.getItem('email')) {
      this.transitionTo('login');
    }
  },
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('amount', '');
      controller.set('status', '');
    }
  }
});
