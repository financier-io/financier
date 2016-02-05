angular.module('financier').controller('dbCtrl', function(db, $scope, $q) {
  const budgetDB = new PouchDB('financierer', {
    adapter: 'memory'
  });
  const categoriesDB = new PouchDB('financierercats', {
    adapter: 'memory'
  });

  const bdg = db.budget(budgetDB);

  $q.all([
    bdg.allUntil(new Date()),
    db.categories(categoriesDB)
  ])
  .then(([months, categories]) => {
    console.log('months', months);
    console.log('categories', categories);
    this.months = months;
    this.categories = categories;

    bdg.propagateRolling(categories, months[0]);
  });
});
