angular
  .module("financier")
  .directive("transactionValue", ($filter, $locale) => {
    const GROUP_SEP = $locale.NUMBER_FORMATS.GROUP_SEP;
    const DECIMAL_SEP = $locale.NUMBER_FORMATS.DECIMAL_SEP;

    const numberFilter = $filter("number");
    const intCurrencyFilter = $filter("intCurrency");

    return {
      restrict: "A",
      require: "ngModel",
      link: (scope, element, attrs, ngModelCtrl) => {
        //format text going to user (model to view)
        ngModelCtrl.$formatters.push(function (value) {
          if (!value) {
            return null;
          }

          return numberFilter(
            intCurrencyFilter(value, true, scope.$parent.dbCtrl.currencyDigits),
            scope.$parent.dbCtrl.currencyDigits,
          );
        });

        //format text from the user (view to model)
        ngModelCtrl.$parsers.push(function (value) {
          if (value === DECIMAL_SEP) {
            return;
          }

          value = value.replace(new RegExp(`\\${GROUP_SEP}`, "g"), "");
          value = value.replace(new RegExp(`\\${DECIMAL_SEP}`, "g"), ".");

          const num = +value;

          if (num === 0) {
            return;
          }

          if (isNaN(num)) {
            return 0;
          }

          return Math.round(
            num * Math.pow(10, scope.$parent.dbCtrl.currencyDigits),
          );
        });
      },
    };
  });
