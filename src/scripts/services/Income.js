angular.module('financier').factory('Income', (transaction) => {
  return budgetId => {
    const Transaction = transaction(budgetId);

    return class Income extends Transaction {};
  };
});
