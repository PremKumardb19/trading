import Ember from 'ember';

export default Ember.Route.extend({
  activate() {
    window.addEventListener('beforeunload', this.clearTokenOnClose);
  },

  deactivate() {
    window.removeEventListener('beforeunload', this.clearTokenOnClose);
  },

  clearTokenOnClose() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('sortField');
  localStorage.removeItem('sortOrder');
  localStorage.removeItem('itemsPerPage');
  }
});
