angular.module('financier').controller('dbCtrl', function(db, $scope) {
  const budgetDB = new PouchDB('financierer', {
    adapter: 'idb'
  });
  const categoriesDB = new PouchDB('financierercats', {
    adapter: 'idb'
  });

  db.budget(budgetDB).allUntil(new Date()).then(res => {
    console.log(res)
    this.months = res;
    $scope.$apply(); // #dealwithit
  });

  db.categories(categoriesDB).then(res => {
    console.log(res)
    this.categories = res;
    $scope.$apply(); // #dealwithit
  });
});