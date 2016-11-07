import PouchDB from 'pouchdb';

angular.module('financier').provider('db', function() {
  const that = this;

  that.adapter = null;

  this.$get = (Budget, BudgetOpened, budgetManager, $http, $rootScope) => {
    let db;

    create();

    return {
      budget,
      budgets: budgets(),
      budgetsOpened: budgetsOpened(),
      _pouch: db,
      destroy,
      sync: {
        start: startSync,
        cancel: cancelSync
      }
    };

    let sync, changes;

    function cancelSync() {
      if (sync) {
        sync.cancel();
      }

      if (changes) {
        changes.cancel();
      }
    }

    function startSync(dbName) {
      cancelSync();

      const host = window.location.host;

      sync = db.sync(`https://${host}/db/${dbName}`, {
        live: true,
        retry: true,
        batch_size: 500
      })
      .on('change', function (info) {
        $rootScope.$broadcast('syncStatus:update', 'syncing');
      })
      .on('paused', function () {
        // user went offline
        $rootScope.$broadcast('syncStatus:update', 'complete');
      })
      .on('active', function () {
        $rootScope.$broadcast('syncStatus:update', 'syncing');
        // replicate resumed (e.g. user went back online)
      })
      .on('denied', function (info) {
        $rootScope.$broadcast('syncStatus:update', 'error');
        // a document failed to replicate (e.g. due to permissions)
      })
      .on('complete', function (info) {
        $rootScope.$broadcast('syncStatus:update', 'error');
        // handle complete
      })
      .on('error', function (err) {
        $rootScope.$broadcast('syncStatus:update', 'error');
        // handle error
      });

      changes = db.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', change => {
        // received a change
        $rootScope.$broadcast('pouchdb:change', change);
      }).on('error', err => {
        // handle errors
        console.log('error subscribing to changes feed', err);
      });
    }

    function destroy() {
      return db.destroy()
      .then(create);
    }

    function create() {
      db = new PouchDB('financier', {
        adapter: that.adapter
      });
    }

    function budget(budgetId) {

      return budgetManager(db, budgetId);

    }

    function budgets() {
      function put(budget) {
        return db.put(budget.toJSON()).then(res => {
          budget._rev = res.rev;
        });
      }

      function get(id) {
        return db.get(`${Budget.prefix}${id}`).then(b => {
          const budget = new Budget(b);
          budget.subscribe(put);

          return budget;
        });
      }

      function all() {
        return db.allDocs({
          include_docs: true, /* eslint camelcase:0 */
          startkey: Budget.startKey,
          endkey: Budget.endKey
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

    function budgetsOpened() {
      function put(budgetOpened) {
        return db.put(budgetOpened.toJSON()).then(res => {
          budgetOpened._rev = res.rev;
        });
      }

      function get(id) {
        return db.get(`${BudgetOpened.prefix}${id}`).then(b => {
          const budgetOpened = new BudgetOpened(b);
          budgetOpened.subscribe(put);

          return budgetOpened;
        });
      }

      function all() {
        return db.allDocs({
          include_docs: true, /* eslint camelcase:0 */
          startkey: BudgetOpened.startKey,
          endkey: BudgetOpened.endKey
        }).then(res => {
          const budgetsOpened = {};

          for (let i = 0; i < res.rows.length; i++) {
            const budgetOpened = new BudgetOpened(res.rows[i].doc);
            budgetOpened.subscribe(put);

            budgetsOpened[budgetOpened.id] = budgetOpened;
          }


          return budgetsOpened;
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
