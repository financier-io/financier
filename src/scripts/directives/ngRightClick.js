angular.module("financier").directive("ngRightClick", ($parse) => {
  return (scope, element, attrs) => {
    var fn = $parse(attrs.ngRightClick);
    element.bind("contextmenu", (event) => {
      scope.$apply(() => {
        event.preventDefault();
        fn(scope, { $event: event });
      });
    });
  };
});
