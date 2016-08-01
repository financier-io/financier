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
      transactions: transactions(),
      budget: budget(),
      remove,
      initialize
    };

    function initialize() {
      return ret.categories.initialize();
    }

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
          const transactions = [];

          for (let i = 0; i < res.rows.length; i++) {
            const trans = new Transaction(res.rows[i].doc);

            // acc.subscribe(put);

            transactions.push(trans);
          }

          return transactions;
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

    function categories() {
      function all() {
        return pouch.allDocs({
          include_docs: true,
          startkey: `b_${budgetId}_masterCategory_`,
          endkey: `b_${budgetId}_masterCategory_\uffff`
        }).then(res => {
          const ret = res.rows.map(cat => cat.doc);

          // Sort master categories
          ret.sort((a, b) => {
            return a.sort - b.sort;
          });

          const promises = [];

          for (var i = 0; i < ret.length; i++) {
            (function(i) {
              promises.push(
                $q.when(pouch.allDocs({
                  include_docs: true,
                  keys: ret[i].categories
                })
                .then(c => {
                  const masterCat = new MasterCategory(ret[i]);
                  masterCat.subscribe(putCategory);
                  const cats = [];

                  for (let j = 0; j < c.rows.length; j++) {
                    const cat = new Category(c.rows[j].doc);
                    cats.push(cat);
                    cat.subscribe(putCategory);
                  }

                  masterCat.categories = cats;

                  return masterCat;
                }))
              );
              
            }(i));
          }
          return $q.all(promises);
        });
      }

      function putCategory(category) {
        return pouch.put(category.toJSON()).then(res => {
          category.data._rev = res.rev;
        });
      }

      function initialize() {
        const promises = [];

        for (let i = 0; i < defaultCategories.length; i++) {
          promises.push(
            $q.when(pouch.bulkDocs(defaultCategories[i].categories.map(function(cat) {
              // add id namespace to category
              cat._id = `b_${budgetId}_category_` + uuid();
              return cat;
            }))
            .then(res => {
              return $q.when(pouch.post({
                name: defaultCategories[i].name,
                categories: res.map(r => r.id),
                _id: `b_${budgetId}_masterCategory_` + uuid()
              }));
            }))
          );
        }

        return $q.all(promises);
      }

      return {
        all,
        initialize
      };
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
          return res.rows.map(row => {
            const trans = new Transaction(row.doc);
            trans.subscribe(put);

            return trans;
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

      const putCache = {};

      function put(o) {
        if (putCache[o.id]) {
          clearTimeout(putCache[o.id]);
        }

        putCache[o.id] = setTimeout(() => {
          return pouch.put(o.toJSON()).then(res => {
            o.data._rev = res.rev;
          });
        }, 100);
      }

      return all;
    }
  };


});
