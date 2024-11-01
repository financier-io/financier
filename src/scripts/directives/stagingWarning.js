import stagingWarningHtml from "./stagingWarning.html?raw";

angular.module("financier").directive("stagingWarning", () => {
  let show;

  function controller() {
    const isStaging = location.hostname.indexOf("staging") > -1;
    this.show = angular.isDefined(show) ? show : isStaging;

    this.close = () => {
      this.show = false;
      show = false;
    };
  }

  return {
    restrict: "E",
    template: stagingWarningHtml,
    controller,
    replace: true,
    controllerAs: "stagingWarningCtrl",
  };
});
