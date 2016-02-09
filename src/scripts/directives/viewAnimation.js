angular.module('financier').directive('stateClass', ['$state', function($state) {
    return {
        link: function($scope, $element, $attrs) {
          console.log($state)
            var stateName = $state.current.name || 'init',
                normalizedStateName = 'state-' + stateName.replace(/\./g, '-');
            $element.addClass(normalizedStateName);
        }
    };
}]);
