import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(){
      localStorage.removeItem('email');
      localStorage.removeItem('token');
          localStorage.removeItem('sortField');
  localStorage.removeItem('sortOrder');
  localStorage.removeItem('itemsPerPage');

  },
      resetController(controller, isExiting) {
    if (isExiting) {
      
      controller.set('username', '');
      controller.set('password', '');
      controller.set('status','');
    }
  }
   
//   ,
//   actions: {
//   save() {
//     console.log('Route: save');
//   }
// }
});
