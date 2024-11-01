import moment from "moment";
import categorySuggestHtml from "./categorySuggest.html?raw";

angular
  .module("financier")
  .directive("categorySuggest", ($rootScope, $filter, $translate) => {
    const dateFilter = $filter("date");

    return {
      restrict: "E",
      scope: {
        categories: "=",
        masterCategories: "=",
        ngModel: "=",
        transactionDate: "=",
        ngDisabled: "=",
      },
      template:
        '<autosuggest ng-disabled="ngDisabled" on-submit="onSubmit()" custom-filter="categoryFilter(item, searchValue, pristineInputField)" ng-model="item" items="items" template="template"></autosuggest>',
      compile: () => {
        return {
          pre: (scope, element, attrs) => {
            scope.disableSplit = angular.isDefined(attrs.disableSplit);

            scope.splits = [
              {
                name: $translate.instant("MULTIPLE_CATEGORIES"),
                id: "split",
              },
            ];

            scope.incomes = [
              {
                name: "",
                id: "income",
              },
              {
                name: "",
                id: "incomeNextMonth",
              },
            ];

            scope.$watch("transactionDate", (newDate, oldDate) => {
              scope.incomes[0].name = $translate.instant("INCOME_FOR", {
                month: dateFilter(scope.transactionDate || new Date(), "LLLL"),
              });

              scope.incomes[1].name = $translate.instant("INCOME_FOR", {
                month: dateFilter(
                  moment(scope.transactionDate || new Date())
                    .add(1, "month")
                    .toDate(),
                  "LLLL",
                ),
              });

              // Don't needlessly trigger upon init
              if (oldDate !== newDate) {
                // Only trigger if income is selected
                if (scope.incomes.indexOf(scope.item) !== -1) {
                  scope.$broadcast("autosuggest:updateText");
                }
              }
            });

            // flatten categories
            scope.items = [].concat.apply(
              [],
              Object.keys(scope.masterCategories)
                .sort(
                  (a, b) =>
                    scope.masterCategories[a].sort -
                    scope.masterCategories[b].sort,
                )
                .map((id) => scope.masterCategories[id].categories),
            );

            scope.masterCategoriesArr = Object.keys(scope.masterCategories)
              .map((id) => scope.masterCategories[id])
              .sort((a, b) => a.sort - b.sort);

            scope.items = scope.incomes.concat(scope.items);

            if (!scope.disableSplit) {
              scope.items = scope.splits.concat(scope.items);
            }

            let setByParent = false,
              firstRun = true;

            scope.$watch("ngModel", () => {
              for (let i = 0; i < scope.items.length; i++) {
                if (scope.items[i].id === scope.ngModel) {
                  if (!scope.item || scope.ngModel !== scope.item.id) {
                    if (!firstRun) {
                      setByParent = true;
                    } else {
                      firstRun = true;
                    }
                  }

                  scope.item = scope.items[i];
                }
              }
            });

            scope.$watch("item", (newItem, oldItem) => {
              if (newItem !== oldItem) {
                if (scope.ngModel !== newItem.id) {
                  setByParent = false;
                }

                scope.ngModel = newItem.id;
              }
            });

            scope.categoryFilter = (item, searchInput, pristineInputField) => {
              if (pristineInputField || setByParent) {
                return true;
              }

              const searchInputLower = searchInput.toLowerCase();

              for (let id in scope.masterCategories) {
                if (
                  scope.masterCategories.hasOwnProperty(id) &&
                  scope.masterCategories[id].categories.indexOf(
                    name.id || name,
                  ) !== -1
                ) {
                  if (
                    scope.masterCategories[id].name &&
                    scope.masterCategories[id].name
                      .toLowerCase()
                      .indexOf(searchInputLower) !== -1
                  ) {
                    return true;
                  }
                }
              }

              if (angular.isString(item)) {
                return (
                  scope.categories[item] &&
                  scope.categories[item].name
                    .toLowerCase()
                    .indexOf(searchInputLower) !== -1
                );
              }

              return (
                item.name &&
                item.name.toLowerCase().indexOf(searchInputLower) !== -1
              );
            };

            scope.getCategoryBalance = (categoryId, date) => {
              const month = scope.$parent.accountCtrl.manager.getMonth(
                date || new Date(),
              );

              const categoryCache = month.categoryCache[categoryId];

              if (categoryCache) {
                return month.categoryCache[categoryId].balance;
              }

              return 0;
            };

            scope.onSubmit = () => {
              $rootScope.$broadcast("transaction:memo:focus", {
                index: scope.$parent.splitIndex,
              });
            };

            scope.$on("transaction:category:focus", (e, { index } = {}) => {
              if (index === scope.$parent.splitIndex) {
                if (scope.ngDisabled) {
                  scope.onSubmit();
                } else {
                  scope.$broadcast("focus");
                }
              }
            });

            scope.template = categorySuggestHtml;
          },
        };
      },
    };
  });
