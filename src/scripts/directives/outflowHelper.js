import Drop from "tether-drop";
import outflowHelperHtml from "./outflowHelper.html?raw";

angular.module("financier").directive("outflowHelper", ($compile, $timeout) => {
  function link(scope, element) {
    element.on("click", () => {
      if (scope.outflowSetting && !scope.disabled) {
        const template = outflowHelperHtml;
        let dropInstance;

        const wrap = angular
          .element('<div class="tooltip"></div>')
          .append(template);
        const content = $compile(wrap)(scope);

        content.on("keypress keydown", (e) => {
          if (e.which === 27) {
            dropInstance.close();
          }
        });

        dropInstance = new Drop({
          target: element[0],
          content: content[0],
          classes: "drop-theme-arrows-bounce",
          openOn: "click",
          position: "bottom center",
        });

        dropInstance.open();

        dropInstance.on("close", () => {
          $timeout(() => {
            dropInstance.destroy();
          });
        });
      }
    });
  }

  return {
    restrict: "A",
    scope: {
      outflowDate: "=",
      outflowCategory: "=",
      outflowSetting: "=",
      disabled: "=",
    },
    link,
  };
});
