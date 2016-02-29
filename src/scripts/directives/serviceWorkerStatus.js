angular.module('financier').directive('serviceWorkerStatus', () => {
  return {
    restrict: 'E',
    scope: false,
    templateUrl: 'scripts/directives/serviceWorkerStatus.html'
  };
});
