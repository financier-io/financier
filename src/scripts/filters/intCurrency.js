// We store currency as int -- $1.50 = 150
// Divide by 100

angular.module('financier').filter('intCurrency', ($filter) => {
  return (val, zero = true) => {
    if (angular.isNumber(val) && !isNaN(val)) {
      if (!zero && val === 0) {
        return null;
      }
      return (val / 100).toFixed(2);
    } else {
      return val;
    }
  };
});
