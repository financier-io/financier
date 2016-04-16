angular.module('financier').factory('budgetDb', (
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

  return (db, budgetId) => {
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
      remove
    };

    function remove() {
      ret.accounts.removeAll();
      ret.budget.removeAll();

      // TODO... refactor
      ret.categories.then(categories => {
        for (let i = 0; i < categories.length; i++) {

          for (let j = 0; j < categories[i].categories.length; j++) {
            categories[i].categories[j].remove();
          }
          // categories[i].remove(); // TODO
        }
      });
    }

    return ret;


    function accounts() {
      function all() {
        return db.allDocs({
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
        return db.get(Account.prefix + accountId)
        .then(acc => {
          return new Account(acc);
        });
      }

      function put(account) {
        return db.put(account.toJSON()).then(res => {
          account.data._rev = res.rev;
        });
      }

      function removeAll() {
        return all().then(accounts => {
          for (let i = 0; i < accounts.length; i++) {
            accounts[i].remove();
          }
        });
      }

      return {
        all,
        put,
        get,
        removeAll
      };
    }

    function transactions() {
      function all() {
        return db.allDocs({
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
        return db.get(Transaction.prefix + accountId)
        .then(trans => {
          return new Transaction(trans);
        });
      }

      function put(transaction) {
        return db.put(transaction.toJSON()).then(res => {
          transaction.data._rev = res.rev;
        });
      }

      function removeAll() {
        return all().then(transactions => {
          for (let i = 0; i < transactions.length; i++) {
            transactions[i].remove();
          }
        });
      }

      return {
        all,
        put,
        get,
        removeAll
      };
    }

    function categories() {
      function all() {
        return db.allDocs({
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
                $q.when(db.allDocs({
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
        return db.put(category.toJSON()).then(res => {
          category.data._rev = res.rev;
        });
      }

      function createByDefault() {
        return db.allDocs({
          startkey: `b_${budgetId}_masterCategory_`,
          endkey: `b_${budgetId}_masterCategory_\uffff`
        }).then(res => {
          if (res.rows.length === 0) {
            const promises = [];

            for (let i = 0; i < defaultCategories.length; i++) {
              promises.push(
                $q.when(db.bulkDocs(defaultCategories[i].categories.map(function(cat) {
                  // add id namespace to category
                  cat._id = `b_${budgetId}_category_` + uuid();
                  return cat;
                }))
                .then(res => {
                  return $q.when(db.post({
                    name: defaultCategories[i].name,
                    categories: res.map(r => r.id),
                    _id: `b_${budgetId}_masterCategory_` + uuid()
                  }));
                }))
              );
            }

            return $q.all(promises).then(r => {
              return all();
            });
          } else {
            return all();
          }
        });
      }

      return createByDefault;
    }

    function budget() {
      function removeAll() {
        return all().then(months => {
          for (let i = 0; i < months.length; i++) {
            months[i].remove();
          }
        });
      }

      function getAllCategories() {
        return db.allDocs({
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

      function all() {
        return db.allDocs({
          include_docs: true, /* eslint camelcase:0 */
          startkey: Month.startKey,
          endkey: Month.endKey
        }).then(res => {
          const months = res.rows.map(row => new Month(row.doc, put));

          const manager = new MonthManager(months, put);

          return getAllCategories()
          .then(monthCatVals => {
            for (let i = 0; i < monthCatVals.length; i++) {
              manager.addMonthCategory(monthCatVals[i]);
            }

            return manager;
          });

        })
        .then(manager => {
          // setUpLinks(months);
          return manager;
        });
      }

      function put(o) {
        return db.put(o.toJSON()).then(res => {
          o.data._rev = res.rev;
        });
      }


      return all;
      // {
      //   all,
      //   put,
      //   removeAll,
      //   getFourMonthsFrom,
      //   propagateRolling
      // };
    }
  };


});
