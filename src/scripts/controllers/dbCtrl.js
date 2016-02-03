angular.module('financier').controller('dbCtrl', function(db, $scope, $q) {
  const budgetDB = new PouchDB('financierer', {
    adapter: 'idb'
  });
  const categoriesDB = new PouchDB('financierercats', {
    adapter: 'idb'
  });

  const bdg = db.budget(budgetDB);

  $q.all([
    bdg.allUntil(new Date()),
    db.categories(categoriesDB)
  ])
  .then(([months, categories]) => {
    this.months = months;
    this.categories = categories;

    bdg.propagateRolling(categories, months[0]);
  });
});