import PouchDB from "pouchdb-browser";

angular.module("financier").provider("db", function () {
  const that = this;

  that.adapter = null;

  this.$get = (Budget, BudgetOpened, budgetManager, $http, $rootScope) => {
    let db, sync, changes;

    create();

    return {
      budget,
      budgets: budgets(),
      budgetsOpened: budgetsOpened(),
      get _pouch() {
        return db;
      },
      destroy,
      sync: {
        start: startSync,
        cancel: cancelSync,
      },
    };

    function cancelSync() {
      if (sync) {
        sync.cancel();
      }

      if (changes) {
        changes.cancel();
      }
    }

    function startSync(dbName, isValidSub) {
      const options = {
        live: true,
        retry: true,
        batch_size: 500,
      };

      cancelSync();

      const host = window.location.host;

      if (isValidSub) {
        sync = db
          .sync(`https://${host}/db/${dbName}`, options)
          .on("paused", function () {
            $rootScope.$apply(() => {
              // user went offline
              $rootScope.$broadcast("syncStatus:update", "complete");
            });
          });
      } else {
        sync = PouchDB.replicate(
          `https://${host}/db/${dbName}`,
          db,
          options,
        ).on("paused", function () {
          $rootScope.$apply(() => {
            // user went offline
            $rootScope.$broadcast("syncStatus:update", "subscription_ended");
          });
        });
      }

      sync
        .on("change", () => {
          $rootScope.$broadcast("syncStatus:update", "syncing");
        })
        .on("active", () => {
          $rootScope.$apply(() => {
            $rootScope.$broadcast("syncStatus:update", "syncing");
          });
          // replicate resumed (e.g. user went back online)
        })
        .on("denied", () => {
          $rootScope.$apply(() => {
            $rootScope.$broadcast("syncStatus:update", "error");
            // a document failed to replicate (e.g. due to permissions)
          });
        })
        .on("complete", () => {
          $rootScope.$broadcast("syncStatus:update", "error");
          // handle complete
        })
        .on("error", (err) => {
          $rootScope.$apply(() => {
            console.log("sync error", err);

            $rootScope.$broadcast("syncStatus:update", "error");
            // handle error
          });
        });

      changes = db
        .changes({
          since: "now",
          live: true,
          include_docs: true,
        })
        .on("change", (change) => {
          // received a change
          $rootScope.$apply(() => {
            $rootScope.$broadcast("pouchdb:change", change);
          });
        })
        .on("error", (err) => {
          // handle errors
          console.log("error subscribing to changes feed", err);
        });
    }

    function destroy() {
      cancelSync();

      return db.destroy().then(create);
    }

    function create() {
      db = new PouchDB("financier", {
        adapter: that.adapter,
        size: 50,
        auto_compaction: true,
      });
    }

    function budget(budgetId) {
      return budgetManager(db, budgetId);
    }

    function budgets() {
      function put(budget) {
        return db.put(budget.toJSON()).then((res) => {
          budget._rev = res.rev;
        });
      }

      function get(id) {
        return db.get(`${Budget.prefix}${id}`).then((b) => {
          const budget = new Budget(b);
          budget.subscribe(put);

          return budget;
        });
      }

      function all() {
        return db
          .allDocs({
            include_docs: true /* eslint camelcase:0 */,
            startkey: Budget.startKey,
            endkey: Budget.endKey,
          })
          .then((res) => {
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
        get,
      };
    }

    function budgetsOpened() {
      function put(budgetOpened) {
        return db.put(budgetOpened.toJSON()).then((res) => {
          budgetOpened._rev = res.rev;
        });
      }

      function get(id) {
        return db.get(`${BudgetOpened.prefix}${id}`).then((b) => {
          const budgetOpened = new BudgetOpened(b);
          budgetOpened.subscribe(put);

          return budgetOpened;
        });
      }

      function all() {
        return db
          .allDocs({
            include_docs: true,
            startkey: BudgetOpened.startKey,
            endkey: BudgetOpened.endKey,
          })
          .then((res) => {
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
        get,
      };
    }
  };
});
