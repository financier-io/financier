angular
  .module("financier")
  .controller(
    "resetPasswordCtrl",
    function (User, $state, $stateParams, $rootScope) {
      this.goSignin = () => {
        $state.go("user.budget").then(() => {
          $rootScope.$broadcast("signin");
        });
      };

      this.submit = () => {
        this.loading = true;

        User.resetPassword($stateParams.token, this.password)
          .then(() => {
            this.success = true;
          })
          .catch((e) => {
            if (e.status === 429) {
              this.error = "TOO_MANY_ATTEMPTS";
            } else {
              this.error = "GENERAL";
            }
          })
          .finally(() => {
            this.loading = false;
          });
      };
    },
  );
