angular
  .module("financier")
  .controller("requestChangeEmailCtrl", function ($scope, User, currentEmail) {
    this.currentEmail = currentEmail;

    this.submit = (email) => {
      this.loading = true;
      this.formDisabled = true;
      this.error = null;

      User.requestChangeEmail(email)
        .then(() => {
          this.newEmail = email;
          this.success = true;
          document.activeElement.blur();
        })
        .catch((e) => {
          // Surface the backend's errorMessage (e.g. existingEmail) so the
          // template can show a specific message; re-enable the form.
          this.error = (e.data && e.data.errorMessage) || "GENERAL";
          this.formDisabled = false;
        })
        .finally(() => {
          this.loading = false;
        });
    };

    $scope.$watch(
      () => this.email,
      () => {
        this.formDisabled = false;
      },
    );
  });
