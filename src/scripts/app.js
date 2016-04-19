let financier = angular.module('financier', [
  'ui.router',
  'ngResize',
  'ng-sortable',
  'ngAnimate',
  'ngDialog',
  'ngMessages',
  'angular-ladda-lw',
  'angular-md5'
]).run((offline, $rootScope, $timeout) => {
  offline.register();

  $rootScope.$on('serviceWorker', (e, status) => {
    $timeout(() => {
      $rootScope._offlineStatus = status;
    });
  });
});

financier.config(function($stateProvider, $urlRouterProvider, $locationProvider, ngDialogProvider) {
  // For any unmatched url, redirect to /state1
  // $urlRouterProvider.otherwise('/state1');
  //
  // Now set up the states
  $stateProvider
    .state('user', {
      abstract: true,
      template: '<div ui-view class="full-height view-transition__fade"></div>',
      controller: 'userCtrl as userCtrl'
    })
    .state('user.signup', {
      url: '/signup',
      templateUrl: 'views/signup.html',
      controller: 'signupCtrl as signupCtrl'
    })
    .state('user.budget', {
      url: '/',
      templateUrl: 'views/budgets.html',
      controller: 'budgetsCtrl as budgetsCtrl',
      resolve: {
        myBudgets: function(db) {
          return db.budgets.all();
        }
      }
    })
    .state('user.budget.create', {
      url: 'create-budget',
      onEnter: function(ngDialog, $state) {
        ngDialog.open({
          template: 'views/modal/createBudget.html',
          controller: 'createBudgetCtrl',
          controllerAs: 'createBudgetCtrl'
        }).closePromise.finally(() => {
          $state.go('^');
        });
      },
      onExit: ngDialog => {
        ngDialog.closeAll();
      }
    })
    .state('user.app', {
      url: '/:budgetId',
      abstract: true,
      template: '<ui-view></ui-view>',
      resolve: {
        myBudget: function(db, $stateParams) {
          return db.budget($stateParams.budgetId);
        }
      },
      onEnter: (db, $stateParams) => {
        db.budgets.get($stateParams.budgetId)
        .then(budgetRecord => {
          budgetRecord.open();
        });
      }
    })
    .state('user.app.manager', {
      abstract: true,
      templateUrl: 'views/appView.html',
      controller: 'dbCtrl as dbCtrl',
      resolve: {
        data: function(myBudget, $q) {
          return $q.all([
            myBudget.budget(),
            myBudget.categories.all()
          ])
          .then(([manager, categories]) => {
            if (categories.length) {
              manager.propagateRolling(
                categories
                  .map((m => m.categories.map(c => c.id)))
                  .reduce((a, b) => a.concat(b))
              );
            }

            return {manager, categories};
          })
          .catch(e => {
            throw e;
          });
        }
      }
    })
    .state('user.app.manager.view', {
      abstract: true,
      template: '<ui-view state-class class="view-transition"></ui-view>',
      onEnter: () => {
        angular.element(document.body).addClass('no-overflow');
      },
      onExit: () => {
        angular.element(document.body).removeClass('no-overflow');
      }
    })
    .state('user.app.manager.view.budget', {
      url: '/budget',
      templateUrl: 'views/budget.html',
      controller: 'budgetCtrl as budgetCtrl'
    })
    .state('user.app.manager.view.account', {
      url: '/account/:accountId',
      templateUrl: 'views/account.html'
    })
    .state('user.app.manager.view.account.edit', {
      url: '/edit',
      onEnter: function(ngDialog, $state, $stateParams, myBudget) {
        ngDialog.open({
          template: 'views/modal/editAccount.html',
          controller: 'editAccountCtrl',
          controllerAs: 'editAccountCtrl',
          resolve: {
            myBudget: function(db) {
              return myBudget;
            },
            myAccount: function(db) {
              return db.budget($stateParams.budgetId).accounts.get($stateParams.accountId);
            }
          }
        }).closePromise.finally(() => {
          $state.go('^');
        });
      },
      onExit: ngDialog => {
        ngDialog.closeAll();
      }
    })
    .state('user.app.manager.view.account.create', {
      url: '/create',
      onEnter: function(ngDialog, $state, $stateParams, myBudget) {
        ngDialog.open({
          template: 'views/modal/editAccount.html',
          controller: 'editAccountCtrl',
          controllerAs: 'editAccountCtrl',
          resolve: {
            myBudget: function(db) {
              return myBudget;
            },
            myAccount: function($stateParams, account) {
              const Account = account($stateParams.budgetId);

              return new Account();
            }
          }
        }).closePromise.finally(() => {
          $state.go('^');
        });
      },
      onExit: ngDialog => {
        ngDialog.closeAll();
      }
    })
    .state('user.app.manager.view.reports', {
      url: '/reports',
      templateUrl: 'views/reports.html',
      controller: 'reportCtrl as reportCtrl'
    });

  $locationProvider.html5Mode(true);

  ngDialogProvider.setDefaults({
    className: 'ngdialog-theme-default modal'
  });
});
