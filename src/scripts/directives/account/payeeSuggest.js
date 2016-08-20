angular.module('financier').directive('payeeSuggest', $rootScope => {
  return {
    restrict: 'E',
    scope: {
      accounts: '=',
      payees: '=',
      transactionAccountId: '=',
      ngModel: '='
    },
    template: '<autosuggest can-submit-new="true" on-submit="onSubmit()" custom-filter="itemFilter(item, searchValue, pristineInputField)" ng-model="item" items="items" template="template"></autosuggest>',
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

          scope._payees = scope.payees.toArray().map(payeeName => {
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
            if (scope.ngModel.type === 'TRANSFER' &&
                scope.ngModel.id === scope.items[i].id) {
              scope.item = scope.items[i];
            } else if (scope.ngModel.type !== 'TRANSFER' &&
                       scope.items[i].name === scope.ngModel.name) {
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
              if (angular.isString(newItem)) {
                if (scope.ngModel.name !== newItem) {
                  scope.ngModel = {
                    type: 'INLINE',
                    name: newItem
                  };
                }
              } else {
                if (newItem.id && scope.ngModel.id !== newItem.id) {
                  scope.ngModel = newItem;
                } else if (scope.ngModel.name !== newItem.name) {
                  scope.ngModel = newItem;
                }
              }
            }
          });

          scope.onSubmit = () => {
            if (scope.item.type === 'TRANSFER') {
              $rootScope.$broadcast('transaction:memo:focus');
            } else {
              $rootScope.$broadcast('transaction:category:focus');
            }
          };

          scope.$on('transaction:payee:focus', () => {
            element.find('input')[0].focus();
            scope.$broadcast('focus');
          });

          scope.template = require('./payeeSuggest.html');
        }
      };
    }

  };
});
