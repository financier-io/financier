angular.module("financier").directive("serviceWorkerStatus", () => {
  return {
    restrict: "E",
    scope: false,
    template: require("./serviceWorkerStatus.html").default,
  };
});
