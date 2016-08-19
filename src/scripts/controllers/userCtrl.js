angular.module('financier').controller('userCtrl', function($rootScope, $scope, User, db, ngDialog, $timeout) {
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
      .then(source => {
        this.source = source;
      });
    }

    this.removeSource = () => {
      this.loadingRemoveSource = true;

      return User.removeSource()
      .then(source => {
        this.source = source;
      })
      .finally(() => {
        this.loadingRemoveSource = false;
      });
    }

    this.getSource = () => {
      return User.getSource()
      .then(source => {
        this.source = source;
      })
    }

    this.startSubscription = () => {
      this.loadingStartSubscription = true;

      User.startSubscription().then(subscription => {
        this.subscription = subscription;
      })
      .finally(() => {
        this.loadingStartSubscription = false;
      })
    };

    this.stopSubscription = () => {
      this.loadingStopSubscription = true;
      User.stopSubscription().then(subscription => {
        this.subscription = subscription;
      })
      .finally(() => {
        this.loadingStopSubscription = false;
      })
    };

    this.loadingSubscription = true;

    this.getSubscription = () => {
      return User.getSubscription().then(subscription => {
        this.subscription = subscription;
      })
      .catch(e => {
        this.subscription = null;
      })
      .finally(() => {
        this.loadingSubscription = false;
      });
    }

    this.getSubscription();

    this.loadingSource = true;

    this.getSource = () => {
      return User.getSource().then(source => {
        this.source = source;
      })
      .catch(e => {
        this.source = null;
      })
      .finally(() => {
        this.loadingSource = false;
      });
    }

    this.getSource();
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
    })
    .catch(() => {
      this.loadingFailed = true;
    });
  };

  getSession();

  $scope.$on('login', () => {
    getSession();
  });


  this.logout = () => {
    db.sync.cancel();

    this.logoutLoading = true;

    return User.logout()
    .then(() => {
      this.email = null;
    })
    .finally(() => {
      this.logoutLoading = false;
    });
  };

  this.signin = () => {
    ngDialog.open({
      template: require('../../views/modal/signin.html'),
      controller: 'signinCtrl as signinCtrl'
    });
  };

  $scope.$on('signin', () => {
    this.signin();
  });

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
