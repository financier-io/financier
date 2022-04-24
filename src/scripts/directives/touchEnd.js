angular.module("financier").directive("touchEnd", () => {
  return function (scope, element, attr) {
    element.on("touchend", () => {
      scope.$apply(() => {
        scope.$eval(attr.touchEnd);
      });
    });
  };
});
