angular.module('financier').directive('serviceWorkerStatus', (offline, $timeout) => {
  return {
    restrict: 'E',
    scope: false,
    templateUrl: 'scripts/directives/serviceWorkerStatus.html'
  };
});
