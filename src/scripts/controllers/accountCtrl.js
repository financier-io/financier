angular.module('financier').controller('accountCtrl', function($scope, $stateParams) {
  if (!$stateParams.accountId) {
    console.log($scope.dbCtrl)
  }

  this.transactions = [];
  
  for (var i = 0; i < 300; i++) {
    this.transactions.push({
      account: 'HelloWorld',
      date: new Date(),
      payee: 'Alexander Harding',
      category: 'Food',
      memo: 'This is a test memo',
      outflow: 0,
      id: i
    });
  }

});
