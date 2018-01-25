angular.module('financier').directive('touchStart', () => {
  return function (scope, element, attr) {
    element.on('touchstart', () => {
      scope.$apply(() => { 
        scope.$eval(attr.touchStart); 
      });
    });
  };
});
