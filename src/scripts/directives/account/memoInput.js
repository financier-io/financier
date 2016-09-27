angular.module('financier').directive('memoInput', $rootScope => {
  return {
    restrict: 'E',
    scope: {
      ngModel: '='
    },
    template: '<input type="text" ng-model="ngModel"></input>',
    compile: () => {
      return {
        pre: (scope, element, attrs) => {
          const input = element.find('input');

          scope.$on('transaction:memo:focus', () => {
            element.find('input')[0].focus()
          });

          input.on('keydown', e => {
            if (e.which === 13) { // enter
              $rootScope.$broadcast('transaction:outflow:focus');
            }
          });
        }
      };
    }

  };
});
