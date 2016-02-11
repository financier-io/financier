angular.module('financier').controller('dbCtrl', function(db, $scope, $q, Income, Month, Transaction) {
  const budgetDB = new PouchDB('financierer', {
    adapter: 'idb'
  });
  const categoriesDB = new PouchDB('financierercats', {
    adapter: 'idb'
  });

  const bdg = db.budget(budgetDB);

  this.getNewBudgetView = function(date) {
    date = new Date(date);
    $q.all([
      bdg.getFourMonthsFrom(date),
      db.categories(categoriesDB)
    ])
    .then(([allMonths, categories]) => {
      this.allMonths = allMonths;
      allMonths[0].addTransaction(123, new Transaction({value: 23}));
      this.months = getView(date, allMonths);
      this.categories = categories;

      bdg.propagateRolling(categories, allMonths[0]);
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
      if (allMonths[i].data._id === dateId) {
        return allMonths.slice(i, i + 5);
      }
    }
    throw new Error(`Couldn't find base month in database!`);
  }
});
