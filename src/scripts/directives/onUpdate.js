angular.module('financier').directive('onUpdate', ($filter) => {
  function link(scope, element, attrs) {
    let oldValue;

    scope.$watch('viewModel', (val) => {
      if (document.activeElement !== element[0]) {
        oldValue = ((val || 0) / 100).toFixed(2);
        if (oldValue && +oldValue !== 0) {
          element.val(oldValue);
        } else {
          element.val('');
        }
      }
    });

    element.bind('input propertychange', () => {
      const val = +element.val();

      if (!isNaN(val) && angular.isNumber(val)) {
        scope.onUpdate({
          model: Math.round(val * 100) // float $2.50123 ==> int 250
        });
        scope.$apply();
      }
    });

    element.bind('blur', () => {
      const val = +element.val();
      if (angular.isNumber(val) && !isNaN(val)) {
        oldValue = (+element.val()).toFixed(2);
      } else {
        oldValue = 0;
      }
      if (oldValue && +oldValue !== 0) {
        element.val(oldValue);
      } else {
        element.val('');
      }
    });

    element.bind('focus', () => {
      if (+oldValue === 0) {
        element.val('');
      } else {
        element.val(oldValue);
      }
    });
  }

  return {
    restrict: 'A',
    scope: {
      viewModel: '=',
      onUpdate: '&'
    },
    link
  };
});