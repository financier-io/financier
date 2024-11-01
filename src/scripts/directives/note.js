import Drop from "tether-drop";
import noteHtml from "./note.html?raw";

angular.module("financier").directive("note", ($compile, $timeout) => {
  function link(scope, element, attrs, ngModelCtrl) {
    element.on("click", () => {
      const template = noteHtml;

      const wrap = angular.element("<div></div>").append(template);
      const content = $compile(wrap)(scope);

      content.on("keypress keydown", (e) => {
        if (e.which === 27) {
          dropInstance.close();
        } else if (e.which === 13 && (e.ctrlKey || e.metaKey)) {
          scope.submit(scope.myNote);

          dropInstance.close();
        }
      });

      const dropInstance = new Drop({
        target: element[0],
        content: content[0],
        classes: "drop-theme-arrows-bounce",
        openOn: "click",
        tetherOptions: {
          targetOffset: "0 -19px",
          optimizations: {
            moveElement: true,
          },
        },
      });

      dropInstance.on("open", () => {
        scope.myNote = ngModelCtrl.$viewValue;
        scope.canDelete =
          ngModelCtrl.$viewValue && ngModelCtrl.$viewValue.length;

        content.find("textarea")[0].focus();
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

      scope.submit = (note) => {
        ngModelCtrl.$setViewValue(note);

        dropInstance.close();
      };

      dropInstance.open();
    });
  }

  return {
    restrict: "A",
    require: "ngModel",
    link,
  };
});
