angular.module('financier').directive('onUpdate', ($filter, $timeout) => {
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

    element.bind('blur', () => {
      try {
        const val = math.eval(element.val());
        oldValue = val.toFixed(2);
      } catch(e) {
        oldValue = 0;
      }

      scope.onUpdate({
        model: Math.round(oldValue * 100) // float $2.50123 ==> int 250
      });

      if (oldValue && oldValue !== 0) {
        element.val(oldValue);
      } else {
        element.val('');
      }

      scope.$apply();
    });

    element.bind('focus', () => {
      if (+oldValue === 0) {
        element.val('');
      } else {
        element.val(oldValue);
      }

      $timeout(() => {
        element[0].select();
      });
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
