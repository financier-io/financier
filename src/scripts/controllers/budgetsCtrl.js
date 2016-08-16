angular.module('financier').controller('budgetsCtrl', function(Budget, myBudgets, $scope, $http, db, ngDialog) {
  this.budgets = myBudgets;

  const getBudgets = () => {
    db.budgets.all().then(res => {
      this.budgets = res;

      $scope.$apply();
    });
  };

  $scope.$on('pouchdb:change', (e, change) => {
    // if it's a Budget
    if (Budget.contains(change.id)) {

      // look through our budgets to see if it exists
      for (let i = 0; i < this.budgets.length; i++) {
        if (this.budgets[i]._id === change.id) {

          if (change.deleted) {
            this.budgets.splice(i, 1);
          } else {
            this.budgets[i].data = change.doc;
          }

          return;
        }
      }

      // Couldn't find it
      const b = new Budget(change.doc);
      b.subscribe(db.budgets.put);

      this.budgets.push(b);
    }
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
      // TODO might not need to be done due to _changes work
      getBudgets();
    });
  };

});
