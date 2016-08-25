angular.module('financier').directive('outflowInput', $rootScope => {
  return {
    restrict: 'E',
    scope: {
      ngModel: '='
    },
    template: '<input type="text" transaction-value ng-model="ngModel">',
    compile: () => {
      return {
        pre: (scope, element, attrs) => {
          const input = element.find('input');

          scope.$on('transaction:outflow:focus', () => {
            input[0].focus()
          });

          input.on('keydown', e => {
            if (e.which === 13) { // enter
              scope.$emit('submit');
              $rootScope.$apply();
            }
          });
        }
      };
    }

  };
});
