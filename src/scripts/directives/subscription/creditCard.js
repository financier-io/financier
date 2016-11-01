angular.module('financier').directive('creditCard', ($q, User, stripeLazyLoader) => {
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

        $q.all([
          User.getStripePublishableKey(),
          stripeLazyLoader // we must require stripe by this point
        ])
        .then(([key]) => {
          window.Stripe.setPublishableKey(key);
        })
        .then(() => {
          return $q((resolve, reject) => {
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

