angular.module('financier').controller('createBudgetCtrl', function($scope, $rootScope, db, Budget) {
  this.submit = function(name) {
    db.budgets.put(new Budget({ name }))
    .then(() => {
      $rootScope.$broadcast('budgets:update');
      $scope.closeThisDialog();
    });
  };
});
