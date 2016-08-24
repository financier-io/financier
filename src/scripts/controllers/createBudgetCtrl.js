angular.module('financier').controller('createBudgetCtrl', function($q, $state, $scope, $rootScope, db, Budget, payee) {
  this.submit = function(name) {
    const budget = new Budget({ name });

    const Payee = payee(budget.id),
      initialBalancePayee = new Payee({
        name: 'Initial balance',
        autosuggest: false,
        internal: true
      });

    budget.initialBalancePayee = initialBalancePayee.id;

    this.loading = true;

    $q.all([
      db.budgets.put(budget),
      db.budgets.put(initialBalancePayee),
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
