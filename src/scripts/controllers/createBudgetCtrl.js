angular
  .module("financier")
  .controller(
    "createBudgetCtrl",
    function (
      $translate,
      $q,
      $state,
      $scope,
      $rootScope,
      db,
      Budget,
      BudgetOpened,
      payee,
      currencies
    ) {
      this.currencies = currencies;

      this.currency = "USD";

      this.submit = function (name, currency) {
        const budget = new Budget({ name, currency });
        const budgetOpened = new BudgetOpened({
          _id: BudgetOpened.prefix + budget.id,
        });

        const Payee = payee(budget.id),
          initialBalancePayee = new Payee({
            name: $translate.instant("INITIAL_BALANCE"),
            autosuggest: false,
            internal: true,
            _id: `${Payee.prefix}initial-balance`,
          });

        this.loading = true;

        $q.all([
          db.budgets.put(budget),
          db.budgetsOpened.put(budgetOpened),
          db.budgets.put(initialBalancePayee),
          db.budget(budget.id).initialize(),
        ])
          .then(() => {
            $state.go("user.app.manager.view.budget", {
              budgetId: budget.id,
            });
          })
          .catch((e) => {
            this.loading = false;

            throw e;
          });
      };

      this.restore = () => {
        $state.go("user.budget.import");
      };
    }
  );
