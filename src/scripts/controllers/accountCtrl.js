angular.module('financier').controller('accountCtrl', function() {
  this.transactions = [];
  
  for (var i = 0; i < 30; i++) {
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

  this.transactionEdit = null;
  this.editTransaction = (t) => {
    this.transactionEdit = angular.copy(t);
  };



});