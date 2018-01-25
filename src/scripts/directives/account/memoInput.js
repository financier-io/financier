angular.module('financier').directive('memoInput', $rootScope => {
  return {
    restrict: 'E',
    scope: {
      ngModel: '=',
      category: '='
    },
    template: '<input type="text" ng-model="ngModel"></input>',
    compile: () => {
      return {
        pre: (scope, element) => {
          const input = element.find('input');

          scope.$on('transaction:memo:focus', (e, { index } = {}) => {
            if (index === scope.$parent.splitIndex) {
              element.find('input')[0].focus();
            }
          });

          input.on('keydown', e => {
            if (e.which === 13) { // enter
              if (scope.category && scope.category.indexOf('income') !== -1) {
                $rootScope.$broadcast('transaction:inflow:focus', { index: scope.$parent.splitIndex });
              } else {
                $rootScope.$broadcast('transaction:outflow:focus', { index: scope.$parent.splitIndex });
              }
            }
          });
        }
      };
    }

  };
});
