angular.module('financier').controller('signinCtrl', function(User, $scope, $rootScope, ngDialog) {
  this.login = (username, password, closeThisDialog) => {
    this.loading = true;
    this.error = null;

    return User.login(username, password)
    .then(() => {
      $rootScope.$broadcast('login');

      closeThisDialog();
    })
    .finally(() => {
      this.loading = false;
    })
    .catch(e => {
      this.error = e.data;
    });
  };

  this.requestResetPassword = () => {
    $scope.closeThisDialog();

    ngDialog.open({
      template: require('../../views/modal/requestResetPassword.html'),
      controller: 'requestResetPasswordCtrl as requestResetPasswordCtrl',
      resolve: {
        userEmail: () => this.email
      }
    });
  };

  $scope.$watchGroup([() => this.email, () => this.password], () => {
    if (angular.isDefined(this.email) ||
        angular.isDefined(this.password)) {
      this.form.password.$setValidity('incorrect', true);
    }
  });
});
