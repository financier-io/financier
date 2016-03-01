angular.module('financier').provider('db', function(defaultCategories) {
  const that = this;
  that.adapter = 'idb';

  this.$get = Settings => {
    const db = new PouchDB('financier', {
      adapter: that.adapter
    });

    return {
      budget,
      budgets,
      _pouch: db
    };

    function budget(budgetId) {

      return budgetDb(db, budgetId);

    }

    function budgets() {

    }

  };
});
