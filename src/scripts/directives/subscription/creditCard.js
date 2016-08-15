angular.module('financier').directive('creditCard', () => {
  return {
    restrict: 'E',
    template: require('./creditCard.html'),
    bindToController: {
      addToken: '&'
    },
    controllerAs: 'vm',
    controller: function($scope) {
      this.card = {};

      window.Stripe.setPublishableKey('pk_test_XPdvlr2ysiBiX1OzWdc4v9ey');

      this.submit = () => {
        this.loadingAddSource = true;

        window.Stripe.card.createToken(angular.copy(this.card), (status, response) => {
          if (response.error) {
            this.loadingAddSource = false;
          } else {
            this.addToken({ token: response.id})
            .then(() => {
              $scope.closeThisDialog();
            })
            .catch(() => {
              this.loadingAddSource = false;
            });
          }
        });
      }
    }
  };
});

