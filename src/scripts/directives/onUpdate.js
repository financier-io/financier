import math from 'mathjs';

angular.module('financier').directive('onUpdate', ($filter, $timeout) => {
  function link(scope, element, attrs) {
    let oldValue;

    scope.$watch('viewModel', (val) => {
      if (document.activeElement !== element[0]) {
        oldValue = ((val || 0) / Math.pow(10, scope.$parent.dbCtrl.currencyDigits)).toFixed(scope.$parent.dbCtrl.currencyDigits);
        if (oldValue && +oldValue !== 0) {
          element.val(oldValue);
        } else {
          element.val('');
        }
      }
    });

    element.on('blur', () => {
      try {
        const val = math.eval(element.val());
        oldValue = val.toFixed(scope.$parent.dbCtrl.currencyDigits);
      } catch(e) {
        oldValue = 0;
      }

      if (!isFinite(oldValue) || isNaN(oldValue)) {
        oldValue = 0;
      }

      scope.onUpdate({
        model: Math.round(oldValue * Math.pow(10, scope.$parent.dbCtrl.currencyDigits)) // float $2.50123 ==> int 250
      });

      if (oldValue && +oldValue !== 0) {
        element.val(oldValue);
      } else {
        element.val('');
      }

      scope.$apply();
    });

    element.on('focus', () => {
      if (+oldValue === 0) {
        element.val('');
      } else {
        element.val(oldValue);
      }

      element.one('mouseup', () => {
        element[0].select();

        return false;
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
