import { helper } from '@ember/component/helper';

export default helper(function lowercase([value]) {
  return value.toLowerCase();
});