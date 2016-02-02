// We store currency as int -- $1.50 = 150
// Divide by 100

angular.module('financier').filter('intCurrency', ($filter) => {
  return (val) => {
    if (angular.isNumber(val) && !isNaN(val)) {
      return (val / 100).toFixed(2);
    } else {
      return val;
    }
  };
});