angular.module('financier').provider('db', function(defaultCategories) {
  const that = this;
  that.adapter = 'idb';

  this.$get = (Month) => {
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
          include_docs: true
        }).then(res => {
          return res.rows.map(cat => {
            return cat.doc;
          });
        });
      }

      return categoriesDB.allDocs().then(res => {
        if (res.total_rows === 0) {
          return categoriesDB.bulkDocs(defaultCategories).then(res => {
            return all();
          });
        } else {
          return all();
        }
      });
    }

    function budget(budgetDB) {
      function allUntil(date) {
        function nextDateID(date) {
          const [year, month] = date.split('-');
          return Month.createID(new Date(year, month, 1));
        }

        const dateUntil = Month.createID(date);

        return budgetDB.allDocs().then(res => {
          if (res.rows.length) {
            // Read existing months, add those needed
            const lastDate = res.rows[res.rows.length - 1].id;
            
            if (lastDate < dateUntil) {
              const newMonths = [];
              let currentDate = lastDate;

              while(currentDate !== dateUntil) {
                currentDate = nextDateID(currentDate);

                newMonths.push({
                  _id: currentDate,
                  categories: {}
                });
              }

              return budgetDB.bulkDocs(newMonths).then(res => {
                return all();
              });
            } else {
              return all();
            }
          } else {
            // initialize new Months
            const newMonths = [];
            let lastDate = dateUntil;
            for (var i = 0; i < 3; i++) {
              newMonths.push({
                _id: lastDate,
                categories: {}
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
        return budgetDB.put(month.toJSON()).then(function(res) {
          month.data._rev = res.rev;
        });
      }

      function setUpLinks(months) {
        for (let i = 0; i < months.length - 1; i++) {
          months[i].subscribeNextMonth((catId, balance) => {
            months[i + 1].setRolling(catId, balance);
          });
        }

        for (let i = 0; i < months.length; i++) {
          months[i].subscribeRecordChanges(() => {
            return put(months[i]);
          });
        }
      }

      function propagateRolling(categories, firstMonth) {
        for (var i = 0; i < categories.length; i++) {
          firstMonth.startRolling(categories[i]._id);
        }
      }

      return {
        all,
        put,
        allUntil,
        propagateRolling
      };
    }
  };
});
