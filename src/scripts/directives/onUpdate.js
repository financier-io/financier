angular.module('financier').directive('onUpdate', ($filter) => {
  const currency = $filter('currency');

  function link(scope, element, attrs) {
    let oldValue;

    scope.$watch('viewModel', (newV, oldV) => {
      if (document.activeElement !== element[0]) {
        oldValue = newV;
        if (oldValue && +oldValue !== 0) {
          element.val(currency(newV));
        } else {
          element.val('');
        }
      }
    });

    element.bind('input propertychange', () => {
      const val = +element.val();

      if (!isNaN(val) && angular.isNumber(val)) {
        scope.onUpdate({
          model: val
        });
        scope.$apply();
      }
    });

    element.bind('blur', () => {
      oldValue = element.val();
      if (oldValue && +oldValue !== 0) {
        element.val(currency(oldValue));
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