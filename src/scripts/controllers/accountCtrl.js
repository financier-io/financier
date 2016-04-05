angular.module('financier').controller('accountCtrl', function(myAccounts, $rootScope, $scope, $state, $stateParams, myBudget) {
  this.accountId = $stateParams.accountId;

  // The first load, to prevent flickering
  this.accounts = myAccounts;


  this.transactions = [];
  this.totalDisplayed = 100;

  this.viewMore = function() {
    this.totalDisplayed += 100;
  };

  const getAccounts = () => {
    return myBudget.accounts.all()
    .then(accounts => {
      this.accounts = accounts;
      $scope.$apply();
    });
  };

  $rootScope.$on('accounts:update', () => {
    getAccounts();
  });

  this.remove = function(account) {
    account.remove();

    $scope.$apply();
  };

  this.edit = function(e, account) {
    e.stopPropagation();

    $state.go('app.db.account.edit');
  };

  this.isOpen = account => !account.closed;

});
