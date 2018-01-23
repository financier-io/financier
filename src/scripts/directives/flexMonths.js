angular.module('financier').directive('flexMonths', (resize, $rootScope) => {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      let flexMonths = Math.floor((element[0].offsetWidth - 175) / 260);
      $rootScope.$emit('budget:columns', flexMonths);

      scope.$on('resize', function($event) {
        flexMonths = Math.floor((element[0].offsetWidth - 175) / 260);
        $rootScope.$emit('budget:columns', flexMonths);
      });

    }
  };
});
