angular.module('financier').controller('budgetsCtrl', function(myBudgets, $scope, $http, db, ngDialog) {
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

  let removingBudget;

  this.isRemoving = budget => budget === removingBudget;

  this.removing = (budget, e) => {
    e.preventDefault();
    e.stopPropagation();

    removingBudget = budget;
  }

  this.remove = budget => {
    db.budget(budget.id).remove()
    .then(() => {
      return budget.remove();
    })
    .then(() => {
      getBudgets();
    });
  };

});
