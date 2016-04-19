angular.module('financier').controller('userCtrl', function($rootScope, User, db, ngDialog) {
  const getSession = () => {
    return User.session()
    .then(s => {
      if (s.userCtx && s.userCtx.name) {
        this.email = s.userCtx.name;

        for (let i = 0; i < s.userCtx.roles.length; i++) {
          if (s.userCtx.roles[i].indexOf('userdb-') === 0) {
            db.sync.start(s.userCtx.roles[i]);
          }

          if (s.userCtx.roles[i].indexOf('exp-') === 0) {
            const d = new Date(0);
            d.setUTCSeconds(+s.userCtx.roles[i].slice(4));
            this.subscriptionExpiry = d;
          }
        }
      } else {
        this.email = null;
      }
    });
  };

  getSession();


  this.logout = () => {
    db.sync.cancel();

    return User.logout()
    .then(() => {
      this.email = null;
    });
  };

  const scope = $rootScope.$new();
  scope.login = (username, password, closeThisDialog) => {
    scope.loading = true;
    return User.login(username, password)
    .then((data) => {
      return getSession()
      .then(() => {
        return data;
      })
      .then(() => {
        closeThisDialog();
      })
      .finally(() => {
        scope.loading = false;
      });
    });
  };

  this.signin = () => {
    ngDialog.open({
      template: 'views/modal/signin.html',
      scope
    });
  };

  // Default is no syncing
  this.status = 'offline';

  $rootScope.$on('syncStatus:update', (e, status) => {
    this.status = status;
    $rootScope.$apply();
  });
});
