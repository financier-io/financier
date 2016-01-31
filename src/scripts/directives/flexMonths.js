angular.module('financier').directive('flexMonths', function(resize, $rootScope) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      let flexMonths = Math.floor(element[0].offsetWidth / 350);

      scope.$on('resize', function($event) {
        flexMonths = Math.floor((element[0].offsetWidth - 175) / 200);
        $rootScope.$emit('budget:columns', flexMonths);
      });

    }
  };
});