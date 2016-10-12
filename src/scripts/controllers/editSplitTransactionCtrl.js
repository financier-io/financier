angular.module('financier').controller('editSplitTransactionCtrl', function($scope) {
  $scope.$watchCollection(() => {
    const amount = $scope.transactionCtrl.value.value - $scope.transactionCtrl.splits.reduce((prev, current) => {
      return prev + current.value;
    }, 0);

    let inflow = 0, outflow = 0;

    if (amount < 0) {
      outflow = Math.abs(amount);
    } else {
      inflow = amount;
    }

    return [inflow, outflow];
  }, ([inflow, outflow]) => {
    this.inflow = inflow;
    this.outflow = outflow;
  });
})
