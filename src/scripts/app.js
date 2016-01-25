let financier = angular.module('financier', ['ui.router']);

financier.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  // $urlRouterProvider.otherwise("/state1");
  //
  // Now set up the states
  $stateProvider
    .state('app', {
      url: "",
      templateUrl: "views/header.html"
    })
    .state('app.budget', {
      url: "/budget",
      templateUrl: "views/budget.html"
    })
    .state('app.reports', {
      url: "/reports",
      templateUrl: "views/reports.html"
    })
    .state('app.allAccounts', {
      url: "/all-accounts",
      templateUrl: "views/allAccounts.html"
    });
});