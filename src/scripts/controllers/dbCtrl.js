angular.module('financier').controller('dbCtrl', function(data, myBudget, $stateParams, $scope, $q, month) {
  const {manager, categories} = data;

  const budgetId = $stateParams.budgetId;

  const Month = month(budgetId);

  this.budget = myBudget;

  // Triggers 'last opened on' date change
  this.budget.open();

  this.categories = categories;

  this.months = getView(new Date());

  let m = new Date();
  if (myBudget.lastMonthOpenedId) {
    m = moment(myBudget.lastMonthOpenedId);
  }
  this.currentMonth = m;

  $scope.$watch(
    () => this.currentMonth,
    (currentMonth, oldCurrentMonth) => {
      if (angular.isDefined(currentMonth)) {
        this.months = getView(currentMonth.toDate ? currentMonth.toDate() : currentMonth);
      }

      if (currentMonth && currentMonth !== m) {
        myBudget.lastMonthOpenedId = Month.createID(new Date(currentMonth));
      }
    }
  );

  function getView(date) {
    // Make sure that we have the months
    manager.getMonth(date);
    const dateUntil = moment(date).add(5, 'months').toDate();
    manager.getMonth(dateUntil);

    const dateId = Month.createID(date);

    for (let i = manager.months.length - 1; i >= 0; i--) {
      if (manager.months[i].date === dateId) {
        return manager.months.slice(i, i + 5);
      }
    }
    throw new Error(`Couldn't find base month in database!`);
  }
});
