angular.module('financier').directive('serviceWorkerStatus', (offline, $timeout) => {
  function controller($scope, $rootScope) {
    $scope.$on('serviceWorker', (e, status) => {
      $timeout(() => {
        this.status = status;
      });
    });

    offline.install();
  }

  return {
    restrict: 'E',
    controller,
    controllerAs: 'serviceWorkerStatus',
    templateUrl: 'scripts/directives/serviceWorkerStatus.html'
  };
});
