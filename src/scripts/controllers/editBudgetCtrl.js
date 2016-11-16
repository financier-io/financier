angular.module('financier').controller('editBudgetCtrl', function(currencies, $scope, budgetRecord) {
  this.name = budgetRecord.name;
  this.currency = budgetRecord.currency;

  this.currencies = currencies;

  this.submit = (name, currency) => {
    this.loading = true;

    const saveFn = budgetRecord.fn;
    budgetRecord.fn = null;

    budgetRecord.name = this.name;
    budgetRecord.currency = this.currency;

    saveFn(budgetRecord)
    .then(() => {
      this.loading = false;

      $scope.closeThisDialog(true);
    });

    budgetRecord.fn = saveFn;
  };
})
