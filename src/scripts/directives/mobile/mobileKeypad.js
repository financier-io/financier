angular.module('financier').directive('mobileKeypad', () => {
  return {
    restrict: 'E',
    require: 'ngModel',
    template: require('./mobileKeypad.html'),
    replace: true,
    scope: {
      onNext: '&'
    },
    link: (scope, element, attrs, ngModel) => {
      scope.addNumber = num => {
        let val = ngModel.$viewValue;

        val = (val * 10) + num

        ngModel.$setViewValue(val);
      }

      scope.removeNumber = () => {
        let val = ngModel.$viewValue;
        
        val = Math.floor(val / 10);

        ngModel.$setViewValue(val);
      }
    }
  }
});
