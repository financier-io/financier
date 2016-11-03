import uiRouter from 'angular-ui-router';
import ngAnimate from 'angular-animate';
import ngMessages from 'angular-messages';
import ngSanitize from 'angular-sanitize';
import ngDialog from 'ng-dialog';
import ngMd5 from 'angular-md5';
import smartTable from 'angular-smart-table';
import ngTranslate from 'angular-translate';
import dynamicLocale from 'angular-dynamic-locale';
import vsRepeat from 'angular-vs-repeat';
import 'angular-dateParser/dist/angular-dateparser';
import 'angular-resizable';
import 'ng-resize';
import 'angular-hotkeys';
import 'sortablejs/ng-sortable';
import 'angular-ladda-lw/dist/angular-ladda-lw';

let financier = angular.module('financier', [
  uiRouter,
  ngAnimate,
  ngMessages,
  ngSanitize,
  ngDialog,
  ngMd5,
  smartTable,
  ngTranslate,
  dynamicLocale,
  vsRepeat,
  'ngLocale',
  'dateParser',
  'angularResizable',
  'ngResize',
  'cfp.hotkeys',
  'ng-sortable',
  'angular-ladda-lw'
]).run((offline, $rootScope, $timeout) => {
  offline.install();

  $rootScope.$on('offlineStatus', (e, status) => {
    $timeout(() => {
      $rootScope._offlineStatus = status;
    });
  });

  $rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams){
    console.log('$stateChangeError - fired when an error occurs during transition.');
    console.log(arguments);
  });
});

financier.config(function($stateProvider, $urlRouterProvider, $injector, $locationProvider, ngDialogProvider, $translateProvider) {
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
  .state('user.verifyEmail', {
    url: '/user/verify?token',
    template: require('../views/verifyEmail.html'),
    controller: 'verifyEmailCtrl as verifyEmailCtrl'
  })
  .state('user.resetPassword', {
    url: '/user/forgot?token&email',
    template: require('../views/resetPassword.html'),
    controller: 'resetPasswordCtrl as resetPasswordCtrl'
  })
  .state('user.signup', {
    url: '/signup',
    template: require('../views/signup.html'),
    controller: 'signupCtrl as signupCtrl'
  })
  .state('user.budget', {
    url: '/',
    template: require('../views/budgets.html'),
    controller: 'budgetsCtrl as budgetsCtrl',
    resolve: {
      myBudgets: function(db) {
        return db.budgets.all();
      },
      myBudgetsOpened: function(db) {
        return db.budgetsOpened.all();
      }
    }
  })
  .state('user.budget.create', {
    url: 'create-budget',
    onEnter: function(ngDialog, $state) {
      ngDialog.open({
        template: require('../views/modal/createBudget.html'),
        controller: 'createBudgetCtrl',
        controllerAs: 'createBudgetCtrl'
      }).closePromise.finally(res => {
        if (!res) {
          $state.go('^');
        }
      });
    },
    onExit: ngDialog => {
      ngDialog.closeAll();
    }
  })
  .state('user.budget.import', {
    url: 'import-budget',
    onEnter: function(ngDialog, $state) {
      ngDialog.open({
        template: require('../views/modal/importBudget.html'),
        controller: 'importBudgetCtrl',
        controllerAs: 'importBudgetCtrl'
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
      },
      budgetOpenedRecord: function(db, $stateParams, $state) {
        return db.budgetsOpened.get($stateParams.budgetId)
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
    template: require('../views/appView.html'),
    controller: 'dbCtrl as dbCtrl',
    resolve: {
      data: function(myBudget, $q) {
        return $q.all([
          myBudget.budget(),
          myBudget.categories.all(),
          myBudget.masterCategories.all(),
          myBudget.payees.all()
        ])
        .then(([manager, categories, masterCategories, payees]) => {
          manager.propagateRolling(Object.keys(categories));

          return {manager, categories, masterCategories, payees};
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
  .state('user.app.manager.view.mobileTransaction', {
    url: '/mobile-add',
    template: require('../views/mobileTransaction.html')
  })
  .state('user.app.manager.view.budget', {
    url: '/budget',
    template: require('../views/budget.html'),
    controller: 'budgetCtrl as budgetCtrl'
  })
  .state('user.app.manager.view.account', {
    url: '/account/:accountId',
    template: require('../views/account.html'),
    controller: 'accountCtrl as accountCtrl'
  })
  .state('user.app.manager.view.reports', {
    url: '/reports',
    template: require('../views/reports.html'),
    controller: 'reportCtrl as reportCtrl'
  })
  .state('404', {
    template: require('../views/404.html'),
    controller: $rootScope => {
      $rootScope.loaded = true;
    }
  });

  $translateProvider.translations('en', require('../public/assets/translations/en.json'));
  $translateProvider.translations('es', require('../public/assets/translations/es.json'));
  $translateProvider.translations('ru', require('../public/assets/translations/ru.json'));
  $translateProvider.translations('ca', require('../public/assets/translations/ca.json'));
  $translateProvider.translations('de', require('../public/assets/translations/de.json'));
  $translateProvider.translations('no', require('../public/assets/translations/no.json'));

  $translateProvider.fallbackLanguage('en');
  $translateProvider.determinePreferredLanguage();

  $translateProvider.useSanitizeValueStrategy(null); // angular-translate's sanitization is broke as fuck

  $locationProvider.html5Mode(true);

  $urlRouterProvider.otherwise(function($injector, $location){
     const state = $injector.get('$state');
     state.go('404');
     return $location.path();
  });

  ngDialogProvider.setDefaults({
    className: 'ngdialog-theme-default modal',
    plain: true
  });
});

financier.run(function($translate, tmhDynamicLocale, tmhDynamicLocaleCache) {
  function getInjectedLocale() {
    var localInjector = angular.injector(['ngLocale']);
    return localInjector.get('$locale');
  }

  // put de-de language into cache
  let language = $translate.use().replace('_', '-').toLowerCase();

  if (language === 'es-xl') {
    $translate.use('es');

    language = 'es-419';
  }

  try {
    require(`bundle?lazy&name=i18n!angular-i18n/angular-locale_${language}.js`)(function() {
      tmhDynamicLocaleCache.put(language, getInjectedLocale());

      tmhDynamicLocale.set(language);

    });
  } catch (e) {
    console.log(`Couldn't find locale "${language}", falling back to en-us`);

    require(`bundle?lazy&name=i18n!angular-i18n/angular-locale_en-us.js`)(function() {
      tmhDynamicLocaleCache.put('en-us', getInjectedLocale());

      tmhDynamicLocale.set('en-us');
    });
  }
});
