import { throttle } from 'underscore';

angular.module('financier').directive('flexMonths', ($rootScope) => {
  return {
    restrict: 'A',
    link: function (scope, element) {
      let flexMonths = Math.floor((element[0].offsetWidth - 175) / 260);
      $rootScope.$emit('budget:columns', flexMonths);

      const onResize = throttle(() => {
        flexMonths = Math.floor((element[0].offsetWidth - 175) / 260);
        $rootScope.$emit('budget:columns', flexMonths);

        $rootScope.$apply();
      }, 250);

      window.addEventListener('resize', onResize, false);

      scope.$on('$destroy', () => {
        window.removeEventListener('resize', onResize, false);
      });
    }
  };
});
