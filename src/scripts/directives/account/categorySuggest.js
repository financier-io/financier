import moment from 'moment';

angular.module('financier').directive('categorySuggest', $rootScope => {
  return {
    restrict: 'E',
    scope: {
      categories: '=',
      ngModel: '=',
      transactionDate: '='
    },
    template: '<autosuggest on-submit="onSubmit()" custom-filter="categoryFilter(item, searchValue, pristineInputField)" ng-model="item" items="items" template="template"></autosuggest>',
    compile: () => {
      return {
        pre: (scope, element, attrs) => {
          scope.incomes = [{
            name: '',
            id: 'income'
          }, {
            name: '',
            id: 'incomeNextMonth'
          }];

          scope.$watch('transactionDate', (newDate, oldDate) => {
            scope.incomes[0].name = `Income for ${moment(scope.transactionDate).format('MMMM')}`;
            scope.incomes[1].name = `Income for ${moment(scope.transactionDate).add(1, 'month').format('MMMM')}`;

            // Don't needlessly trigger upon init
            if (oldDate !== newDate) {
              // Only trigger if income is selected
              if (scope.incomes.indexOf(scope.item) !== -1) {
                scope.$broadcast('autosuggest:updateText');
              }
            }
          });

          // flatten categories
          scope.items = [].concat.apply(
            [],
            scope.categories.map(masterCategory => masterCategory.categories)
          );

          scope.items = scope.incomes.concat(scope.items);

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

          scope.getCategoryBalance = (categoryId, date) => {
            const month = scope.$parent.accountCtrl.manager.getMonth(date);

            const categoryCache = month.categoryCache[categoryId];

            if (categoryCache) {
              return month.categoryCache[categoryId].balance;
            }

            return 0;
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

          scope.template = require('./categorySuggest.html');
        }
      };
    }

  };
});
