angular.module('financier').directive('disableNgAnimate', function ($animate) {
  return {
    restrict: 'A',
    link: function (scope, element) {
      $animate.enabled(element, false);
    }
  };
});
