angular.module('financier').directive('accountSuggest', $rootScope => {
  return {
    restrict: 'E',
    scope: {
      accounts: '=',
      ngModel: '=',
      transactionPayeeId: '='
    },
    template: '<autosuggest custom-filter="itemFilter(item)" on-submit="onSubmit()" ng-model="item" items="items" template="template"></autosuggest>',
    compile: () => {
      return {
        pre: (scope, element, attrs) => {
          scope.items = [];

          scope.itemFilter = item => {
            if (item.account.id === scope.transactionPayeeId) {
              return false;
            }

            return true;
          };

          scope.$watch('transactionPayeeId', () => {
            scope.$broadcast('autosuggest:filter');
          });

          for (let i = 0; i < scope.accounts.length; i++) {
            scope.items.push({
              name: scope.accounts[i].name,
              account: scope.accounts[i]
            });

            if (scope.accounts[i].id === scope.ngModel) {
              scope.item = scope.items[scope.items.length - 1];
            }
          }

          scope.$watch('item', (newItem, oldItem) => {
            if (newItem !== oldItem) {
              scope.ngModel = newItem.account.id;
            }
          });

          scope.onSubmit = () => {
            $rootScope.$broadcast('transaction:account:submit');
          };

          scope.$on('transaction:account:focus', () => {
            scope.$broadcast('focus');
          });

          scope.template = require('./accountSuggest.html');
        }
      };
    }

  };
});
