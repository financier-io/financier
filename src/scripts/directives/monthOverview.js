angular.module('financier').directive('monthOverview', function() {
  return {
    restrict: 'E',
    templateUrl: 'scripts/directives/monthOverview.html',
    scope: {
      overview: '='
    }
  }
});