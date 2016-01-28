angular.module('financier').controller('welcomeCtrl', function($scope, $timeout, $state, budgetsDb) {
  // $timeout(() => {
  //   $state.go('app.budget');
  // }, 2000);

  this.budgets = [{
    id: 0,
    label: 'My Budget'
  }];

  $scope.$watch(() => this.budget, (budget) => {
    if (angular.isDefined(budget)) {
      $state.go('app.budget', { budgetId: budget.id });
    }
  });

  // budgetsDb.allDocs().then((d) => {
  //   console.log(d)
  //   this.budgets = d.rows;
  //   $scope.$apply();
  // });
});