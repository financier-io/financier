angular.module('financier').controller('budgetCtrl', function($stateParams, $rootScope, $scope, month) {
  const Month = month($stateParams.budgetId);

  this.showMonths = 0;
  $rootScope.$on('budget:columns', (event, months) => {
    this.showMonths = (months >= 5 ? 5 : months) || 1;
  });

  $scope.categorySortable = {
    animation: 200,
    group: 'categories',
    ghostClass: 'budget__month-row--ghost'
  };

  $scope.masterCategorySortable = {
    animation: 200,
    ghostClass: 'budget__month-row--ghost'
  };

  this.currentMonth = Month.createID(new Date());
});
