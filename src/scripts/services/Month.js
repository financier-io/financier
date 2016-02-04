angular.module('financier').factory('Month', (Transaction) => {
  return class Month {

    constructor(data) {
      if (!data) {
        data = {
          categories: {},
          income: []
        };
      }
      if (!data._id) {
        throw new TypeError('date is not Date!');
      }

      this.data = data;
      this.categoryCache = {};
      this.cache = {
        totalTransactions: 0,
        totalBudget: 0,
        totalBalance: 0
      };

      this.initialLoad();
    }

    initialLoad() {
      // loop through all categories
      for (var k in this.data.categories){
        if (this.data.categories.hasOwnProperty(k)) {
          let category = this.data.categories[k];

          // initialize transaction data as Transaction
          if (category.transactions) {
            const trs = category.transactions;
            category.transactions = [];
            trs.forEach((tr) => {
              this.addTransaction(k, new Transaction(tr));
            });
          }

          // initialize budgets
          if (category.budget) {
            const bdg = category.budget;
            category.budget = 0;
            this.setBudget(k, bdg);
          }
        }
      }
    }

    setRolling(catId, rolling) {
      this.createCategoryIfEmpty(catId);
      this.createCategoryCacheIfEmpty(catId);

      const oldRolling = this.categoryCache[catId].rolling;
      this.categoryCache[catId].rolling = rolling;
      
      this.categoryCache[catId].balance += rolling - oldRolling;
      this.cache.totalBalance += rolling - oldRolling;
      this.nextRollingFn && this.nextRollingFn(catId, this.categoryCache[catId].balance);
    }

    startRolling(catId) {
      this.createCategoryCacheIfEmpty(catId);

      return this.setRolling(catId, this.categoryCache[catId].rolling);
    }

    addTransaction(catId, transaction) {
      if (transaction.constructor.name !== 'Transaction') {
        throw new TypeError('Not passed a Transaction!');
      }

      this.createCategoryIfEmpty(catId);
      this.createCategoryCacheIfEmpty(catId);

      transaction.subscribe((newValue, oldValue) => {
        this.cache.totalTransactions += newValue - oldValue;
        this.categoryCache[catId].balance -= newValue - oldValue;
        this.cache.totalBalance -= newValue - oldValue;

        this.nextRollingFn && this.nextRollingFn(catId, this.categoryCache[catId].balance);
        return this.recordChangesFn && this.recordChangesFn(this);
      });

      this.data.categories[catId].transactions.push(transaction);

      this.cache.totalTransactions += transaction.value;
      this.categoryCache[catId].balance -= transaction.value;
      this.cache.totalBalance -= transaction.value;

      this.nextRollingFn && this.nextRollingFn(catId, this.categoryCache[catId].balance);
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

      this.cache.totalTransactions -= transaction.value;
      this.categoryCache[catId].balance += transaction.value;
      this.cache.totalBalance += transaction.value;
      
      this.nextRollingFn && this.nextRollingFn(catId, this.categoryCache[catId].balance);
      return this.recordChangesFn && this.recordChangesFn(this);
    }

    setBudget(catId, amount) {
      this.createCategoryIfEmpty(catId);
      this.createCategoryCacheIfEmpty(catId);

      const oldBudget = this.data.categories[catId].budget;
      this.data.categories[catId].budget = amount;

      this.cache.totalBudget += amount - oldBudget;
      this.categoryCache[catId].balance += amount - oldBudget;
      this.cache.totalBalance += amount - oldBudget;
      this.nextRollingFn && this.nextRollingFn(catId, this.categoryCache[catId].balance);
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
      if (!this.categoryCache[catId]) {
        this.categoryCache[catId] = {
          rolling: 0,
          balance: 0
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
