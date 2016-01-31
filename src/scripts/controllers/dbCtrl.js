angular.module('financier').controller('dbCtrl', function(db, $scope) {
  const budgetDB = new PouchDB('financierer', {
    adapter: 'memory'
  });
  const categoriesDB = new PouchDB('financierercats', {
    adapter: 'memory'
  });

  db.budget(budgetDB).allUntil(new Date()).then(res => {
    this.months = res;
    $scope.$apply(); // #dealwithit
  });

  db.categories(categoriesDB).then(res => {
    this.categories = res;
    this.months[0].setBudget(res[0]._id, 50);
    $scope.$apply(); // #dealwithit
  });
});