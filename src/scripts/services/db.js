angular.module('financier').provider('db', function(defaultCategories) {
  const that = this;
  that.adapter = 'idb';

  this.$get = Budget => {
    const db = new PouchDB('financier', {
      adapter: that.adapter
    });

    return {
      budget,
      budgets: budgets(),
      _pouch: db
    };

    function budget(budgetId) {

      return budgetDb(db, budgetId);

    }

    function budgets() {
      function put(budget) {
        return db.put(budget.toJSON()).then(res => {
          budget._rev = res.rev;
        });
      }

      function all() {
        return db.allDocs({
          include_docs: true,
          startkey: `budget_`,
          endkey: `budget_\uffff`
        }).then(res => {
          const budgets = [];
          for (let i = 0; i < res.rows.length; i++) {
            const budget = new Budget(res.rows[i].doc);
            budget.subscribe(put);

            budgets.push(budget);
          }

          return budgets;
        });
      }

      return {
        all,
        put
      };
    }

  };
});
