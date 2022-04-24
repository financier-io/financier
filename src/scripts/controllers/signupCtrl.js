angular.module("financier").controller("signupCtrl", function ($scope, User) {
  this.submit = (email, password) => {
    this.loading = true;

    User.create(email, password)
      .then(() => {
        this.success = true;
        document.activeElement.blur();
      })
      .catch((e) => {
        if (e.data.errorMessage === "existingEmail") {
          this.form.email.$setValidity("duplicate", false);
        } else {
          this.form.$setValidity("internalError", false);
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
    }
  );

  $scope.$watch(
    () => `${this.email}${this.password}`,
    () => {
      this.form.$setValidity("internalError", true);
    }
  );
});
