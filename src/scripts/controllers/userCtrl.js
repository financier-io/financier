angular.module('financier').controller('userCtrl', function($rootScope, User, db) {
  const getSession = () => {
    return User.session()
    .then(s => {
      if (s.userCtx && s.userCtx.name) {
        this.email = s.userCtx.name;

        for (let i = 0; i < s.userCtx.roles.length; i++) {
          if (s.userCtx.roles[i].indexOf('userdb-') === 0) {
            db.sync.start(s.userCtx.roles[i]);
          }
        }
      } else {
        this.email = null;
      }
    });
  };

  getSession();

  this.login = (username, password) => {
    return User.login(username, password)
    .then((data) => {
      return getSession()
      .then(() => {
        return data;
      });
    });
  };

  this.logout = () => {
    db.sync.cancel();

    return User.logout()
    .then(() => {
      this.email = null;
    });
  };

  // Default is no syncing
  this.status = 'offline';

  $rootScope.$on('syncStatus:update', (e, status) => {
    this.status = status;
    $rootScope.$apply();
  });
});
