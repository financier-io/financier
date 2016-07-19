angular.module('financier').provider('db', function() {
  const that = this;
  that.adapter = 'idb';

  this.$get = (Budget, budgetManager, $http, $rootScope) => {
    const db = new PouchDB('financier', {
      adapter: that.adapter
    });

    return {
      budget,
      budgets: budgets(),
      _pouch: db,
      sync: {
        start: startSync,
        cancel: cancelSync
      }
    };

    let sync;

    function cancelSync() {
      if (sync) {
        sync.cancel();
      }
    }

    function startSync(dbName) {
      cancelSync();

      const host = window.location.host;

      sync = db.sync(`https://${host}/db/${dbName}`, {
        live: true,
        retry: true
      })
      .on('change', function (info) {
        $rootScope.$broadcast('syncStatus:update', 'syncing');
      })
      .on('paused', function () {
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

  };
});
