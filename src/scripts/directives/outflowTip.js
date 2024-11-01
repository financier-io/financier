import Drop from "tether-drop";
import moment from "moment";
import outflowTipHtml from "./outflowTip.html?raw";

angular.module("financier").directive("outflowTip", ($compile, $timeout) => {
  function link(scope, element, attrs) {
    element.on("click", () => {
      scope.transactions = Object.keys(scope.dbCtrl.manager.transactions)
        .map((id) => {
          return scope.dbCtrl.manager.transactions[id];
        })
        .filter((trans) => {
          return (
            (!trans.splits || !trans.splits.length) &&
            trans.category &&
            trans.category.indexOf(attrs.category) === 0 &&
            moment(trans.month).format("YYYY-MM") + "-01" === scope.month.date
          );
        });

      const template = outflowTipHtml;
      let dropInstance;

      const wrap = angular.element("<div></div>").append(template);
      const content = $compile(wrap)(scope);

      scope.$apply();

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
        constrainToScrollParent: attrs.constrainToScrollParent != null,
        position: attrs.position || "bottom center",
      });

      dropInstance.open();

      dropInstance.on("close", () => {
        $timeout(() => {
          dropInstance.destroy();
        });
      });
    });
  }

  return {
    restrict: "A",
    link,
  };
});
