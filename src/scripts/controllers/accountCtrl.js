angular.module('financier').controller('accountCtrl', function(myBudgeter, $rootScope, $scope, $state, $stateParams, myBudget) {
  // this.accountId = $stateParams.accountId;

  // The first load, to prevent flickering
  // this.accounts = myAccounts;

  // const getAccounts = () => {
  //   return myBudget.accounts.all()
  //   .then(accounts => {
  //     this.accounts = accounts;
  //     $scope.$apply();
  //   });
  // };

  // const getTransactions = () => {
  //   return myBudget.transactions.all()
  //   .then(transactions => {
  //     this.calculateTransactionTotals(transactions);
  //     $scope.$apply();
  //   });
  // };

  // const calculateTransactionTotals = transactions => {
  //   this.accountTotals = {};
  //   this.total = 0;

  //   for (let i = 0; i < transactions.length; i++) {
  //     if (!this.accountTotals[transactions[i].account]) {
  //       this.accountTotals[transactions[i].account] = 0;
  //     }

  //     this.accountTotals[transactions[i].account] += transactions[i].value;
  //     this.total += transactions[i].value;
  //   }
  // };

  // $rootScope.$on('accounts:update', () => {
  //   getAccounts();
  // });

  // $rootScope.$on('transactions:update', () => {
  //   getTransactions();
  // });

  // this.remove = account => {
  //   account.remove();

  //   $scope.$apply();
  // };

  // this.edit = (e, account) => {
  //   e.stopPropagation();

  //   $state.go('app.db.account.edit');
  // };

  // this.isOpen = account => !account.closed;

  // this.transactions = [];
  // this.totalDisplayed = 100;

  // this.viewMore = function() {
  //   this.totalDisplayed += 100;
  // };

});
