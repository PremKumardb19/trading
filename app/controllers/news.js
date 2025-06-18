import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    logout() {
      localStorage.removeItem("email");
      this.transitionToRoute('login');
    },
  }
});
