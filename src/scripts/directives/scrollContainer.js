angular.module("financier").directive("scrollContainer", () => {
  return {
    restrict: "A",
    scope: false,
    controller: function ($element) {
      this.element = $element[0];

      // Needed for scrollIntoViewIf scrollTop calculation
      $element.css("position", "relative");
    },
  };
});
