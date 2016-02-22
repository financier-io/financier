angular.module('financier').provider('db', function(defaultCategories) {
  const that = this;
  that.adapter = 'idb';

  this.$get = (Month, Account, Category, uuid, $q) => {
    const db = new PouchDB('financier', {
      adapter: that.adapter
    });

    return {
      budget: budget(db),
      categories: categories(db),
      accounts: accounts(db),
      _pouch: db
    };

    function accounts(db) {
      function all() {
        return db.allDocs({
          include_docs: true,
          startkey: 'account_',
          endkey: 'account_\uffff'
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

      return {
        all,
        put
      };
    }

    function categories(db) {
      function all() {
        return db.allDocs({
          include_docs: true,
          startkey: 'masterCategory_',
          endkey: 'masterCategory_\uffff'
        }).then(res => {
          const ret = res.rows.map(cat => cat.doc);
          const promises = [];

          for (var i = 0; i < ret.length; i++) {
            (function(i) {
              promises.push(
                $q.when(db.allDocs({
                  include_docs: true,
                  keys: ret[i].categories
                })
                .then(c => {
                  ret[i].categories = [];

                  for (let j = 0; j < c.rows.length; j++) {
                    const cat = new Category(c.rows[j].doc);
                    ret[i].categories.push(cat);
                    cat.subscribe(putCategory);
                  }

                  return ret[i];
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
        startkey: 'masterCategory_',
        endkey: 'masterCategory_\uffff'
      }).then(res => {
        if (res.total_rows === 0) {
          const promises = [];

          for (let i = 0; i < defaultCategories.length; i++) {
            promises.push(
              $q.when(db.bulkDocs(defaultCategories[i].categories.map(function(cat) {
                // add id namespace to category
                cat._id = 'category_' + uuid();
                return cat;
              }))
              .then(res => {
                return $q.when(db.post({
                  name: defaultCategories[i].name,
                  categories: res.map(r => r.id),
                  _id: 'masterCategory_' + uuid()
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

    function budget(db) {
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
          startkey: 'month_',
          endkey: 'month_\uffff'
        }).then(res => {
          if (res.rows.length) {
            // Read existing months, add those needed
            const lastDate = res.rows[res.rows.length - 1].id.replace('month_', '');
            
            const newMonths = [];
            let currentDate = lastDate;

            while(currentDate < dateUntil) {
              currentDate = nextDateID(currentDate);

              newMonths.push({
                _id: 'month_' + currentDate
              });
            }

            const firstDate = res.rows[0].id.replace('month_', '');
            currentDate = firstDate;

            while(currentDate > dateFrom) {
              currentDate = previousDateID(currentDate);

              newMonths.push({
                _id: 'month_' + currentDate
              });
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
              newMonths.push({
                _id: 'month_' + lastDate
              });

              lastDate = nextDateID(lastDate);
            }

            return db.bulkDocs(newMonths).then(res => {
              return all();
            });
          }
        });
      }

      function all() {
        return db.allDocs({
          include_docs: true, /* eslint camelcase:0 */
          startkey: 'month_',
          endkey: 'month_\uffff'
        }).then(res => {
          const months = res.rows.map(row => {
            return new Month(row.doc);
          });

          setUpLinks(months);
          return months;
        });
      }

      function put(month) {
        return db.put(JSON.parse(JSON.stringify(month))).then(function(res) {
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
        getFourMonthsFrom,
        propagateRolling
      };
    }
  };
});
