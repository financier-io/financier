import accountSuggestHtml from "./accountSuggest.html?raw";

angular.module("financier").directive("accountSuggest", ($rootScope) => {
  return {
    restrict: "E",
    scope: {
      onBudgetAccounts: "=",
      offBudgetAccounts: "=",
      closedAccounts: "=",
      ngModel: "=",
      transactionPayeeId: "=",
    },
    template:
      '<autosuggest custom-filter="itemFilter(item, searchValue)" on-submit="onSubmit()" ng-model="item" items="items" template="template"></autosuggest>',
    compile: () => {
      return {
        pre: (scope) => {
          scope.items = [];

          scope.itemFilter = (item) => {
            if (item.id === scope.transactionPayeeId) {
              return false;
            }

            if ((!scope.item || !scope.item.closed) && item.closed) {
              return false;
            }

            return true;
          };

          scope.$watch("transactionPayeeId", () => {
            scope.$broadcast("autosuggest:filter");
          });

          scope.items = scope.onBudgetAccounts
            .concat(scope.offBudgetAccounts)
            .concat(scope.closedAccounts);

          for (let i = 0; i < scope.items.length; i++) {
            if (scope.items[i].id === scope.ngModel) {
              scope.item = scope.items[i];
            }
          }

          scope.$watch("item", (newItem, oldItem) => {
            if (newItem !== oldItem) {
              scope.ngModel = newItem.id;
            }
          });

          scope.onSubmit = () => {
            $rootScope.$broadcast("transaction:date:focus");
          };

          scope.$on("transaction:account:focus", () => {
            scope.$broadcast("focus");
          });

          scope.template = accountSuggestHtml;
        },
      };
    },
  };
});
