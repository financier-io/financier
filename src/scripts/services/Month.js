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
      this.nextRollingFn && this.nextRollingFn(catId, this.cache[catId].total);
    }

    addTransaction(catId, transaction) {
      if (transaction.constructor.name !== 'Transaction') {
        throw new TypeError('Not passed a Transaction!');
      }

      this.createCategoryIfEmpty(catId);
      this.createCategoryCacheIfEmpty(catId);

      transaction.subscribe((newValue, oldValue) => {
        this.cache[catId].total += (oldValue - newValue);

        this.nextRollingFn && this.nextRollingFn(catId, this.cache[catId].total);
        return this.recordChangesFn && this.recordChangesFn(this);
      });

      this.data.categories[catId].transactions.push(transaction);

      this.cache[catId].total -= transaction.value;

      this.nextRollingFn && this.nextRollingFn(catId, this.cache[catId].total);
      return this.recordChangesFn && this.recordChangesFn(this);
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
      
      this.nextRollingFn && this.nextRollingFn(catId, this.cache[catId].total);
      return this.recordChangesFn && this.recordChangesFn(this);
    }

    setBudget(catId, amount) {
      this.createCategoryIfEmpty(catId);
      this.createCategoryCacheIfEmpty(catId);

      const oldBudget = this.data.categories[catId].budget;
      this.data.categories[catId].budget = amount;

      this.cache[catId].total += amount - oldBudget;
      this.nextRollingFn && this.nextRollingFn(catId, this.cache[catId].total);
      return this.recordChangesFn && this.recordChangesFn(this);
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
        };
      }
    }

    subscribeNextMonth(nextRollingFn) {
      this.nextRollingFn = nextRollingFn;
    }

    subscribeRecordChanges(recordChangesFn) {
      this.recordChangesFn = recordChangesFn;
    }

    toJSON() {
      return this.data;
    }

    static createID(date) {
      const twoDigitMonth = ((date.getMonth() + 1) >= 10) ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);  
      return date.getFullYear() + '-' + twoDigitMonth + '-01'; 
    }
  };
});