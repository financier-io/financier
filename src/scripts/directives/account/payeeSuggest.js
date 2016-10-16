angular.module('financier').directive('payeeSuggest', $rootScope => {
  return {
    restrict: 'E',
    scope: {
      accounts: '=',
      payees: '=',
      transactionAccountId: '=',
      ngModel: '='
    },
    template: '<autosuggest can-submit-new="true" on-submit="onSubmit()" custom-filter="itemFilter(item, searchValue, pristineInputField)" ng-model="ngModel" items="items" template="template"></autosuggest>',
    compile: () => {
      return {
        pre: (scope, element, attrs) => {
          const byName = (a, b) => {
            var nameA = a.name.toUpperCase();
            var nameB = b.name.toUpperCase();

            return nameA > nameB;
          };


          scope._accounts = scope.accounts;
          scope._payees = Object.keys(scope.payees).map(key => {
            return scope.payees[key];
          })
          .sort(byName);

          scope.items = scope._accounts.sort(byName).concat(scope._payees);

          scope.$watch('transactionAccountId', () => {
            scope.$broadcast('autosuggest:filter');
          });

          scope.itemFilter = (item, searchInput, pristineInputField) => {
            if (item.autosuggest === false) {
              return false;
            }

            if (item.id === scope.transactionAccountId) {
              return false;
            }

            if (pristineInputField) {
              return true;
            }

            const searchInputLower = searchInput.toLowerCase();

            return item.name.toLowerCase().indexOf(searchInputLower) !== -1;
          };

          scope.onSubmit = () => {
            const account = scope.$parent.accountCtrl.manager.getAccount(scope.transactionAccountId);

            if (scope.ngModel.constructorName === 'Account' && (
                (scope.ngModel.onBudget && account.onBudget) ||
                (!scope.ngModel.onBudget && !account.onBudget)
              )) {
              $rootScope.$broadcast('transaction:memo:focus', { index: scope.$parent.splitIndex });
            } else {
              $rootScope.$broadcast('transaction:category:focus', { index: scope.$parent.splitIndex });
            }
          };

          scope.$on('transaction:payee:focus', (e, { index } = {}) => {
            if (index === scope.$parent.splitIndex) {
              element.find('input')[0].focus();
              scope.$broadcast('focus');
            }
          });

          scope.template = require('./payeeSuggest.html');
        }
      };
    }

  };
});
