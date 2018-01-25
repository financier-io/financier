angular.module('financier').controller('reportCtrl', function ($scope) {
  this.transactions = $scope.dbCtrl.manager.allAccounts.transactions;

  this.startDate = -Infinity;
  this.endDate = Infinity;

  $scope.$watchCollection(() => [this.startDate, this.endDate], ([startDate, endDate]) => {
    // Recalculate charts

    this.transactions = $scope.dbCtrl.manager.allAccounts.transactions.filter(t => {
      return t.date >= startDate && t.date <= endDate;
    });
  });
});
