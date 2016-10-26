angular.module('financier').directive('touchEnd', () => {
  return function(scope, element, attr) {
    element.on('touchend', event => {
      scope.$apply(() => {
        scope.$eval(attr.touchEnd); 
      });
    });
  };
});
