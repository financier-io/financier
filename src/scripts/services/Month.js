angular.module('financier').factory('month', (Transaction, Income) => {
  return budgetId => {
    return class Month {

      constructor(data, getBudgetValue) {
        const defaults = {
          categories: {},
          income: []
        };

        let myData;

        if (angular.isString(data)) {
          myData = defaults;
          myData._id = `b_${budgetId}_month_${data}`;
        } else {
          myData = angular.extend(defaults, data);
        }

        // database prefix TODO
        this.date = myData._id.slice(myData._id.lastIndexOf('_') + 1);

        this.data = myData;
        this.categoryCache = {};
        this.cache = {
          totalTransactions: 0,
          totalBudget: 0,
          totalBalance: 0,
          totalIncome: 0,
          totalAvailable: 0
        };

        this.initialLoad();
      }

      initialLoad() {
        // loop through all categories
        for (let k in this.data.categories) {
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
        // initialize income
        if (this.data.income && this.data.income.length) {
          const income = this.data.income;
          this.data.income = [];
          for (let i = 0; i < income.length; i++) {
            this.addIncome(new Income(income[i]));
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

      changeAvailable(value) {
        this.cache.totalAvailable += value;
        this.nextChangeAvailableFn && this.nextChangeAvailableFn(value);
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

      addIncome(income) {
        this.cache.totalIncome += income.value;
        this.cache.totalAvailable += income.value;
        this.nextChangeAvailableFn && this.nextChangeAvailableFn(income.value);

        income.subscribe((newValue, oldValue) => {
          this.cache.totalIncome += newValue - oldValue;
          this.cache.totalAvailable += newValue - oldValue;

          return this.recordChangesFn && this.recordChangesFn(this);
        });

        this.data.income.push(income);

        return this.recordChangesFn && this.recordChangesFn(this);
      }

      removeIncome(income) {
        const index = this.data.income.indexOf(income);

        if (index > -1) {
          this.data.income.splice(index, 1);
          income.subscribe(null);
        }

        this.cache.totalIncome -= income.value;
        this.cache.totalAvailable -= income.value;
        this.nextChangeAvailableFn && this.nextChangeAvailableFn(-income.value);

        return this.recordChangesFn && this.recordChangesFn(this);
      }

      setBudget(catId, amount) {
        this.createCategoryIfEmpty(catId);
        this.createCategoryCacheIfEmpty(catId);

        const oldBudget = this.data.categories[catId].budget;
        this.data.categories[catId].budget = amount;

        this.cache.totalBudget += amount - oldBudget;
        this.cache.totalAvailable -= amount - oldBudget;
        this.nextChangeAvailableFn && this.nextChangeAvailableFn(-(amount - oldBudget));
        this.categoryCache[catId].balance += amount - oldBudget;
        this.cache.totalBalance += amount - oldBudget;
        this.nextRollingFn && this.nextRollingFn(catId, this.categoryCache[catId].balance);
        return this.recordChangesFn && this.recordChangesFn(this);
      }

      note(catId) {
        this.createCategoryIfEmpty(catId);

        return note => {

          if (angular.isDefined(note)) {
            this.data.categories[catId].note = note;

            return this.recordChangesFn && this.recordChangesFn(this);
          } else {
            return this.data.categories[catId].note;
          }

        };
      }

      remove() {
        this.data._deleted = true;
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

      subscribeNextMonth(nextRollingFn, nextChangeAvailableFn) {
        this.nextRollingFn = nextRollingFn;
        this.nextChangeAvailableFn = nextChangeAvailableFn;

        // initialize totalAvailable of next month
        this.nextChangeAvailableFn && this.nextChangeAvailableFn(this.cache.totalAvailable);
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

      static get startKey() {
        return `b_${budgetId}_month_`;
      }

      static get endKey() {
        return `b_${budgetId}_month_\uffff`;
      }
    };
  };
});
