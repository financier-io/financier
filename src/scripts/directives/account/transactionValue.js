angular.module('financier').directive('transactionValue', $filter => {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: (scope, element, attrs, ngModelCtrl) => {
      const currencyFilter = $filter('currency');

      //format text going to user (model to view)
      ngModelCtrl.$formatters.push(function(value) {
        if (!value) {
          return null;
        }

        return currencyFilter(value / 100, '');
      });

      //format text from the user (view to model)
      ngModelCtrl.$parsers.push(function(value) {

        const num = +value.replace(/,/g,'');

        if (isNaN(num)) {
          return 0;
        }

        return num * 100;
      });
    }
  };
});
