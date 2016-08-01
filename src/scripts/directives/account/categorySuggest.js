angular.module('financier').directive('categorySuggest', $rootScope => {
  return {
    restrict: 'E',
    scope: {
      categories: '=',
      ngModel: '='
    },
    template: '<autosuggest on-submit="onSubmit()" custom-filter="categoryFilter(item, searchValue, pristineInputField)" ng-model="item" items="items" template-url="templateUrl"></autosuggest>',
    compile: () => {
      return {
        pre: (scope, element, attrs) => {
          // flatten categories
          scope.items = [].concat.apply(
            [],
            scope.categories.map(masterCategory => masterCategory.categories)
          );

          for (let i = 0; i < scope.items.length; i++) {
            if (scope.items[i].id === scope.ngModel) {
              scope.item = scope.items[i];
            }
          }

          scope.$watch('item', (newItem, oldItem) => {
            if (newItem !== oldItem) {
              scope.ngModel = newItem.id;
            }
          });

          scope.categoryFilter = (item, searchInput, pristineInputField) => {
            if (pristineInputField) {
              return true;
            }

            const searchInputLower = searchInput.toLowerCase();
            for (let i = 0; i < scope.categories.length; i++) {
              if (scope.categories[i].categories.indexOf(item) !== -1) {
                if (scope.categories[i].name.toLowerCase().indexOf(searchInputLower) !== -1) {
                  return true;
                }
              }
            }

            return item.name.toLowerCase().indexOf(searchInputLower) !== -1;
          };

          scope.getCurrentBalance = categoryId => {
            const month = scope.$parent.accountCtrl.manager.getMonth(new Date());

            return month.categoryCache[categoryId].balance;
          };

          scope.onSubmit = () => {
            $rootScope.$broadcast('transaction:memo:submit');
          };

          scope.$on('transaction:category:focus', () => {
            scope.$broadcast('focus');
          });

          scope.filterCategoryPredicate = (masterCategory, userInput) => {
            const lowerUserInput = userInput.toLowerCase(),
                matchesMasterCategory = masterCategory.name.toLowerCase().indexOf(lowerUserInput) !== -1;
            return category => {
              return matchesMasterCategory || category.name.toLowerCase().indexOf(lowerUserInput) !== -1;
            };
          };

          scope.templateUrl = '/scripts/directives/account/categorySuggest.html';
        }
      };
    }

  };
});
