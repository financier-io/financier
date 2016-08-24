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
          scope._accounts = scope.accounts;
          scope._payees = scope.payees;

          scope.items = scope._accounts.concat(scope._payees);

          scope.$watch('transactionAccountId', () => {
            scope.$broadcast('autosuggest:filter');
          });

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


          scope.$watch('item', item => {
            scope.ngModel = item;
          });

          scope.onSubmit = () => {
            if (scope.item.constructor.name === 'Account') {
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
