// We store currency as int -- $1.50 = 150
// Divide by 100

angular.module("financier").filter("intCurrency", () => {
  return (val, zero = true, decimal_digits = 2) => {
    if (angular.isNumber(val) && !isNaN(val)) {
      if (!zero && val === 0) {
        return null;
      }
      return (val / Math.pow(10, decimal_digits)).toFixed(decimal_digits);
    } else {
      return val;
    }
  };
});
