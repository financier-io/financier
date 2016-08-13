import Papa from 'papaparse';

angular.module('financier').factory('importBudget', ($q, db, transaction, account) => {
  return (budget, budgetFile, transactionsFile) => {
    const Transaction = transaction(budget.id);
    const Account = account(budget.id);
    // TODO budget file

    const accounts = {},
      categories = {},
      masterCategories = {};

    // parseBudget().then();
    parseTransaction();

    function parseBudget() {
      const deferred = $q.defer();

      Papa.parse(budgetFile, {
        complete: function(results) {
          for (let i = 1; i < results.data.length; i++) {
            const row = results.data[i];

            const value = +row[10].slice(1) || -row[9].slice(1);

            if (!accounts[row[0]]) {
              const acc = new Account({
                name: row[0]
              });

              db.budgets.put(acc);
              accounts[row[0]] = acc;
            }

            db.budgets.put(new Transaction({
              value: value * 100,
              date: new Date(row[3]).toISOString(),
              account: accounts[row[0]].id,
              memo: row[8],
              cleared: row[11] === 'C'
            }));

            deferred.resolve();
          }
        }
      });

      return deferred.promise;
    }


    function parseTransaction() {
      const deferred = $q.defer();

      Papa.parse(transactionsFile, {
        complete: function(results) {
          for (let i = 1; i < results.data.length; i++) {
            const row = results.data[i];

            const value = +row[10].slice(1) || -row[9].slice(1);

            if (!accounts[row[0]]) {
              const acc = new Account({
                name: row[0]
              });

              db.budgets.put(acc);
              accounts[row[0]] = acc;
            }

            db.budgets.put(new Transaction({
              value: value * 100,
              date: new Date(row[3]).toISOString(),
              account: accounts[row[0]].id,
              memo: row[8],
              cleared: row[11] === 'C'
            }));

            deferred.resolve();
          }
        }
      });

      return deferred.promise;
    }

  }
})
