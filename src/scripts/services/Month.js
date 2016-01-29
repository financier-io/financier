angular.module('financier').factory('Month', () => {
  return class Month {

    constructor(next, data = {categories: {}}) {
      this.next = next;
      this.data = data;
    }

    setRolling(catId, prevRolling) {
      createCategoryIfEmpty(catId);

      if (angular.isNumber(prevRolling)) {
        this.data.categories.catId.prevRolling = prevRolling;
      }

      let myRolling = this.prevRolling + this.data.categories.catId.budget;

      for (let i = 0; i < this.data.categories.catId.transactions.length; i++) {
        myRolling -= this.data.categories.catId.transactions[i].value;
      }

      this.data.categories.catId.rolling = myRolling;
    }

    getRolling(catId) {
      if (!angular.isDefined(this.data.categories.catId)) {
        throw new Error('Have not calculated rolling value yet!')
      }
      return this.data.categories.catId.rolling;
    }

    addTransaction(catId, transaction) {
      if (transaction.constructor.name !== 'Transaction') {
        throw new TypeError('Not passed a Transaction!');
      }

      createCategoryIfEmpty(catId);

      transaction.subscribe()

      this.data.categories.catId.transactions.push(transaction);
      next.setRolling();
    }

    removeTransaction(catId, transaction) {
      createCategoryIfEmpty(catId);

      const index = this.data.categories.catId.transactions.indexOf(transaction);

      if (index > -1) {
        this.data.categories.catId.transactions.splice(index, 1);
      }
      next.setRolling();
    }

    createCategoryIfEmpty(catId) {
      if (!this.data.categories.catId) {
        this.data.categories.catId = {
          budget: 0,
          transactions: []
        };
      }
    }

    toJSON() {
      return data;
    }
  }
})