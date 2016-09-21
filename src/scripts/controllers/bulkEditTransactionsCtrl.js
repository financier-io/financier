angular.module('financier').controller('bulkEditTransactionsCtrl', function($rootScope, $scope, ngDialog) {
  this.removeAll = (transactions, event) => {
    $scope.stopPropagation(event);

    const reconciled = transactions.reduce((prev, curr) => {
      return prev + (curr.reconciled ? 1 : 0);
    }, 0);

    if (reconciled) {
      const scope = $rootScope.$new({});
      scope.reconciled = reconciled;
      scope.length = transactions.length;
      scope.stopPropagation = $scope.stopPropagation;

      ngDialog.openConfirm({
        template: require('../../views/modal/removeTransactionsConfirm.html'),
        scope,
        className: 'ngdialog-theme-default ngdialog-theme-default--danger modal'
      })
      .then(remove);
    } else {
      remove();
    }

    function remove() {
      transactions.forEach(transaction => {
        $scope.manager.removeTransaction(transaction);
        
        if (transaction.payee) {
          removePayee(transaction);
        }

        transaction.remove();
      });

      $scope.close();
    }
  };

  function removePayee(transaction) {
    const transactions = $scope.manager.allAccounts.transactions;

    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].payee === transaction.payee &&
          transactions[i] !== transaction) {
        return;
      }
    }

    if (!$scope.payees[transaction.payee].internal) {
      $scope.payees[transaction.payee].remove();
      delete $scope.payees[transaction.payee];
    }
  }
});
