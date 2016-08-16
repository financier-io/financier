angular.module('financier').controller('createBudgetCtrl', function($q, $state, $scope, $rootScope, db, Budget) {
  this.submit = function(name) {
    const budget = new Budget({ name });

    this.loading = true;

    $q.all([
      db.budgets.put(budget),
      db.budget(budget.id).initialize()
    ])
    .then(() => {
      $state.go('user.app.manager.view.budget', {
        budgetId: budget.id
      })
      .then(() => {
        $scope.closeThisDialog(true);
      });

    })
    .catch(e => {
      this.loading = false;

      throw e;
    });
  };
});
