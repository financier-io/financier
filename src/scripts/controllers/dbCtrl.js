angular.module('financier').controller('dbCtrl', function(db, $scope, $q, Month) {
  this.getNewBudgetView = function(date) {
    date = new Date(date);
    $q.all([
      db.budget.getFourMonthsFrom(date),
      db.categories
    ])
    .then(([allMonths, categories]) => {
      this.allMonths = allMonths;

      this.months = getView(date, allMonths);
      this.categories = categories;

      db.budget.propagateRolling(
        categories
          .map((m => m.categories.map(c => c._id)))
          .reduce((a, b) => a.concat(b)), 
        allMonths[0]
      );
    });
  };

  const month = new Date();
  this.currentMonth = month;

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
