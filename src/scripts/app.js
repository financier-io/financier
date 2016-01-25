let financier = angular.module('financier', ['ui.router', 'ngResize']);

financier.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  //
  // For any unmatched url, redirect to /state1
  // $urlRouterProvider.otherwise('/state1');
  //
  // Now set up the states
  $stateProvider
    .state('welcome', {
      url: '/',
      templateUrl: 'views/welcome.html',
      controller: 'welcomeCtrl as welcomeCtrl'
    })
    .state('app', {
      abstract: true,
      templateUrl: 'views/header.html'
    })
    .state('app.budget', {
      url: '/budget',
      templateUrl: 'views/budget.html',
      controller: 'budgetCtrl as budgetCtrl'
    })
    .state('app.reports', {
      url: '/reports',
      templateUrl: 'views/reports.html'
    })
    .state('app.allAccounts', {
      url: '/all-accounts',
      templateUrl: 'views/allAccounts.html'
    });

  $locationProvider.html5Mode(true);
});