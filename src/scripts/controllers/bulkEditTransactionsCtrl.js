angular.module('financier').controller('bulkEditTransactionsCtrl', function($scope) {
  this.removeAll = transactions => {
    transactions.forEach(transaction => {
      $scope.manager.removeTransaction(transaction);
      
      transaction.remove();
      transaction.subscribe(null);
    });

    $scope.close();
  };
});
