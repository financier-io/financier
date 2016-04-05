let financier = angular.module('financier', [
  'ui.router',
  'ngResize',
  'ng-sortable',
  'ngAnimate',
  'ngDialog',
  'ngMessages'
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
    .state('budget', {
      url: '/',
      templateUrl: 'views/budgets.html',
      controller: 'budgetsCtrl as budgetsCtrl'
    })
    .state('budget.create', {
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
    .state('app', {
      url: '/:budgetId',
      templateUrl: 'views/header.html',
      controller: $scope => {
        angular.element(document.body).addClass('overflow-hidden');

        $scope.$on('$destroy', () => {
          angular.element(document.body).removeClass('overflow-hidden');
        });
      }
    })
    .state('app.db', {
      abstract: true,
      controller: 'dbCtrl as dbCtrl',
      template: '<ui-view state-class class="view-transition"></ui-view>',
      resolve: {
        myBudget: function(db, $stateParams) {
          return db.budgets.get($stateParams.budgetId);
        }
      }
    })
    .state('app.db.budget', {
      url: '/budget',
      templateUrl: 'views/budget.html',
      controller: 'budgetCtrl as budgetCtrl'
    })
    .state('app.db.account', {
      url: '/account/:accountId',
      templateUrl: 'views/account.html',
      controller: 'accountCtrl as accountCtrl',
      resolve: {
        myBudget: (db, $stateParams) => {
          return db.budget($stateParams.budgetId);
        },
        myAccounts: (db, $stateParams) => {
          return db.budget($stateParams.budgetId).accounts.all();
        }
      }
    })
    .state('app.db.account.edit', {
      url: '/edit',
      onEnter: function(ngDialog, $state, $stateParams) {
        ngDialog.open({
          template: 'views/modal/editAccount.html',
          controller: 'editAccountCtrl',
          controllerAs: 'editAccountCtrl',
          resolve: {
            myBudget: function(db) {
              return db.budget($stateParams.budgetId);
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
    .state('app.db.account.create', {
      url: '/create',
      onEnter: function(ngDialog, $state, $stateParams) {
        ngDialog.open({
          template: 'views/modal/editAccount.html',
          controller: 'editAccountCtrl',
          controllerAs: 'editAccountCtrl',
          resolve: {
            myBudget: function(db) {
              return db.budget($stateParams.budgetId);
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
    .state('app.db.reports', {
      url: '/reports',
      templateUrl: 'views/reports.html',
      controller: 'reportCtrl as reportCtrl'
    });

  $locationProvider.html5Mode(true);

  ngDialogProvider.setDefaults({
    className: 'ngdialog-theme-default modal'
  });
});
