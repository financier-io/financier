angular.module('financier').controller('verifyEmailCtrl', function(User, $stateParams) {
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
  })
});
