angular.module('financier').controller('bulkEditTransactionsCtrl', function($scope) {
  this.removeAll = () => {
    console.log('Remove all');

    $scope.close();
  };
});
