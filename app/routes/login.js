import Ember from 'ember';

export default Ember.Route.extend({
      resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('username', '');
      controller.set('password', '');
      controller.set('status','');
    }
  }
});
