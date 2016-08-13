angular.module('financier').controller('userCtrl', function($rootScope, $scope, User, db, ngDialog) {
  $rootScope.loaded = true;

  const getSubscriptionInfo = () => {
    this.addCard = () => {
      const s = $scope.$new({});
      s.addToken = this.addSource;

      ngDialog.open({
        template: '<credit-card add-token="addToken(token)"></credit-card>',
        scope: s
      });
    };

    this.addSource = token => {
      return User.addSource(token)
      .then(() => {
        this.getSource();
      });
    }

    this.removeSource = () => {
      return User.removeSource()
      .then(() => {
        this.getSource();
      });
    }

    this.getSource = () => {
      return User.getSource()
      .then(source => {
        this.source = source;
      })
    }

    this.getSource();

    this.startSubscription = User.startSubscription;
    this.stopSubscription = User.stopSubscription;

    this.loadingSubscription = true;

    this.getSubscription = () => {
      return User.getSubscription().then(subscription => {
        this.subscription = subscription;
        this.loadingSubscription = false;
      })
      .catch(e => {
        this.subscription = null;
      });
    }

    this.getSubscription();

    this.loadingSource = true;

    this.getSource = () => {
      return User.getSource().then(source => {
        this.source = source;
        this.loadingSource = false;
      })
      .catch(e => {
        this.source = null;
      });
    }
  }



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

        this.isFree = false;

        getSubscriptionInfo()
      } else {
        this.email = null;
        this.isFree = true;
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
  });
});
