angular.module('financier').controller('signupCtrl', function(User) {
  this.submit = (email, password) => {
    this.loading = true;

    // User.create(email, password)
    // .then(() => {
    //   this.success = true;
    // })
    // .catch(() => {
    //   this.error = true;
    // })
    // .finally(() => {
    //   this.loading = false;
    // });
  };
});
