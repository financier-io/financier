angular.module('financier').provider('db', function() {
  const that = this;
  that.adapter = 'idb';

  this.$get = (Month) => {
    const db = new PouchDB('financier', {
      adapter: that.adapter
    });

    return {
      budgets: db.allDocs().then(res => res.rows),
      budget
    };

    function budget(budgetDB) {
      function allUntil(date) {
        function nextDateID(date) {
          const [year, month] = date.split('-');
          return Month.createID(new Date(year, month, 1));
        }

        const dateUntil = Month.createID(date);

        return budgetDB.allDocs().then(res => {
          if (res.rows.length) {
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
            return budgetDB.put({
              _id: dateUntil,
              categories: {}
            }).then(res => {
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
        return budgetDB.put(month.toJSON());
      }

      function setUpLinks(months) {
        for (let i = 0; i < months.length - 1; i++) {
          months[i].subscribeNextMonth((catId, total) => {
            months[i + 1].setRolling(catId, total);

          });
          months[i].subscribeRecordChanges(() => {
            return put(months[i]);
          });
        }
      }

      return {
        all,
        put,
        allUntil
      };
    }
  };
});