angular.module('financier').controller('dbCtrl', function(db, myBudget, $stateParams, $scope, $q, month) {
  const budgetId = $stateParams.budgetId;

  const b = db.budget(budgetId);
  const Month = month(budgetId);

  this.budget = myBudget;

  // Triggers 'last opened on' date change
  this.budget.open();


  this.getNewBudgetView = function(date) {
    date = new Date(date);
    return $q.all([
      b.budget.getFourMonthsFrom(date),
      b.categories
    ])
    .then(([allMonths, categories]) => {
      this.allMonths = allMonths;
      this.categories = categories;

      this.months = getView(date, allMonths);

      b.budget.propagateRolling(
        categories
          .map((m => m.categories.map(c => c.id)))
          .reduce((a, b) => a.concat(b)), 
        allMonths[0]
      );
    });
  };

  let m = new Date();
  if (myBudget.lastMonthOpenedId) {
    m = moment(myBudget.lastMonthOpenedId);
  }
  this.currentMonth = m;

  $scope.$watch(
    () => this.currentMonth,
    (currentMonth, oldCurrentMonth) => {
      if (angular.isDefined(currentMonth)) {
        this.getNewBudgetView(currentMonth);
      }

      if (currentMonth && currentMonth !== m) {
        myBudget.lastMonthOpenedId = Month.createID(new Date(currentMonth));
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
