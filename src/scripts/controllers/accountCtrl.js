angular.module('financier').controller('accountCtrl', function($stateParams, data) {
  const {manager, categories} = data;

  this.accountId = $stateParams.accountId;

  if ($stateParams.accountId) {
    this.account = manager.getAccount($stateParams.accountId);
  } else {
    this.account = manager.allAccounts;
  }

  this.transactions = manager.transactions;

  this.isOpen = account => !account.closed;

  this.totalDisplayed = 100;

  this.viewMore = function() {
    this.totalDisplayed += 100;
  };

});
