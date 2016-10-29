angular.module('financier').directive('focusOnNewSplit', () => {
  return {
    restrict: 'A',
    link: (scope, element) => {
      scope.$on('split:new', () => {
        if (scope.$last) {
          element.find('input')[0].focus();
        }
      });
    }
  }
})
