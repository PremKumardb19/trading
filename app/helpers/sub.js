import Ember from 'ember';
export function sub([a, b]){
   return (parseFloat(a) - parseFloat(b)).toFixed(8)
}
    
export default Ember.Helper.helper(sub);