angular.module('financier').controller('resetPasswordCtrl', function(User, $state, $stateParams, $rootScope) {

  this.submit = () => {
    this.loading = true;

    User.resetPassword($stateParams.token, this.password)
    .then(() => {
      return User.login($stateParams.email, this.password)
      .then(() => {
        $state.go('user.budget')
        .then(() => {
          $rootScope.$broadcast('login');
        });
      });
    })
    .catch(() => {
      this.error = true;
    })
    .finally(() => {
      this.loading = false;
    });
  }
});
