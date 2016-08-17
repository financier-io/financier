angular.module('financier').directive('creditCard', User => {
  return {
    restrict: 'E',
    template: require('./creditCard.html'),
    bindToController: {
      addToken: '&'
    },
    controllerAs: 'vm',
    controller: function($scope) {
      this.card = {};

      $scope.$watch(() => this.card, () => {
        this.cardForm.$setValidity('stripeError', true);
        this.cardForm.$setValidity('internalError', true);
      }, true);

      this.submit = () => {
        this.loadingAddSource = true;

        User.getStripePublishableKey()
        .then(key => {
          window.Stripe.setPublishableKey(key);
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            window.Stripe.card.createToken(angular.copy(this.card), (status, response) => {
              this.stripeError = response.error;
              this.cardForm.$setValidity('stripeError', !this.stripeError);
              
              if (response.error) {
                reject('stripeError');
              } else {
                resolve(response.id);
              }
            });
          })
        })
        .then(token => {
          return this.addToken({ token });
        })
        .then(() => {
          $scope.closeThisDialog();
        })
        .catch(e => {
          this.loadingAddSource = false;

          if (e !== 'stripeError') {
            this.cardForm.$setValidity('internalError', false);
          }
        });
      }
    }
  };
});

