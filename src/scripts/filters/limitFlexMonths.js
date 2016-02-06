angular.module('financier').filter('limitFlexMonths', function() {
  return (arr, limit) => {
    return angular.isArray(arr) ? arr.slice(0, limit) : arr;
  };
});
