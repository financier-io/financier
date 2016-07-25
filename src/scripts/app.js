let financier = angular.module('financier', [
  'ui.router',
  'ngResize',
  'ng-sortable',
  'ngAnimate',
  'ngDialog',
  'ngMessages',
  'angular-ladda-lw',
  'angular-md5',
  'angularResizable',
  'smart-table',
  'cfp.hotkeys'
]).run((offline, $rootScope, $timeout) => {
  offline.register();

  $rootScope.$on('serviceWorker', (e, status) => {
    $timeout(() => {
      $rootScope._offlineStatus = status;
    });
  });
});

financier.config(function($stateProvider, $urlRouterProvider, $injector, $locationProvider, ngDialogProvider) {
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
        },
        budgetRecord: function(db, $stateParams, $state) {
          return db.budgets.get($stateParams.budgetId)
          .catch(e => {
            if (e.status === 404) {
              return $state.go('404');
            }

            throw e;
          });
        }
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
      templateUrl: 'views/account.html',
      controller: 'accountCtrl as accountCtrl'
    })
    .state('user.app.manager.view.reports', {
      url: '/reports',
      templateUrl: 'views/reports.html',
      controller: 'reportCtrl as reportCtrl'
    })
    .state('404', {
      templateUrl: 'views/404.html'
    });

  $locationProvider.html5Mode(true);

  $urlRouterProvider.otherwise(function($injector, $location){
     const state = $injector.get('$state');
     state.go('404');
     return $location.path();
  });

  ngDialogProvider.setDefaults({
    className: 'ngdialog-theme-default modal'
  });
});
