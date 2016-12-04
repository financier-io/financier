angular.module('financier').controller('sidebarCtrl', function($scope) {
  $scope.$on('angular-resizable.resizeEnd', (e, { width }) => {
    localStorage.setItem('sidebarWidth', width);
  });
})
