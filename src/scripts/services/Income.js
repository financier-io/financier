angular.module('financier').factory('Income', (Transaction) => {
  return class Income extends Transaction {};
});
