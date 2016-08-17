angular.module('financier').directive('creditCardSpaces', () => {
  return {
    restrict: 'A',
    scope: {
      creditCardSpaces: '='
    },
    link: (scope, element, attrs, ngModelCtrl) => {
      element.on('input', function() {

        var newValue = this.value.split(' ').join('');

        if (newValue.length > 0) {
          newValue = newValue.match(new RegExp('.{1,4}', 'g')).join(' ');
        }

        this.value = newValue;

        scope.creditCardSpaces = this.value;
      })
    }
  };
});
