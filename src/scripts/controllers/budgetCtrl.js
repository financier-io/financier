angular.module('financier').controller('budgetCtrl', function($rootScope, $scope) {
  this.showMonths = 0;
  $rootScope.$on('budget:columns', (event, months) => {
    this.showMonths = (months >= 5 ? 5 : months) || 1;
  });
});