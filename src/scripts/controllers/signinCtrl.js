angular.module('financier').controller('signinCtrl', function(User, $scope, $rootScope) {
  this.login = (username, password, closeThisDialog) => {
    this.loading = true;
    return User.login(username, password)
    .then(() => {
      $rootScope.$broadcast('login');

      closeThisDialog();
    })
    .finally(() => {
      this.loading = false;
    })
    .catch(e => {
      if (e.status === 401) {
        this.form.password.$setValidity('incorrect', false);

        this.serverError = false;
      } else {
        this.serverError = true;
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
