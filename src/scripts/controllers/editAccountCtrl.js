angular.module('financier').controller('editAccountCtrl', function(myAccount, $q, $rootScope, $scope, $stateParams, myBudget, account) {
  this.account = myAccount;

  this.submit = () => {
    // TODO put the beginning transaction

    $q.all([
      myBudget.accounts.put(this.account)
      // todo the transaction here
    ])
    .then(() => {
      $rootScope.$broadcast('accounts:update');
      $scope.closeThisDialog();
    });

  };

});
