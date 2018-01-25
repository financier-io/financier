angular.module('financier').controller('verifyEmailCtrl', function (User, $state, $stateParams, $rootScope) {
  this.loading = true;

  User.verifyEmail($stateParams.token)
  .then(() => {
    this.verified = true;
  })
  .catch(() => {
    this.error = true;
  })
  .finally(() => {
    this.loading = false;
  });

  this.login = () => {
    $state.go('user.budget')
    .then(() => {
      $rootScope.$broadcast('signin');
    });
  };
});
