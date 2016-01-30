angular.module('financier').factory('Month', (Transaction) => {
  return class Month {

    constructor(data = {categories: {}}) {
      if (!data._id) {
        throw new TypeError('date is not Date!');
      }
      for (var k in data.categories){
        if (data.categories.hasOwnProperty(k)) {
          let category = data.categories[k];
          if (category.transactions) {
            category.transactions = category.transactions.map(transaction => new Transaction(transaction));
          }
        }
      }
      this.data = data;
      this.cache = {};
    }

    setRolling(catId, rolling) {
      this.createCategoryIfEmpty(catId);
      this.createCategoryCacheIfEmpty(catId);

      const oldRolling = this.cache[catId].rolling;
      this.cache[catId].rolling = rolling;
      
      this.cache[catId].total += rolling - oldRolling;
      this.fn && this.fn(catId, this.cache[catId].total);
    }

    addTransaction(catId, transaction) {
      if (transaction.constructor.name !== 'Transaction') {
        throw new TypeError('Not passed a Transaction!');
      }

      this.createCategoryIfEmpty(catId);
      this.createCategoryCacheIfEmpty(catId);

      transaction.subscribe((newValue, oldValue) => {
        this.cache[catId].total += (oldValue - newValue);

        this.fn && this.fn(catId, this.cache[catId].total);
      });

      this.data.categories[catId].transactions.push(transaction);

      this.cache[catId].total -= transaction.value;
      this.fn && this.fn(catId, this.cache[catId].total);
    }

    removeTransaction(catId, transaction) {
      this.createCategoryIfEmpty(catId);
      this.createCategoryCacheIfEmpty(catId);

      const index = this.data.categories[catId].transactions.indexOf(transaction);

      if (index > -1) {
        this.data.categories[catId].transactions.splice(index, 1);
        transaction.subscribe(null);
      }

      this.cache[catId].total += transaction.value;
      this.fn && this.fn(catId, this.cache[catId].total);
    }

    setBudget(catId, amount) {
      this.createCategoryIfEmpty(catId);
      this.createCategoryCacheIfEmpty(catId);

      const oldBudget = this.data.categories[catId].budget;
      this.data.categories[catId].budget = amount;

      this.cache[catId].total += amount - oldBudget;

      this.fn && this.fn(catId, this.cache[catId].total);
    }

    createCategoryIfEmpty(catId) {
      if (!this.data.categories[catId]) {
        this.data.categories[catId] = {
          budget: 0,
          transactions: []
        };
      }
    }
    createCategoryCacheIfEmpty(catId) {
      if (!this.cache[catId]) {
        this.cache[catId] = {
          rolling: 0,
          total: 0
        }
      }
    }

    subscribe(fn) {
      this.fn = fn;
    }

    toJSON() {
      return this.data;
    }

    static normalizeID(date) {
      return `${date.getFullYear()}${date.getMonth()}`;
    }
  }
})