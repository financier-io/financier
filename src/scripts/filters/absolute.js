angular.module('financier').filter('absolute', () => {
  return val => Math.abs(val);
});
