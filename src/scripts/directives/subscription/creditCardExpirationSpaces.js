angular.module('financier').directive('creditCardExpirationSpaces', () => {
  return {
    restrict: 'A',
    scope: {
      creditCardExpirationSpaces: '='
    },
    link: (scope, element, attrs, ngModelCtrl) => {
      element.on('input', function() {

        var newValue = this.value.split(' / ').join('');

        if (newValue.length > 0 && newValue.length <= 4) {
          newValue = newValue.match(new RegExp('.{1,2}', 'g')).join(' / ');

          this.value = newValue;
        }

        validate(this.value);

        scope.creditCardSpaces = this.value;
      });

      function validate(value) {
        if (!value.length || Stripe.card.validateExpiry(value)) {
          element.addClass('credit-card__expiry--valid');
          element.removeClass('credit-card__expiry--invalid');
        } else {
          element.addClass('credit-card__expiry--invalid');
          element.removeClass('credit-card__expiry--valid');
        }
      }
    }
  };
});
