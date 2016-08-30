angular.module('financier').controller('bulkEditTransactionsCtrl', function($scope) {
  this.removeAll = transactions => {
    transactions.forEach(transaction => {
      $scope.manager.removeTransaction(transaction);
      
      if (transaction.payee) {
        removePayee(transaction);
      }

      transaction.remove();
    });

    $scope.close();
  };

  function removePayee(transaction) {
    const transactions = $scope.manager.allAccounts.transactions;

    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].payee === transaction.payee &&
          transactions[i] !== transaction) {
        return;
      }
    }

    $scope.payees[transaction.payee].remove();
    delete $scope.payees[transaction.payee];
  }
});
