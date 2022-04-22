import Drop from "tether-drop";

angular.module("financier").directive("rename", ($compile, $timeout) => {
  function link(scope, element, attrs, ngModelCtrl) {
    element.on("click", () => {
      const template = require("./rename.html").default;

      const wrap = angular.element("<div></div>").append(template);
      const content = $compile(wrap)(scope);

      content.on("keypress keydown", (e) => {
        if (e.which === 27) {
          dropInstance.close();
        }
      });

      const dropInstance = new Drop({
        target: element[0],
        content: content[0],
        classes: "drop-theme-arrows-bounce",
        openOn: "click",
        tetherOptions: {
          targetOffset: "0 -20px",
          targetAttachment: "bottom center",
          optimizations: {
            moveElement: true,
          },
        },
      });

      dropInstance.on("open", () => {
        scope.myNote = ngModelCtrl.$viewValue;

        content.find("input")[0].focus();
      });

      dropInstance.on("close", () => {
        scope.myNote = ngModelCtrl.$viewValue;

        $timeout(() => {
          dropInstance.destroy();
        });
      });

      scope.$on("drop:close", () => {
        dropInstance.close();
      });

      scope.remove = () => {
        dropInstance.close();
        scope.onRemove();
      };

      scope.submit = (rename) => {
        ngModelCtrl.$setViewValue(rename);

        dropInstance.close();
      };

      dropInstance.open();
    });
  }

  return {
    restrict: "A",
    require: "ngModel",
    link,
    scope: {
      onRemove: "&",
    },
  };
});
