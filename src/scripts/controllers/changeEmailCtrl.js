angular
  .module("financier")
  .controller(
    "changeEmailCtrl",
    function (User, $state, $stateParams, $rootScope) {
      this.loading = true;

      User.confirmChangeEmail($stateParams.token)
        .then(() => {
          this.changed = true;
        })
        .catch(() => {
          this.error = true;
        })
        .finally(() => {
          this.loading = false;
        });

      // The old session cookie is invalidated by the email change, so the user
      // has to sign in again -- with their new address.
      this.login = () => {
        $state.go("user.budget").then(() => {
          $rootScope.$broadcast("signin");
        });
      };
    },
  );
