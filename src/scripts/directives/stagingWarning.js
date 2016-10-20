angular.module('financier').directive('stagingWarning', () => {
  let show;

  function controller() {
    const isStaging = true;
    this.show = angular.isDefined(show) ? show : isStaging;

    this.close = () => {
      this.show = false;
      show = false;
    };
  }

  return {
    restrict: 'E',
    template: require('./stagingWarning.html'),
    controller,
    replace: true,
    controllerAs: 'stagingWarningCtrl'
  };
});
