angular.module('financier').factory('Month', () => {
  return class Month {

    constructor({date, db, data = {categories: {}}}) {
      this.date = date;
      this.db = db;
      this.data = data;
    }

    setRolling(catId, prevRolling) {
      createCategoryIfEmpty(catId);

      let myRolling = prevRolling + this.data.categories.catId.budget;

      for (let i = 0; i < this.data.categories.catId.transactions.length; i++) {
        myRolling += this.data.categories.catId.transactions[i].value;
      }

      this.rolling = myRolling;
    }

    addTransaction(catId, transaction) {
      if (transaction.constructor.name !== 'Transaction') {
        throw new TypeError('Not passed a Transaction!');
      }

      createCategoryIfEmpty(catId);

      this.data.categories.catId.transactions.push(transaction);
      next.setRolling();
    }

    removeTransaction(catId, transaction) {
      createCategoryIfEmpty(catId);

      const index = this.data.categories.catId.transactions.indexOf(transaction);

      if (index > -1) {
        this.data.categories.catId.transactions.splice(index, 1);
      }
    }

    createCategoryIfEmpty(catId) {
      if (!this.data.categories.catId) {
        this.data.categories.catId = {
          budget: 0,
          transactions: []
        };
      }
    }
  }
})