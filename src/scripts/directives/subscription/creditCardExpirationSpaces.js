/* global Stripe */

angular.module('financier').directive('creditCardExpirationSpaces', () => {
  return {
    restrict: 'A',
    scope: {
      creditCardExpirationSpaces: '=',
      expirationInvalid: '='
    },
    link: (scope, element) => {
      element.on('keydown', e => {
        if (e.keyCode === 191) { // '/' character
          e.preventDefault();

          if (element.val().length === 2) {
            element.val(element.val() + ' / ');
          }
        }
      });
      element.on('input', function () {
        var newValue = this.value.split(' / ').join('');

        if (newValue.length > 0 && newValue.length <= 4) {
          newValue = newValue.match(new RegExp('.{1,2}', 'g')).join(' / ');

          this.value = newValue;
        }

        if (element.hasClass('ng-touched')) {
          validate(element.val());
        }

        scope.creditCardExpirationSpaces = this.value;
      });

      element.on('blur', () => {
        element.addClass('ng-touched');

        validate(element.val() || 'invalid');
      });

      function validate(value) {
        // If we don't have Stripe global, just don't use the stripe validator
        if (!value.length || (Stripe && Stripe.card.validateExpiry(value))) {
          element.addClass('credit-card__expiry--valid');
          element.removeClass('ng-invalid credit-card__expiry--invalid');
          scope.expirationInvalid = false;
        } else {
          element.addClass('ng-invalid credit-card__expiry--invalid');
          element.removeClass('credit-card__expiry--valid');
          scope.expirationInvalid = true;
        }
      }
    }
  };
});
