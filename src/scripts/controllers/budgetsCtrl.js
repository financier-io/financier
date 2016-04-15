angular.module('financier').controller('budgetsCtrl', function(myBudgets, $scope, $http, db, ngDialog, budgetDb) {
  // $http.get('/api/version').then(res => {
  //   this.version = res.data;
  // });

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
