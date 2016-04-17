angular.module('financier').controller('signupCtrl', function($timeout, User) {

  this.submit = (email, password) => {
    $timeout(() => {
    this.success = true;
      this.loading = false;
      document.activeElement.blur();
    }, 1000);
    this.loading = true;

    // User.create(email, password)
    // .then(() => {
    //   this.success = true;
    // })
    // .catch(() => {
    //   this.error = true;
    // })
    // .finally(() => {
    // });
  };
});
