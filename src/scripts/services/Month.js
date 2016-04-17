angular.module('financier').factory('month', (MonthCategory) => {
  return budgetId => {
    return class Month {

      constructor(data, saveFn) {
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

        this.categories = {};

        this.categoryCache = {};
        this.cache = {
          totalTransactions: 0,
          totalBudget: 0,
          totalBalance: 0,
          totalIncome: 0,
          totalAvailable: 0
        };
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

        if (catId.constructor && catId.constructor.name === 'MonthCategory') {
          // assume is MonthCategory
          this.categories[catId.categoryId] = catId;
          this.createCategoryCacheIfEmpty(catId.categoryId);

          catId.subscribe(record => {
            this.saveFn(record);
          });

          catId.subscribeBudget((newBudget, oldBudget) => {
            this.uponBudgetUpdate(catId.categoryId, newBudget, oldBudget);
          });


          this.cache.totalBudget += catId.budget;
          this.cache.totalAvailable -= catId.budget;

          this.nextChangeAvailableFn && this.nextChangeAvailableFn(-catId.budget);

          this.categoryCache[catId.categoryId].balance += catId.budget;
          this.cache.totalBalance += catId.budget;
        } else {
          this.createCategoryCacheIfEmpty(catId);
          // backward compatibility (for now)

          this.createCategoryIfEmpty(catId);
          this.categories[catId].budget = amount;
        }

      }

      addTransaction(trans) {
        const categoryChangeFn = (newCatId, oldCatId) => {
          if (this.categoryCache[oldCatId]) {
            this.categoryCache[oldCatId].balance -= trans.value;
          }

          this.createCategoryCacheIfEmpty(newCatId);
          this.categoryCache[newCatId].balance += trans.value;
        };

        const valueChangeFn = (newValue, oldValue) => {
          this.createCategoryIfEmpty(trans.category);

          this.categoryCache[trans.category].balance += newValue - oldValue;
        };

        trans.subscribeCategoryChange(categoryChangeFn);
        trans.subscribeValueChange(valueChangeFn);

        this.createCategoryCacheIfEmpty(trans.category);

        this.categoryCache[trans.category].balance += trans.value;
      }

      removeTransaction(trans) {
        this.categoryCache[trans.category].balance -= trans.value;
      }


      note(catId) {
        this.createCategoryIfEmpty(catId);

        return note => {

          if (angular.isDefined(note)) {
            this.categories[catId].note = note;
          } else {
            return this.categories[catId].note;
          }

        };
      }

      createCategoryIfEmpty(catId) {
        if (!this.categories[catId]) {
          this.categories[catId] = new MonthCategory.from(budgetId, this.date, catId);

          this.categories[catId].subscribe(record => {
            this.saveFn(record);
          });


          this.categories[catId].subscribeBudget((newBudget, oldBudget) => {
            this.uponBudgetUpdate(catId, newBudget, oldBudget);
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

      uponBudgetUpdate(catId, newBudget, oldBudget) {
        this.cache.totalBudget += newBudget - oldBudget;
        this.cache.totalAvailable -= newBudget - oldBudget;
        this.nextChangeAvailableFn && this.nextChangeAvailableFn(-(newBudget - oldBudget));
        this.categoryCache[catId].balance += newBudget - oldBudget;
        this.cache.totalBalance += newBudget - oldBudget;

        this.nextRollingFn && this.nextRollingFn(catId, this.categoryCache[catId].balance);
      }

      subscribeNextMonth(nextRollingFn, nextChangeAvailableFn) {
        this.nextRollingFn = nextRollingFn;
        this.nextChangeAvailableFn = nextChangeAvailableFn;

        // initialize totalAvailable of next month
        this.nextChangeAvailableFn && this.nextChangeAvailableFn(this.cache.totalAvailable);
      }

      subscribeTransactionDateChange(fn) {
        // TODO
      }

      changeAvailable(value) {
        this.cache.totalAvailable += value;
        this.nextChangeAvailableFn && this.nextChangeAvailableFn(value);
      }

      subscribeTransactionDateChange(fn) {
        this.subscribeTransactionDateChangeFn = fn;
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
        return this.startKey + '\uffff';
      }

      static get prefix() {
        return this.startKey;
      }
    };
  };
});
