import moment from 'moment';

angular.module('financier').controller('userCtrl', function($rootScope, $scope, User, db, ngDialog, $timeout, $state) {
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

    this.startSubscription = () => {
      this.loadingStartSubscription = true;

      User.startSubscription().then(subscription => {
        this.subscription = subscription;

        // Start the sync of new budget data
        db.sync.cancel();
        db.sync.start(this.userDb, true);
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

  this.userDb = null;

  const getSession = () => {
    return User.session()
    .then(s => {
      if (s.userCtx && s.userCtx.name) {
        this.email = s.userCtx.name;

        let isValidSub = false;

        for (let i = 0; i < s.userCtx.roles.length; i++) {
          if (s.userCtx.roles[i].indexOf('userdb-') === 0) {
            this.userDb = s.userCtx.roles[i];
          }
        }

        for (let i = 0; i < s.userCtx.roles.length; i++) {
          if (s.userCtx.roles[i].indexOf('exp-') === 0) {
            isValidSub = moment().unix() < +s.userCtx.roles[i].slice(4);
          }
        }

        db.sync.start(this.userDb, isValidSub);

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
      this.subscription = null;
      this.source = null;
      this.isFree = true;
    })
    .finally(() => {
      this.logoutLoading = false;
    });
  };

  this.removeLocalData = () => {
    return ngDialog.openConfirm({
      template: require('../../views/modal/removeLocalData.html'),
      className: 'ngdialog-theme-default ngdialog-theme-default--danger modal'
    })
    .then(removeLocalData);
  }

  this.logoutAndRemove = () => {
    this.logout()
    .then(removeLocalData);
  }

  function removeLocalData() {
    return db.destroy()
    .then(() => {
      $rootScope.$broadcast('reset');
      return $state.go('user.budget');
    });
  }

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
    if (this.status !== status) {
      this.status = status;
      $scope.$apply();
    }
  });

  $rootScope.$on('login', (e, status) => {
    this.status = status;
  });
});
