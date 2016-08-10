angular.module('financier').factory('budgetManager', (
  month,
  account,
  category,
  transaction,
  masterCategory,
  monthManager,
  uuid,
  $q,
  MonthCategory,
  defaultCategories) => {

  return (pouch, budgetId) => {
    const Month = month(budgetId);
    const Account = account(budgetId);
    const Category = category(budgetId);
    const Transaction = transaction(budgetId);
    const MasterCategory = masterCategory(budgetId);
    const MonthManager = monthManager(budgetId);

    const ret = {
      accounts: accounts(),
      categories: categories(),
      masterCategories: masterCategories(),
      transactions: transactions(),
      budget: budget(),
      remove,
      initialize: initializeAllCategories
    };

    function remove() {
      return pouch.allDocs({
        startkey: `b_${budgetId}_`,
        endkey: `b_${budgetId}_\uffff`,
        include_docs: true
      })
      .then(res => {
        return pouch.bulkDocs(res.rows.map(row => {
          return {
            _id: row.doc._id,
            _rev: row.doc._rev,
            _deleted: true
          };
        }));
      });
    }

    return ret;


    function accounts() {
      function all() {
        return pouch.allDocs({
          include_docs: true,
          startkey: Account.startKey,
          endkey: Account.endKey
        }).then(res => {
          const accounts = [];

          for (let i = 0; i < res.rows.length; i++) {
            const acc = new Account(res.rows[i].doc);

            // acc.subscribe(put);

            accounts.push(acc);
          }

          return accounts;
        });
      }

      function get(accountId) {
        return pouch.get(Account.prefix + accountId)
        .then(acc => {
          return new Account(acc);
        });
      }

      function put(account) {
        return pouch.put(account.toJSON()).then(res => {
          account.data._rev = res.rev;
        });
      }

      return {
        all,
        put,
        get
      };
    }

    function transactions() {

      function all() {
        return pouch.allDocs({
          include_docs: true,
          startkey: Transaction.startKey,
          endkey: Transaction.endKey
        }).then(res => {
          const transactions = {};

          for (let i = 0; i < res.rows.length; i++) {
            const trans = new Transaction(res.rows[i].doc);

            // acc.subscribe(put);

            transactions[trans.id] = trans;
          }



          return Object.keys(transactions).map(key => {
            const trans = transactions[key];

            if (trans.data.transferId) {
              trans.transfer = transactions[trans.data.transferId];
            }

            return transactions[key];
          });
        });
      }

      function get(accountId) {
        return pouch.get(Transaction.prefix + accountId)
        .then(trans => {
          return new Transaction(trans);
        });
      }

      function put(transaction) {
        return pouch.put(transaction.toJSON()).then(res => {
          transaction.data._rev = res.rev;
        });
      }

      return {
        all,
        put,
        get
      };
    }

    function masterCategories() {
      function all() {
        return pouch.allDocs({
          include_docs: true,
          startkey: MasterCategory.startKey,
          endkey: MasterCategory.endKey
        }).then(res => {
          const ret = {};

          for (let i = 0; i < res.rows.length; i++) {
            const cat = new MasterCategory(res.rows[i].doc);
            cat.subscribe(putCategory);
            ret[cat.id] = cat;
          }

          return ret;
        });
      }

      function putCategory(category) {
        return pouch.put(category.toJSON()).then(res => {
          category.data._rev = res.rev;
        });
      }

      return {
        all,
        put: putCategory
      };
    }

    function categories() {
      function all() {
        return pouch.allDocs({
          include_docs: true,
          startkey: Category.startKey,
          endkey: Category.endKey
        }).then(res => {
          const ret = {};

          for (let i = 0; i < res.rows.length; i++) {
            const cat = new Category(res.rows[i].doc);
            cat.subscribe(putCategory);
            ret[cat.id] = cat;
          }

          return ret;
        });
      }

      function putCategory(category) {
        return pouch.put(category.toJSON()).then(res => {
          category.data._rev = res.rev;
        });
      }

      return {
        all,
        put: putCategory
      };
    }

    function initializeAllCategories() {
      const promises = [];

      for (let i = 0; i < defaultCategories.length; i++) {
        promises.push(
          $q.when(pouch.bulkDocs(defaultCategories[i].categories.map(function(cat) {
            // add id namespace to category
            cat._id = Category.prefix + uuid();
            return cat;
          }))
          .then(res => {
            return $q.when(pouch.post({
              name: defaultCategories[i].name,
              categories: res.map(r => r.id.slice(r.id.lastIndexOf('_') + 1)),
              _id: MasterCategory.prefix + uuid()
            }));
          }))
        );
      }

      return $q.all(promises);
    }

    function budget() {
      function getAllMonthCategories() {
        return pouch.allDocs({
          include_docs: true,
          startkey: MonthCategory.startKey(budgetId),
          endkey: MonthCategory.endKey(budgetId)
        })
        .then(res => {
          return res.rows.map(row => {
            const bValue = new MonthCategory(row.doc);
            bValue.subscribe(put);

            return bValue;
          });
        });
      }

      function getAllAccounts() {
        return pouch.allDocs({
          include_docs: true,
          startkey: Account.startKey,
          endkey: Account.endKey
        })
        .then(res => {
          return res.rows.map(row => {
            const acc = new Account(row.doc);
            acc.subscribe(put);

            return acc;
          });
        });
      }

      function getAllTransactions() {
        return pouch.allDocs({
          include_docs: true,
          startkey: Transaction.startKey,
          endkey: Transaction.endKey
        })
        .then(res => {
          const transactions = {};

          for (let i = 0; i < res.rows.length; i++) {
            const trans = new Transaction(res.rows[i].doc);

            transactions[trans.id] = trans;
          }

          return Object.keys(transactions).map(key => {
            const trans = transactions[key];

            if (trans.data.transferId) {
              trans.transfer = transactions[trans.data.transferId];
            }

            return transactions[key];
          });
        });
      }

      function all() {
        return pouch.allDocs({
          include_docs: true, /* eslint camelcase:0 */
          startkey: Month.startKey,
          endkey: Month.endKey
        }).then(res => {
          const months = res.rows.map(row => new Month(row.doc, put));

          const manager = new MonthManager(months, put);

          return getAllMonthCategories()
          .then(monthCatVals => {
            for (let i = 0; i < monthCatVals.length; i++) {
              manager.addMonthCategory(monthCatVals[i]);
            }

            return getAllAccounts()
            .then(accounts => {
              for(let i = 0; i < accounts.length; i++) {
                manager.addAccount(accounts[i]);
              }

              return getAllTransactions()
              .then(transactions => {
                for (let i = 0; i < transactions.length; i++) {
                  manager.addTransaction(transactions[i]);
                }

                return manager;
              });

            });
          });
        });
      }

      // const putCache = {};

      function put(o) {
        // if (putCache[o.id]) {
        //   clearTimeout(putCache[o.id]);
        // }

        // putCache[o.id] = setTimeout(() => {
          return pouch.put(o.toJSON()).then(res => {
            o.data._rev = res.rev;
          });
        // }, 100);
      }

      return all;
    }
  };


});
