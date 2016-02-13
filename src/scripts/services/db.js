angular.module('financier').provider('db', function(defaultCategories) {
  const that = this;
  that.adapter = 'idb';

  this.$get = (Month, uuid) => {
    const db = new PouchDB('financier', {
      adapter: that.adapter
    });

    return {
      budgets: db.allDocs().then(res => res.rows),
      budget,
      categories
    };

    function categories(categoriesDB) {
      function all() {
        return categoriesDB.allDocs({
          include_docs: true,
          startkey: 'masterCategory_',
          endkey: 'masterCategory_\uffff'
        }).then(res => {
          const ret = res.rows.map(cat => cat.doc);
          const promises = [];

          for (var i = 0; i < ret.length; i++) {
            (function(i) {
              promises.push(
                categoriesDB.allDocs({
                  include_docs: true,
                  keys: ret[i].categories
                })
                .then(c => {
                  ret[i].categories = c.rows.map(cat => cat.doc);
                  return ret[i];
                })
              );
              
            }(i));
          }
          return Promise.all(promises);
        });
      }

      return categoriesDB.allDocs().then(res => {
        if (res.total_rows === 0) {
          const promises = [];

          for (let i = 0; i < defaultCategories.length; i++) {
            promises.push(
              categoriesDB.bulkDocs(defaultCategories[i].categories)
              .then(res => {
                return categoriesDB.post({
                  name: defaultCategories[i].name,
                  categories: res.map(r => r.id),
                  _id: 'masterCategory_' + uuid()
                });
              })
            );
          }

          return Promise.all(promises).then((r) => {
            return all();
          });
        } else {
          return all();
        }
      });
    }

    function budget(budgetDB) {
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

        return budgetDB.allDocs().then(res => {
          if (res.rows.length) {
            // Read existing months, add those needed
            const lastDate = res.rows[res.rows.length - 1].id;
            
            const newMonths = [];
            let currentDate = lastDate;

            while(currentDate < dateUntil) {
              currentDate = nextDateID(currentDate);

              newMonths.push({
                _id: currentDate
              });
            }

            const firstDate = res.rows[0].id;
            currentDate = firstDate;

            while(currentDate > dateFrom) {
              currentDate = previousDateID(currentDate);

              newMonths.push({
                _id: currentDate
              });
            }

            if(newMonths.length) {
              return budgetDB.bulkDocs(newMonths).then(res => {
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
                _id: lastDate
              });
              lastDate = nextDateID(lastDate);
            }
            return budgetDB.bulkDocs(newMonths).then(res => {
              return all();
            });
          }
        });
      }

      function all() {
        return budgetDB.allDocs({
          include_docs: true /* eslint camelcase:0 */
        }).then(res => {
          const months = res.rows.map(row => {
            return new Month(row.doc);
          });

          setUpLinks(months);

          return months;
        });
      }

      function put(month) {
        return budgetDB.put(JSON.parse(JSON.stringify(month))).then(function(res) {
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
