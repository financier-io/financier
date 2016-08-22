angular.module('financier').controller('signinCtrl', function(User, $scope, $rootScope) {
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

  $scope.$watchGroup([() => this.email, () => this.password], () => {
    if (angular.isDefined(this.email) ||
        angular.isDefined(this.password)) {
      this.form.password.$setValidity('incorrect', true);
    }
  });
});
