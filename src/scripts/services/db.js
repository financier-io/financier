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

    function budget(name) {
      const budget = new PouchDB(`financier ${name}`, {
        adapter: that.adapter
      });

      const ret = [
        new Month(new Date('1/1/16')),
        new Month(new Date('2/1/16')),
        new Month(new Date('3/1/16'))
      ];

      for (let i = 0; i < ret.length - 1; i++) {
        ret[i].subscribe((catId, total) => {
          ret[i + 1].setRolling(catId, total);
        });
      }

      return ret;



      // budget.allDocs().then(res => {
      //   if (res.rows.length > 0) {
      //     const lastDoc = res.rows[res.rows.length - 1];

      //     console.log(lastDoc);
      //   } else {
      //     console.log('bu')
      //   }

      //   return this;
      // })

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