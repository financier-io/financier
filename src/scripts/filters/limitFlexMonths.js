angular.module('financier').filter('limitFlexMonths', function() {
  return (arr, limit) => {
    return angular.isArray(arr) ? arr.slice(-limit) : arr;
  };
});