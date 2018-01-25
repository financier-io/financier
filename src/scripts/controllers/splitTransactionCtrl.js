angular.module('financier').controller('splitTransactionCtrl', function ($scope) {
  $scope.transactionIndex = $scope.$index;
  $scope.transactionVsIndex = $scope.startIndex;

  $scope.$watch('startIndex', startIndex => {
    this.vsIndex = startIndex;
  });

  $scope.$watch('$index', $index => {
    this.index = $index;
  });
});
