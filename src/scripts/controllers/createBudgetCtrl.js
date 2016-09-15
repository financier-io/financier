angular.module('financier').controller('createBudgetCtrl', function($q, $state, $scope, $rootScope, db, Budget, BudgetOpened, payee, currencies) {
  this.currencies = currencies;

  this.currency = 'USD';

  this.submit = function(name, currency) {
    const budget = new Budget({ name, currency });
    const budgetOpened = new BudgetOpened({
      _id: BudgetOpened.prefix + budget.id
    });

    const Payee = payee(budget.id),
      initialBalancePayee = new Payee({
        name: 'Initial balance',
        autosuggest: false,
        internal: true,
        _id: `${Payee.prefix}initial-balance`
      });

    this.loading = true;

    $q.all([
      db.budgets.put(budget),
      db.budgetsOpened.put(budgetOpened),
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
