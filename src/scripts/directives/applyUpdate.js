angular.module('financier').directive('applyUpdate', offline => {
  let show = false;

  function controller($scope) {
    this.show = show;

    $scope.$on('serviceWorker:updateReady', () => {
      show = true;
      this.show = true;
    });

    this.close = () => {
      this.show = false;
      show = false;
    };

    this.applyUpdate = () => {
      offline.applyUpdate();

      this.show = false;
      show = false;
    }
  }

  return {
    restrict: 'E',
    template: require('./applyUpdate.html'),
    controller,
    replace: true,
    controllerAs: 'applyUpdateCtrl'
  };
});
