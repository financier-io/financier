angular.module('financier').factory('Month', () => {
  return class Month {

    constructor(fn, data = {categories: {}}) {
      this.fn = fn;
      this.data = data;
    }

    setRolling(catId, rolling) {
      this.createCategoryIfEmpty(catId);

      const oldRolling = this.data.categories[catId].rolling;
      this.data.categories[catId].rolling = rolling;
      
      this.data.categories[catId].total += rolling - oldRolling;
      this.fn && this.fn(catId, this.data.categories[catId].total);
    }

    addTransaction(catId, transaction) {
      if (transaction.constructor.name !== 'Transaction') {
        throw new TypeError('Not passed a Transaction!');
      }

      this.createCategoryIfEmpty(catId);

      transaction.subscribe((newValue, oldValue) => {
        this.data.categories[catId].total += (oldValue - newValue);

        this.fn && this.fn(catId, this.data.categories[catId].total);
      });

      this.data.categories[catId].transactions.push(transaction);

      this.data.categories[catId].total -= transaction.value;
      this.fn && this.fn(catId, this.data.categories[catId].total);
    }

    removeTransaction(catId, transaction) {
      this.createCategoryIfEmpty(catId);

      const index = this.data.categories[catId].transactions.indexOf(transaction);

      if (index > -1) {
        this.data.categories[catId].transactions.splice(index, 1);
        transaction.subscribe(null);
      }

      this.data.categories[catId].total += transaction.value;
      this.fn && this.fn(catId, this.data.categories[catId].total);
    }

    setBudget(catId, amount) {
      this.createCategoryIfEmpty(catId);

      const oldBudget = this.data.categories[catId].budget;
      this.data.categories[catId].budget = amount;

      this.data.categories[catId].total += amount - oldBudget;

      this.fn && this.fn(catId, this.data.categories[catId].total);
    }

    createCategoryIfEmpty(catId) {
      if (!this.data.categories[catId]) {
        this.data.categories[catId] = {
          rolling: 0,
          budget: 0,
          transactions: [],
          total: 0
        };
      }
    }

    toJSON() {
      return this.data;
    }
  }
})