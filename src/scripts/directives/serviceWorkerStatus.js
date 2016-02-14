angular.module('financier').directive('serviceWorkerStatus', offline => {
  function controller() {
    if (offline) {
      this.status = 'downloading';

      offline.then(() => {
        this.status = 'cached';
      }).catch(() => {
        this.status = 'cached';
      });
    } else {
      this.status = 'unsupported';
    }
  }

  return {
    restrict: 'E',
    controller,
    controllerAs: 'serviceWorkerStatus',
    templateUrl: 'scripts/directives/serviceWorkerStatus.html'
  };
});
