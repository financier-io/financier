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
        put
      };
    }
  };
});