import uiRouter from "@uirouter/angularjs";
import ngAnimate from "angular-animate";
import ngMessages from "angular-messages";
import ngSanitize from "angular-sanitize";
import ngDialog from "ng-dialog";
import ngMd5 from "angular-md5";
import smartTable from "angular-smart-table";
import "st-multi-sort";
import ngTranslate from "angular-translate";
import dynamicLocale from "angular-dynamic-locale";
import vsRepeat from "angular-vs-repeat";
import "angular-dateParser/dist/angular-dateparser.js";
import "angular-resizable";
import "angular-hotkeys-light";
import "angular-hotkeys";
import "angular-legacy-sortablejs-maintained";
import "angular-ladda-lw/dist/angular-ladda-lw.js";

import moment from "moment";

import verifyEmailHtml from "../views/verifyEmail.html?raw";
import resetPasswordHtml from "../views/resetPassword.html?raw";
import signupHtml from "../views/signup.html?raw";
import budgetsHtml from "../views/budgets.html?raw";
import createBudgetHtml from "../views/modal/createBudget.html?raw";
import importBudgetHtml from "../views/modal/importBudget.html?raw";
import appViewHtml from "../views/appView.html?raw";
import mobileTransactionHtml from "../views/mobileTransaction.html?raw";
import budgetHtml from "../views/budget.html?raw";
import accountHtml from "../views/account.html?raw";
import reportsHtml from "../views/reports.html?raw";
import heatMapHtml from "../views/reports/heatMap.html?raw";
import netWorthHtml from "../views/reports/netWorth.html?raw";
import NotFoundHtml from "../views/404.html?raw";

import en from "../assets/translations/en.json";
import es from "../assets/translations/es.json";
import ru from "../assets/translations/ru.json";
import ca from "../assets/translations/ca.json";
import de from "../assets/translations/de.json";
import no from "../assets/translations/no.json";
import fr from "../assets/translations/fr.json";

let financier = angular
  .module("financier", [
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
    "ngLocale",
    "dateParser",
    "angularResizable",
    "fps.hotkeys",
    "ng-sortable",
    "angular-ladda-lw",
  ])
  .run(($rootScope, $timeout, $filter, $state) => {
    const dateFilter = $filter("date");

    $rootScope.$on("offlineStatus", (e, status) => {
      $timeout(() => {
        $rootScope._offlineStatus = status;
      });
    });

    $rootScope.$on("$stateChangeStart", function (evt, to, params) {
      if (to.redirectToReport) {
        evt.preventDefault();
        $state.go(
          `user.app.manager.view.reports.${
            $rootScope.lastOpenedReport || "netWorth"
          }`,
          params,
        );
      }
    });

    $rootScope.$on("$stateChangeError", (...args) => {
      console.log(
        "$stateChangeError - fired when an error occurs during transition.",
      );
      console.log(args);
    });

    $rootScope.version = {
      number: VERSION.number,
      date: dateFilter(moment(VERSION.date).toDate(), "mediumDate"),
    };
  });

