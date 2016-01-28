angular.module('financier').provider('db', function(Month) {
  const that = this;
  that.adapter = 'idb';

  this.$get = () => {
    const db = new PouchDB('financier', {
      adapter: that.adapter
    });

    return {
      budgets: db.allDocs().then(res => res.rows),
      budget
    };

    function budget(name) {
      const budget = new PouchDB(`financier ${name}`, {
        adapter: that.adapter
      });

      return {
        getMonth,
        setMonth
      }

      function getMonth(date) {
        return budget.get(date);
      }

      function setMonth(date, obj) {
        return budget.put(obj, date);
      }

      function createMonth(date) {
        const data = {
          categories: {}
        };

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