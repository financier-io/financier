angular.module('financier').controller('scheduledTransactionsCtrl', function($scope) {
  this.height = localStorage.getItem('scheduledTransactionsHeight');

  $scope.$on('angular-resizable.resizeEnd', (e, { height }) => {
    e.stopPropagation();

    localStorage.setItem('scheduledTransactionsHeight', height);
  });
})
