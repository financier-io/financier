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
      return budgetDB.allDocs({
        include_docs: true
      }).then(res => {
        const months = res.rows.map(row => {
          return new Month(row.doc);
        });

        for (let i = 0; i < months.length - 1; i++) {
          months[i].subscribe((catId, total) => {
            months[i + 1].setRolling(catId, total);
          });
        }

        return months;
      });
      // const ret = [
      //   new Month(new Date('1/1/16')),
      //   new Month(new Date('2/1/16')),
      //   new Month(new Date('3/1/16'))
      // ];

      function createMonth(date) {
        return budget.put(data, date).then((res) => {
          return new Month({
            date: date,
            db: budget,
            data
          });
        });
      }
    }
  }
});