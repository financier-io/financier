angular.module('financier').controller('userCtrl', function($rootScope, User, db, ngDialog) {
  $rootScope.loaded = true;
  
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

  this.signin = () => {
    ngDialog.open({
      template: require('../../views/modal/signin.html'),
      controller: 'signinCtrl as signinCtrl'
    });
  };

  // Default is no syncing
  this.status = 'offline';

  $rootScope.$on('syncStatus:update', (e, status) => {

    //      NEW STATUS                   OLD STATUS
    if (status === 'complete' && this.status === 'error') {

      // If we get an error, we want to display it even when complete
      // (usually right after the error comes up). This will still
      // let syncStatus transition back to syncing if something 
      // triggers that.
      //
      // So, don't update the directive.
      return;
    }

    this.status = status;
    $rootScope.$apply();
  });

  $rootScope.$on('login', (e, status) => {
    this.status = status;
    $rootScope.$apply();
  });
});
