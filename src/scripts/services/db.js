angular.module('financier').provider('db', function() {
  const that = this;
  that.adapter = 'idb';

  this.$get = (Budget, budgetDb, $http) => {
    $http.post('/db/_session/', {
      name: 'boom',
      password: 'boom'
    });

    const db = new PouchDB('financier', {
      adapter: that.adapter
    });

    db.sync('https://192.168.99.100/db/test', {
      live: true,
      retry: true
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

      function get(id) {
        return db.get(`budget_${id}`).then(b => {
          const budget = new Budget(b);
          budget.subscribe(put);

          return budget;
        });
      }

      function all() {
        return db.allDocs({
          include_docs: true, /* eslint camelcase:0 */
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
        put,
        get
      };
    }

  };
});
