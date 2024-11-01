import serviceWorkerStatusHtml from "./serviceWorkerStatus.html?raw";

angular.module("financier").directive("serviceWorkerStatus", () => {
  return {
    restrict: "E",
    scope: false,
    template: serviceWorkerStatusHtml,
  };
});
