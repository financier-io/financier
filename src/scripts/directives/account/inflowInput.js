angular.module('financier').directive('inflowInput', $rootScope => {
  return {
    restrict: 'E',
    scope: {
      ngModel: '='
    },
    template: '<input type="text" transaction-value ng-model="ngModel">',
    compile: () => {
      return {
        pre: (scope, element) => {
          const input = element.find('input');

          scope.$on('transaction:inflow:focus', (e, { index } = {}) => {
            if (index === scope.$parent.splitIndex) {
              input[0].focus();
            }
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
