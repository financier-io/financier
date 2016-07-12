angular.module('financier').controller('createBudgetCtrl', function($q, $scope, $rootScope, db, Budget) {
  this.submit = function(name) {
    const budget = new Budget({ name });

    $q.all([
      db.budgets.put(budget),
      db.budget(budget.id).initialize()
    ])
    .then(() => {
      $rootScope.$broadcast('budgets:update');
      $scope.closeThisDialog();
    });
  };
});
