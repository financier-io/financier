import Drop from "tether-drop";

angular.module("financier").directive("flag", ($compile) => {
  function link(scope, element, attrs, ngModelCtrl) {
    let dropInstance;
    const template = require("./flag.html").default;

    const wrap = angular.element("<div></div>").append(template);
    const content = $compile(wrap)(scope);

    content.on("keypress keydown", (e) => {
      if (e.which === 27) {
        dropInstance.close();
      }
    });

    content.on("click", (event) => {
      scope.$parent.dbCtrl.stopPropagation(event);
    });

    dropInstance = new Drop({
      target: element[0],
      content: content[0],
      classes: "drop-theme-arrows-bounce",
      openOn: "click",
      constrainToWindow: true,
      constrainToScrollParent: false,
      tetherOptions: {
        targetOffset: "0 -15px",
        optimizations: {
          moveElement: true,
        },
      },
    });

    scope.$on("drop:close", () => {
      dropInstance.close();
    });

    dropInstance.on("open", () => {
      scope.flag = ngModelCtrl.$viewValue;
    });

    dropInstance.on("close", () => {
      scope.flag = ngModelCtrl.$viewValue;
    });

    scope.$on("$destroy", () => {
      dropInstance.destroy();
    });

    scope.submit = (flag) => {
      ngModelCtrl.$setViewValue(flag);

      dropInstance.close();
    };

    element.on("click", (event) => {
      scope.$parent.dbCtrl.stopPropagation(event);

      dropInstance.open();
    });
  }

  return {
    restrict: "A",
    require: "ngModel",
    controller: "flagCtrl as flagCtrl",
    link,
  };
});
