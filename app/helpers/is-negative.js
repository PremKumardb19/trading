import Ember from 'ember';

export function isNegative([value]) {
  return parseFloat(value) < 0;
}

export default Ember.Helper.helper(isNegative);
