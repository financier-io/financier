angular.module('financier').controller('dbCtrl', function(db, budgetRecord, data, myBudget, myAccounts, $stateParams, $scope, $q, month) {
  let {manager, categories} = data;

  const budgetId = $stateParams.budgetId;

  const Month = month(budgetId);

  this.categories = categories;
  this.accounts = myAccounts;
  this.budgetRecord = budgetRecord;

  budgetRecord.open();

  this.currentMonth = new Date();
  this.months = getView(this.currentMonth);

  $scope.$watch(
    () => this.currentMonth,
    (currentMonth, oldCurrentMonth) => {
      if (angular.isDefined(currentMonth)) {
        this.months = getView(currentMonth.toDate ? currentMonth.toDate() : currentMonth);
      }
    }
  );

  const refreshEverything = () => {
      return $q.all([
        myBudget.budget(),
        myBudget.categories.all()
      ])
      .then(([_manager, _categories]) => {
        if (_categories.length) {
          _manager.propagateRolling(
            _categories
              .map((m => m._categories.map(c => c.id)))
              .reduce((a, b) => a.concat(b))
          );
        }

        this.categories = _categories;
        manager = _manager;

        this.months = getView(this.currentMonth.toDate ? this.currentMonth.toDate() : this.currentMonth);
      })
      .catch(e => {
        throw e;
      });
  };

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
    throw new Error('Could not find base month in database!');
  }
});
