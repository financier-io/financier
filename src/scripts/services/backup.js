import fileSaver from 'file-saver';

angular.module('financier').factory('backup', (db, uuid, $filter, $translate) => {
  const dateFilter = $filter('date');

  return {
    backup(budgetId) {
      // Always create a new copy so importing doesn't overwrite
      const newBudgetId = uuid();

      db._pouch.allDocs({
        include_docs: true,
        startkey: `b_${budgetId}_`,
        endkey: `b_${budgetId}_\uffff`
      })
      .then(res => res.rows.map(row => {
        delete row.doc._rev;
        row.doc._id = row.doc._id.replace(`b_${budgetId}_`, `b_${newBudgetId}_`);

        return row.doc;
      }))
      .then(docs => {
        return db._pouch.get(`budget-opened_${budgetId}`)
        .then(doc => {
          delete doc._rev;
          doc._id = doc._id.replace(`budget-opened_${budgetId}`, `budget-opened_${newBudgetId}`);

          docs.unshift(doc);

          return docs;
        })
      })
      .then(docs => {
        return db._pouch.get(`budget_${budgetId}`)
        .then(doc => {
          delete doc._rev;
          doc._id = doc._id.replace(`budget_${budgetId}`, `budget_${newBudgetId}`);

          const name = $translate.instant('BACKUP_NAME', {
            date: dateFilter(new Date(), 'short'),
            name: doc.name
          });
          doc.name = name;

          docs.unshift(doc);

          return [name, docs];
        });
      })
      .then(([name, docs]) => {
        const blob = new Blob([JSON.stringify(docs, null, 2)], {type: "text/plain;charset=utf-8"});

        return fileSaver.saveAs(blob, `${name}.json`);
      });
    },
    restore(docs) {
      return db._pouch.bulkDocs(docs);
    }
  };
})
