angular.module('financier').controller('budgetsCtrl', function(myBudgets, $scope, $http, db, ngDialog, budgetDb) {
  // $http.get('/api/version').then(res => {
  //   this.version = res.data;
  // });

  const dbChanges = db._pouch.changes({
    live: true,
    since: 'now'
  })
  .on('change', change => {
    if (change.id.indexOf('budget_') === 0) {
      $scope.$broadcast('budgets:update');
    }
  });

  $scope.$on('$destroy', () => {
    dbChanges.cancel();
  });

  const getBudgets = () => {
    db.budgets.all().then(res => {
      this.budgets = res;

      $scope.$apply();
    });
  };

  this.budgets = myBudgets;


  $scope.$on('budgets:update', () => {
    getBudgets();
  });

  this.remove = (budget, e) => {
    e.preventDefault();
    e.stopPropagation();

    const budgetId = budget._id;

    budget.remove().then(() => {
      getBudgets();
    });
    db.budget(budgetId).remove();
  };

});
