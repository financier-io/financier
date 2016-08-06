angular.module('financier').directive('payeeSuggest', $rootScope => {
  return {
    restrict: 'E',
    scope: {
      accounts: '=',
      payees: '=',
      transactionAccountId: '=',
      ngModel: '='
    },
    template: '<autosuggest on-submit="onSubmit()" custom-filter="itemFilter(item, searchValue, pristineInputField)" ng-model="item" items="items" template="template"></autosuggest>',
    compile: () => {
      return {
        pre: (scope, element, attrs) => {
          scope._accounts = scope.accounts.map(account => {
            return {
              id: account.id,
              type: 'TRANSFER',
              name: account.name
            };
          });

          scope._payees = scope.payees.map(payeeName => {
            return {
              name: payeeName,
              type: 'INLINE'
            };
          });

          scope.items = scope._accounts.concat(scope._payees);

          scope.$watch('transactionAccountId', () => {
            scope.$broadcast('autosuggest:filter');
          });

          for (let i = 0; i < scope.items.length; i++) {
            if (scope.items[i].id === scope.ngModel.id) {
              scope.item = scope.items[i];
            }
          }

          scope.itemFilter = (item, searchInput, pristineInputField) => {
            if (item.id === scope.transactionAccountId) {
              return false;
            }

            if (pristineInputField) {
              return true;
            }

            const searchInputLower = searchInput.toLowerCase();

            return item.name.toLowerCase().indexOf(searchInputLower) !== -1;
          };


          scope.$watch('item', (newItem, oldItem) => {
            if (newItem !== oldItem) {
              if (newItem.constructor.name === 'Account') {
                scope.ngModel = {
                  type: 'TRANSFER',
                  id: newItem.id
                };
              } else {
                scope.ngModel = newItem;
              }
            }
          });

          scope.onSubmit = () => {
            $rootScope.$broadcast('transaction:category:submit');
          };

          scope.$on('transaction:payee:focus', () => {
            scope.$broadcast('focus');
          });

          scope.template = require('./payeeSuggest.html');
        }
      };
    }

  };
});
