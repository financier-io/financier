angular
  .module("financier")
  .controller("requestResetPasswordCtrl", function ($scope, User, userEmail) {
    this.email = userEmail;

    this.submit = (email) => {
      this.loading = true;
      this.formDisabled = true;

      User.requestResetPassword(email)
        .then(() => {
          this.success = true;
          document.activeElement.blur();
        })
        .catch((e) => {
          this.error = e;
        })
        .finally(() => {
          this.loading = false;
        });
    };

    $scope.$watch(
      () => this.email,
      () => {
        this.formDisabled = false;

        if (this.form) {
          this.form.$setValidity("internalError", true);
        }
      },
    );
  });