financier.config(
  function (
    $compileProvider,
    $stateProvider,
    $urlRouterProvider,
    $injector,
    $locationProvider,
    ngDialogProvider,
    $translateProvider,
  ) {
    $compileProvider.debugInfoEnabled(false);
    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);

    // For any unmatched url, redirect to /state1
    // $urlRouterProvider.otherwise('/state1');
    //
    // Now set up the states
    $stateProvider
      .state("user", {
        abstract: true,
        template:
          '<div ui-view class="full-height view-transition__fade"></div>',
        controller: "userCtrl as userCtrl",
      })
      .state("user.verifyEmail", {
        url: "/user/verify?token",
        template: verifyEmailHtml,
        controller: "verifyEmailCtrl as verifyEmailCtrl",
      })
      .state("user.resetPassword", {
        url: "/user/forgot?token&email",
        template: resetPasswordHtml,
        controller: "resetPasswordCtrl as resetPasswordCtrl",
      })
      .state("user.signup", {
        url: "/signup",
        template: signupHtml,
        controller: "signupCtrl as signupCtrl",
      })
      .state("user.budget", {
        url: "/",
        template: budgetsHtml,
        controller: "budgetsCtrl as budgetsCtrl",
        resolve: {
          myBudgets: function (db) {
            return db.budgets.all();
          },
          myBudgetsOpened: function (db) {
            return db.budgetsOpened.all();
          },
        },
      })
      .state("user.budget.create", {
        url: "create-budget",
        onEnter: function (ngDialog, $state) {
          ngDialog
            .open({
              template: createBudgetHtml,
              controller: "createBudgetCtrl",
              controllerAs: "createBudgetCtrl",
            })
            .closePromise.then(({ value }) => {
              if (value && value.indexOf("$") === 0) {
                // internal ngDialog close event
                $state.go("^");
              }
            });
        },
        onExit: (ngDialog) => {
          ngDialog.closeAll();
        },
      })
      .state("user.budget.import", {
        url: "import-budget",
        onEnter: function (ngDialog, $state) {
          ngDialog
            .open({
              template: importBudgetHtml,
              controller: "importBudgetCtrl",
              controllerAs: "importBudgetCtrl",
            })
            .closePromise.then(({ value }) => {
              if (value && value.indexOf("$") === 0) {
                // internal ngDialog close event
                $state.go("^");
              }
            });
        },
        onExit: (ngDialog) => {
          ngDialog.closeAll();
        },
      })
      .state("user.app", {
        url: "/:budgetId",
        abstract: true,
        template: "<ui-view></ui-view>",
        resolve: {
          myBudget: function (db, $stateParams) {
            return db.budget($stateParams.budgetId);
          },
          budgetRecord: function (db, $stateParams, $state) {
            return db.budgets.get($stateParams.budgetId).catch((e) => {
              if (e.status === 404) {
                return $state.go("404");
              }

              throw e;
            });
          },
          budgetOpenedRecord: function (db, $stateParams, $state) {
            return db.budgetsOpened.get($stateParams.budgetId).catch((e) => {
              if (e.status === 404) {
                return $state.go("404");
              }

              throw e;
            });
          },
        },
        onEnter: ($rootScope, budgetRecord) => {
          $rootScope.appTitle = `${budgetRecord.name} - Financier`;
        },
        onExit: ($rootScope) => {
          $rootScope.appTitle = "Financier";
        },
      })
      .state("user.app.manager", {
        abstract: true,
        template: appViewHtml,
        controller: "dbCtrl as dbCtrl",
        resolve: {
          data: function (myBudget, $q) {
            return $q
              .all([
                myBudget.budget(),
                myBudget.categories.all(),
                myBudget.masterCategories.all(),
                myBudget.payees.all(),
              ])
              .then(([manager, categories, masterCategories, payees]) => {
                manager.propagateRolling(Object.keys(categories));

                return { manager, categories, masterCategories, payees };
              })
              .catch((e) => {
                throw e;
              });
          },
        },
      })
      .state("user.app.manager.view", {
        abstract: true,
        template: '<ui-view state-class class="view-transition"></ui-view>',
        onEnter: () => {
          angular.element(document.body).addClass("no-overflow");
        },
        onExit: () => {
          angular.element(document.body).removeClass("no-overflow");
        },
      })
      .state("user.app.manager.view.mobileTransaction", {
        url: "/mobile-add",
        template: mobileTransactionHtml,
      })
      .state("user.app.manager.view.budget", {
        url: "/budget",
        template: budgetHtml,
        controller: "budgetCtrl as budgetCtrl",
      })
      .state("user.app.manager.view.account", {
        url: "/account/:accountId",
        template: accountHtml,
        controller: "accountCtrl as accountCtrl",
      })
      .state("user.app.manager.view.reports", {
        url: "/reports",
        template: reportsHtml,
        controller: "reportCtrl as reportCtrl",
        redirectToReport: true,
      })
      .state("user.app.manager.view.reports.heatMap", {
        url: "/heat-map",
        template: heatMapHtml,
        controller: "heatMapCtrl as heatMapCtrl",
        onEnter: ($rootScope) => {
          $rootScope.lastOpenedReport = "heatMap";
        },
      })
      .state("user.app.manager.view.reports.netWorth", {
        url: "/net-worth",
        template: netWorthHtml,
        onEnter: ($rootScope) => {
          $rootScope.lastOpenedReport = "netWorth";
        },
      })
      .state("404", {
        template: NotFoundHtml,
        controller: ($rootScope) => {
          $rootScope.loaded = true;
        },
      });

    $translateProvider.translations("en", en);
    $translateProvider.translations("es", es);
    $translateProvider.translations("ru", ru);
    $translateProvider.translations("ca", ca);
    $translateProvider.translations("de", de);
    $translateProvider.translations("no", no);
    $translateProvider.translations("fr", fr);

    $translateProvider
      .registerAvailableLanguageKeys(
        ["en", "es", "ru", "ca", "de", "no", "fr"],
        {
          "en*": "en",
          "es*": "es",
          "ru*": "ru",
          "ca*": "ca",
          "de*": "de",
          "no*": "no",
          "nn*": "no", // (alt) Norwegian Nynorsk
          "nb*": "no", // (alt) Norwegian Bokmål
          "fr*": "fr",
          "*": "en", // (fallback)
        },
      )
      .determinePreferredLanguage();

    $translateProvider.useSanitizeValueStrategy(null); // angular-translate's sanitization is broke as fuck

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise(function ($injector, $location) {
      const state = $injector.get("$state");
      state.go("404");
      return $location.path();
    });

    ngDialogProvider.setDefaults({
      className: "ngdialog-theme-default modal",
      plain: true,
    });
  },
);

financier.run(function ($translate, tmhDynamicLocale, tmhDynamicLocaleCache) {
  function getInjectedLocale() {
    var localInjector = angular.injector(["ngLocale"]);
    return localInjector.get("$locale");
  }

  // put de-de language into cache
  let language;

  if (window.navigator.languages && window.navigator.languages.length) {
    language = window.navigator.languages[0].toLowerCase();
  } else {
    language = window.navigator.language.toLowerCase();
  }

  if (language === "es-xl") {
    language = "es-419";
  }

  try {
    import(
      `../../node_modules/angular-i18n/angular-locale_${language}.js`
    ).then(() => {
      tmhDynamicLocaleCache.put(language, getInjectedLocale());

      tmhDynamicLocale.set(language);
    });
  } catch (e) {
    console.log(`Couldn't find locale "${language}", falling back to en-us`);
    console.error(e);

    import("../../node_modules/angular-i18n/angular-locale_en-us.js").then(
      () => {
        tmhDynamicLocaleCache.put("en-us", getInjectedLocale());

        tmhDynamicLocale.set("en-us");
      },
    );
  }
});
