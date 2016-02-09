angular.module('financier').directive('stateClass', ['$state', function($state) {
  var prevStateName;

    return {
        link: function(scope, element) {
            var stateName = $state.current.name || 'init',
                normalizedStateName = 'state-' + stateName.replace(/\./g, '-');
            element.addClass(normalizedStateName);
            if (prevStateName) {
              element.addClass(prevStateName + '-leave');
            }

            prevStateName = normalizedStateName;
        }
    };
}]);
