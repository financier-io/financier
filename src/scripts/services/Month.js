angular.module('financier').factory('month', (Transaction, Income, MonthCategory) => {
  return budgetId => {
    return class Month {

      constructor(data, categories, saveFn) {
        const defaults = {
        };

        this.saveFn = saveFn;

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

      setBudget(catId, amount) {
        this.createCategoryIfEmpty(catId);

        this.data.categories[catId].budget = amount;
      }


      note(catId) {
        this.createCategoryIfEmpty(catId);

        return note => {

          if (angular.isDefined(note)) {
            this.data.categories[catId].note = note;
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
          this.data.categories[catId] = new MonthCategory.from(budgetId, this.date, catId);

          this.data.categories[catId].subscribe(record => {
            this.saveFn(record);
          });

          this.data.categories[catId].subscribeBudget((newBudget, oldBudget) => {
            this.cache.totalBudget += newBudget - oldBudget;
            this.cache.totalAvailable -= newBudget - oldBudget;
            this.nextChangeAvailableFn && this.nextChangeAvailableFn(-(newBudget - oldBudget));
            this.categoryCache[catId].balance += newBudget - oldBudget;
            this.cache.totalBalance += newBudget - oldBudget;

            this.nextRollingFn && this.nextRollingFn(catId, this.categoryCache[catId].balance);

            return this.recordChangesFn && this.recordChangesFn(this);
          });
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
