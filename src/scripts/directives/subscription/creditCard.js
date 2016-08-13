angular.module('financier').component('creditCard', {
  restrict: 'E',
  template: require('./creditCard.html'),
  bindings: {
    addToken: '&'
  },
  controllerAs: 'vm',
  controller: function($scope) {
    this.card = {};

    window.Stripe.setPublishableKey('pk_test_XPdvlr2ysiBiX1OzWdc4v9ey');

    this.submit = () => {
      console.log(this.card)

      window.Stripe.card.createToken(this.card, (status, response) => {
        if (response.error) {
          console.log(status, response);
        } else {
          this.addToken({ token: response.id});
        }
      });
    }
  }
});

