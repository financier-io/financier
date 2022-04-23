angular.module("financier").directive("resizeCategories", () => {
  return {
    restrict: "A",
    link: (scope, element) => {
      let currentSize = +localStorage.budgetCategoryWidth;

      function setSize(x) {
        if (currentSize !== x) {
          localStorage.budgetCategoryWidth = x;
        }

        scope.styles["flex-basis"] = `${x}px`;
      }

      if (angular.isDefined(currentSize)) {
        setSize(currentSize);
      }

      const handle = angular.element(
        '<div class="budget__category-resize-handle"></div>'
      );

      handle.on("mousedown", (evt) => {
        evt.stopPropagation();
        evt.preventDefault();

        const body = angular.element(document.body);

        body.on("mousemove", (evt) => {
          const pageOffset = element[0].getBoundingClientRect();

          // +10 for CSS box-sizing: content-box; w/ padding. TODO
          var x = evt.pageX - pageOffset.left - 10;

          setSize(x);

          scope.$apply();
        });

        body.one("mouseup", () => {
          body.off("mousemove");
        });
      });

      element.append(handle);
    },
  };
});
