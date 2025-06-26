import Ember from 'ember';
export function multiply([a, b]){
    return (parseFloat(a) * parseFloat(b)).toFixed(2)
} 
export default Ember.Helper.helper(multiply);