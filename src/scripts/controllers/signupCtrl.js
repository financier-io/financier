angular.module("financier").controller("signupCtrl", function ($scope, User) {
  this.submit = (email, password) => {
    if (this.loading) return;
    this.serverError = null;
    this.loading = true;

    User.create(email, password)
      .then(() => {
        this.success = true;
        document.activeElement.blur();
      })
      .catch((e) => {
        if (e?.data?.errorMessage === "existingEmail") {
          this.form.email.$setValidity("duplicate", false);
        } else {
          this.serverError =
            e?.status === 429 ? "TOO_MANY_ACCOUNT_REQUESTS" : "INTERNAL_ERROR";
        }
      })
      .finally(() => {
        this.loading = false;
      });
  };

  $scope.$watch(
    () => this.email,
    () => {
      this.form.email.$setValidity("duplicate", true);
    },
  );

  $scope.$watch(
    () => `${this.email}${this.password}`,
    () => {
      this.serverError = null;
    },
  );
});
