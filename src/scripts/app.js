let financier = angular.module('financier', [
  'ui.router',
  'ngResize'
]);

financier.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
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
    .state('newBudget', {
      url: '/',
      templateUrl: 'views/newBudget.html',
      controller: 'newBudgetCtrl as newBudgetCtrl'
    })
    .state('app', {
      url: '/:budgetId',
      templateUrl: 'views/header.html'
    })
    .state('app.db', {
      abstract: true,
      controller: 'dbCtrl as dbCtrl',
      template: '<ui-view></ui-view>'
    })
    .state('app.db.budget', {
      url: '/budget',
      templateUrl: 'views/budget.html',
      controller: 'budgetCtrl as budgetCtrl'
    })
    .state('app.db.reports', {
      url: '/reports',
      templateUrl: 'views/reports.html'
    })
    .state('app.db.account', {
      url: '/account',
      templateUrl: 'views/account.html',
      controller: 'accountCtrl as accountCtrl'
    });

  $locationProvider.html5Mode(true);
});