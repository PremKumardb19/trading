import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(){
    if(localStorage.getItem('email') && localStorage.getItem('token')){
      localStorage.removeItem('email');
      localStorage.removeItem('token');
          localStorage.removeItem('sortField');
  localStorage.removeItem('sortOrder');
  localStorage.removeItem('itemsPerPage');
    }
  },
      resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('username', '');
      controller.set('email', '');
      controller.set('password','');
    }
  }
});
