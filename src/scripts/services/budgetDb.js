angular.module('financier').factory('budgetDb', (
  month,
  account,
  category,
  masterCategory,
  uuid,
  $q,
  MonthCategory,
  defaultCategories) => {

  return (db, budgetId) => {
    const Month = month(budgetId);
    const Account = account(budgetId);
    const Category = category(budgetId);
    const MasterCategory = masterCategory(budgetId);

    const ret = {
      accounts: accounts(),
      categories: categories(),
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

            acc.subscribe(put);

            accounts.push(acc);
          }

          return accounts;
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

    function budget() {
      function getFourMonthsFrom(date) {
        function nextDateID(date) {
          const [year, month] = date.split('-');
          return Month.createID(new Date(year, month, 1));
        }
        function previousDateID(date) {
          const [year, month] = date.split('-');
          return Month.createID(new Date(year, month - 2, 1));
        }

        const dateFrom = Month.createID(date);
        const dateUntil = Month.createID(moment(date).add(5, 'months').toDate());

        return db.allDocs({
          startkey: Month.startKey,
          endkey: Month.endKey
        }).then(res => {
          if (res.rows.length) {
            // Read existing months, add those needed
            const lastDate = res.rows[res.rows.length - 1].id.replace(`b_${budgetId}_month_`, '');
            
            const newMonths = [];
            let currentDate = lastDate;

            while(currentDate < dateUntil) {
              currentDate = nextDateID(currentDate);

              newMonths.push(new Month(currentDate).toJSON());
            }

            const firstDate = res.rows[0].id.replace(`b_${budgetId}_month_`, '');
            currentDate = firstDate;

            while(currentDate > dateFrom) {
              currentDate = previousDateID(currentDate);

              newMonths.push(new Month(currentDate).toJSON());
            }

            if(newMonths.length) {
              return db.bulkDocs(newMonths).then(res => {
                return all();
              });
            }
            return all();

          } else {
            // initialize new Months
            const newMonths = [];
            let lastDate = dateFrom;
            while(lastDate < dateUntil) {
              newMonths.push(new Month(lastDate).toJSON());

              lastDate = nextDateID(lastDate);
            }

            return db.bulkDocs(newMonths).then(res => {
              return all();
            });
          }
        });
      }

      function removeAll() {
        return all().then(months => {
          for (let i = 0; i < months.length; i++) {
            months[i].remove();
          }
        });
      }

      function getAllCategories(monthDate) {
        return db.allDocs({
          include_docs: true,
          startkey: MonthCategory.startKey(budgetId, monthDate),
          endkey: MonthCategory.endKey(budgetId, monthDate)
        })
        .then(res => {
          return res.rows.map(row => {
            const bValue = new MonthCategory(row.doc);
            bValue.subscribe(put);

            return bValue;
          });
        })
        .then(res => {
          return $q.all(res);
        });
      }

      function all() {
        return db.allDocs({
          include_docs: true, /* eslint camelcase:0 */
          startkey: Month.startKey,
          endkey: Month.endKey
        }).then(res => {
          return $q.all(res.rows.map(row => {
            const month = new Month(row.doc, put);

            return getAllCategories(month.date)
            .then(budgetVals => {
              for (let i = 0; i < budgetVals.length; i++) {
                month.setBudget(budgetVals[i]);
              }

              return month;
            });
          }))
          .then(months => {
            setUpLinks(months);
            return months;
          });

        });
      }

      function put(month) {
        return db.put(JSON.parse(JSON.stringify(month))).then(res => {
          month.data._rev = res.rev;
        });
      }

      function setUpLinks(months) {
        for (let i = 0; i < months.length - 1; i++) {
          months[i].subscribeNextMonth((catId, balance) => {
            months[i + 1].setRolling(catId, balance);
          }, val => {
            months[i + 1].changeAvailable(val);
          });
        }

        for (let i = 0; i < months.length; i++) {
          months[i].subscribeRecordChanges(() => {
            return put(months[i]);
          });
        }
      }

      function propagateRolling(categoryIds, firstMonth) {
        for (var i = 0; i < categoryIds.length; i++) {
          firstMonth.startRolling(categoryIds[i]);
        }
      }

      return {
        all,
        put,
        removeAll,
        getFourMonthsFrom,
        propagateRolling
      };
    }
  };


});
