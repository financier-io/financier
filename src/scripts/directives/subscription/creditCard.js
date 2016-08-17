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

      this.submit = () => {
        this.loadingAddSource = true;

        User.getStripePublishableKey()
        .then(key => {
          window.Stripe.setPublishableKey(key);
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            window.Stripe.card.createToken(angular.copy(this.card), (status, response) => {
              if (response.error) {
                reject(error);
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
        .catch(() => {
          this.loadingAddSource = false;
        });
      }
    }
  };
});

