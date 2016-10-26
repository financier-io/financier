angular.module('financier').directive('touchStart', () => {
  return function(scope, element, attr) {
    element.on('touchstart', event => {
      scope.$apply(() => { 
        scope.$eval(attr.touchStart); 
      });
    });
  };
});
