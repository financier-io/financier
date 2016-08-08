angular.module('financier').controller('budgetCtrl', function($filter, $stateParams, $rootScope, $timeout, $scope, month) {
  const Month = month($stateParams.budgetId);

  this.showMonths = 0;
  $rootScope.$on('budget:columns', (event, months) => {
    this.showMonths = (months >= 5 ? 5 : months) || 1;
  });

  $scope.categorySortable = {
    animation: 200,
    group: 'categories',
    ghostClass: 'budget__month-row--ghost',
    onSort: e => {
      // wait for the array to update
      $timeout(() => {
        e.models.update();
      });
    }
  };

  $scope.masterCategorySortable = {
    animation: 200,
    ghostClass: 'budget__month-row--ghost',
    onSort: e => {
      for (let i = 0; i < e.models.length; i++) {
        e.models[i].sort = i;
      }
    }
  };

  this.currentMonth = Month.createID(new Date());

  const lastMonthFilter = $filter('lastMonth'),
    dateFilter = $filter('date');

  this.translationPayloads = {
    currentMonth(date) {
      return {
        month: dateFilter(date, 'MMM')
      };
    },
    lastMonth(date) {
      return {
        month: dateFilter(lastMonthFilter(date), 'MMM')
      };
    }
  }
});
