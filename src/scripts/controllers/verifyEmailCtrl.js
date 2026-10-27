angular
  .module("financier")
  .controller(
    "verifyEmailCtrl",
    function (User, $state, $stateParams, $rootScope) {
      const verify = (password) => {
        this.loading = true;
        this.serverError = null;
        this.error = false;
        this.canRetry = false;

        return User.verifyEmail($stateParams.token, password)
          .then(() => {
            this.verified = true;
            this.requiresPassword = false;
            this.password = undefined;
          })
          .catch((error) => {
            if (
              error?.status === 422 &&
              error.data?.errorMessage === "passwordRequired"
            ) {
              this.requiresPassword = true;
            } else if (error?.status === 404 || !this.requiresPassword) {
              this.requiresPassword = false;
              this.error = true;
              const status = error?.status;
              this.canRetry =
                status === undefined ||
                status <= 0 ||
                status === 409 ||
                status === 429 ||
                status >= 500;
              if (this.canRetry) {
                this.serverError =
                  status === 429
                    ? "TOO_MANY_ACCOUNT_REQUESTS"
                    : "INTERNAL_ERROR";
              }
            } else {
              // A server or rate-limit error must not invalidate the form:
              // users can retry without changing the password they chose.
              this.serverError =
                error?.status === 429
                  ? "TOO_MANY_ACCOUNT_REQUESTS"
                  : error?.status === 422 &&
                      error.data?.errorMessage === "invalidPassword"
                    ? "PASSWORD_MINIMUM_LENGTH"
                    : "INTERNAL_ERROR";
            }
          })
          .finally(() => {
            this.loading = false;
          });
      };

      this.submit = () => {
        if (this.loading || this.form?.$invalid) return;
        return verify(this.password);
      };

      this.retry = () => {
        if (this.loading || !this.canRetry) return;
        return verify();
      };

      // Older managers activate immediately. Updated managers require the
      // mailbox owner to choose the password before account activation.
      verify();

      this.login = () => {
        $state.go("user.budget").then(() => {
          $rootScope.$broadcast("signin");
        });
      };
    },
  );
