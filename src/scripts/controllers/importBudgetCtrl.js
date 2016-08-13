angular.module('financier').controller('importBudgetCtrl', function($rootScope, $scope, importBudget, db, Budget) {
  this.submit = (name, budgetFile, transactionsFile) => {
    console.log(name, budgetFile, transactionsFile)
    const budget = new Budget({ name });
    
    importBudget(budget, budgetFile, transactionsFile);

    db.budgets.put(budget)
    .then(() => {
      $rootScope.$broadcast('budgets:update');
      $scope.closeThisDialog();
    });
  };

});
