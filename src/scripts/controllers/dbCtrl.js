angular.module('financier').controller('dbCtrl', function(db, $stateParams, $scope, $q, month) {
  const b = db.budget($stateParams.budgetId);


  const Month = month($stateParams.budgetId);

  this.getNewBudgetView = function(date) {
    date = new Date(date);
    $q.all([
      b.budget.getFourMonthsFrom(date),
      b.categories,
      db.budgets.get($stateParams.budgetId)
    ])
    .then(([allMonths, categories, budget]) => {
      this.allMonths = allMonths;
      this.categories = categories;
      this.budget = budget;

      // Triggers 'last opened on' date change
      budget.open();

      this.months = getView(date, allMonths);

      b.budget.propagateRolling(
        categories
          .map((m => m.categories.map(c => c._id)))
          .reduce((a, b) => a.concat(b)), 
        allMonths[0]
      );
    });
  };

  const m = new Date();
  this.currentMonth = m;

  $scope.$watch(
    () => this.currentMonth,
    currentMonth => {
      if (angular.isDefined(currentMonth)) {
        this.getNewBudgetView(currentMonth);
      }
    }
  );

  function getView(date, allMonths) {
    const dateId = Month.createID(date);

    for (let i = allMonths.length - 1; i >= 0; i--) {
      if (allMonths[i].date === dateId) {
        return allMonths.slice(i, i + 5);
      }
    }
    throw new Error(`Couldn't find base month in database!`);
  }
});
