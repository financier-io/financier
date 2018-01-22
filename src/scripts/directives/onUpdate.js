import math from 'mathjs';

angular.module('financier').directive('onUpdate', ($filter, $timeout, $locale) => {
  const GROUP_SEP = $locale.NUMBER_FORMATS.GROUP_SEP;
  const DECIMAL_SEP = $locale.NUMBER_FORMATS.DECIMAL_SEP;

  const numberFilter = $filter('number');
  const intCurrencyFilter = $filter('intCurrency');

  function link(scope, element, attrs) {
    let oldValue;

    scope.$watch('viewModel', val => {
      if (document.activeElement !== element[0]) {
        setView(val);
      }
    });

    const parse = () => {
      try {
        let v = element.val();
        v = v.replace(new RegExp(`\\${GROUP_SEP}`, 'g'), '');
        v = v.replace(new RegExp(`\\${DECIMAL_SEP}`, 'g'), '.');

        const val = math.eval(v);
        oldValue = val.toFixed(scope.$parent.dbCtrl.currencyDigits);
      } catch(e) {
        oldValue = 0;
      }

      if (!isFinite(oldValue) || isNaN(oldValue)) {
        oldValue = 0;
      }

      const val = Math.round(oldValue * Math.pow(10, scope.$parent.dbCtrl.currencyDigits));

      scope.onUpdate({
        model: val // float $2.50123 ==> int 250
      });

      // 20.20 => 20.2 goes to 20.20
      setView(val);
    }

    element.on('keydown blur', event => {
      if (event.which === 13 || event.type == 'blur') { // enter or blur
        parse();
      }
    });

    element.on('focus', () => {
      element.one('mouseup', () => {
        element[0].select();

        return false;
      });
    });

    function setView(val) {
      oldValue = numberFilter(intCurrencyFilter(val, true, scope.$parent.dbCtrl.currencyDigits), scope.$parent.dbCtrl.currencyDigits);

      if (val !== 0) {
        element.val(oldValue);
      } else {
        element.val('');
      }
    }
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
