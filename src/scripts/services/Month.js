angular.module("financier").factory("month", (MonthCategory) => {
  return (budgetId) => {
    /**
     * Represents a Month
     */
    class Month {
      /**
       * Create a Month
       *
       * @param {object|string} data - Either the record object from the database
       * (with `_id` and `_rev`) or a string representing a month date from
       * `Month.createID(date)`.
       *
       * @param {Function} saveFn - A function that takes a serializable (toJSON)
       * Object to save to the database.
       * Once complete, will set the _rev of the Object (`obj._rev = 'uid'`).
       */
      constructor(data, saveFn) {
        const defaults = {};

        this.saveFn = saveFn;

        let myData;

        if (angular.isString(data)) {
          myData = defaults;
          myData._id = `b_${budgetId}_month_${data}`;
        } else {
          myData = angular.extend(defaults, data);
        }

        // database prefix TODO
        this.date = myData._id.slice(myData._id.lastIndexOf("_") + 1);

        this.data = myData;

        this.categories = {};

        this.categoryCache = {};
        this.cache = {
          totalTransactions: 0,
          totalBudget: 0,
          totalBalance: 0,
          totalAvailable: 0,
          totalAvailableLastMonth: 0,
          totalOverspent: 0,
          totalOverspentLastMonth: 0,
          totalIncome: 0, // todo
          totalOutflow: 0,
        };
      }

      /**
       * Call with the overflowed (rolling) balance from last month's catId.
       *
       * @param {string} catId - The category UID.
       * @param {currency} rolling - The absolute value to be used.
       */
      setRolling(catId, rolling, overspending) {
        this.createCategoryIfEmpty(catId);
        this.createCategoryCacheIfEmpty(catId);

        if (this.categoryCache[catId].overspending == null) {
          if (overspending) {
            // Clear the overspending value last used
            this._changeCurrentOverspent(
              Math.min(this.categoryCache[catId].balance, 0),
            );
          }

          this.categoryCache[catId].overspending = overspending;
        }

        const oldRolling = this.categoryCache[catId].rolling;
        this.categoryCache[catId].rolling = rolling;

        const oldBalance = this.categoryCache[catId].balance;
        this.categoryCache[catId].balance += rolling - oldRolling;

        this.cache.totalBalance += rolling - oldRolling;

        if (this.categoryCache[catId].overspending) {
          this.nextRollingFn &&
            this.nextRollingFn(
              catId,
              this.categoryCache[catId].balance,
              this.categoryCache[catId].overspending,
            );
        } else {
          this._changeCurrentOverspent(
            0 -
              (Math.min(this.categoryCache[catId].balance, 0) -
                Math.min(oldBalance, 0)),
          );

          if (this.categoryCache[catId].balance > 0) {
            this.nextRollingFn &&
              this.nextRollingFn(
                catId,
                this.categoryCache[catId].balance,
                this.categoryCache[catId].overspending,
              );
          } else {
            // Your category balance is overdrawn!
            this.nextRollingFn &&
              this.nextRollingFn(
                catId,
                0,
                this.categoryCache[catId].overspending,
              );
          }
        }
      }

      /**
       * Should be called by the MonthManager on the very first month
       * upon initialization to propagate the rolling balances.
       *
       * @param {string} catId - The category's ID.
       */
      startRolling(catId) {
        this.createCategoryCacheIfEmpty(catId);
        this.setRolling(
          catId,
          this.categoryCache[catId].rolling,
          this.categoryCache[catId].overspending,
        );
      }

      /**
       * Set a budget amount for a category, whether it exists or not.
       *
       * @param {string} catId - The category's ID.
       * @param {currency} amount - The absolute amount to set the category's
       * budget to.
       */
      setBudget(catId, amount) {
        this.createCategoryCacheIfEmpty(catId);
        this.createCategoryIfEmpty(catId);

        this.categories[catId].budget = amount;
      }

      /**
       * Add an existing MonthCategory object to the month.
       *
       * @param {MonthCategory} monthCat - The month category integrate with the month.
       */
      addBudget(monthCat) {
        // assume is MonthCategory
        this.categories[monthCat.categoryId] = monthCat;
        this.createCategoryCacheIfEmpty(monthCat.categoryId);

        monthCat.subscribe((record) => {
          this.saveFn(record);
        });

        monthCat.subscribeBudget((value) => {
          this.budgetChange(monthCat.categoryId, value);
        });

        monthCat.subscribeOverspending((newO) => {
          const oldOverspending =
            this.categoryCache[monthCat.categoryId].overspending;
          this.categoryCache[monthCat.categoryId].overspending = newO;

          // We need to manually restore the overspent amount
          // to whatever the functionality should be (for this category)
          if (newO && !oldOverspending) {
            this._changeCurrentOverspent(
              Math.min(0, this.categoryCache[monthCat.categoryId].balance),
            );
          } else if (!newO && oldOverspending) {
            this._changeCurrentOverspent(
              -Math.min(0, this.categoryCache[monthCat.categoryId].balance),
            );
          }

          this.startRolling(monthCat.categoryId);
        });

        if (monthCat.overspending !== null) {
          this.categoryCache[monthCat.categoryId].overspending =
            monthCat.overspending;
        }

        this.cache.totalBudget += monthCat.budget;

        this.changeAvailable(-monthCat.budget);

        this.categoryCache[monthCat.categoryId].balance += monthCat.budget;

        if (!this.categoryCache[monthCat.categoryId].overspending) {
          this._changeCurrentOverspent(-Math.min(0, monthCat.budget));
        }

        this.cache.totalBalance += monthCat.budget;

        // Don't call nextRollingFn quite yet since we're adding the MonthCategory
        // upon initialization, and we'll run startRolling on the whole collection
        // of months later
      }

      /**
       * Add an existing MonthCategory object to the month.
       *
       * @param {MonthCategory} monthCat - The month category integrate with the month.
       */
      removeBudget(monthCat) {
        // assume is MonthCategory

        monthCat.subscribeBudget(null);

        this.cache.totalBudget -= monthCat.budget;

        this.changeAvailable(monthCat.budget);

        if (this.categoryCache[monthCat.categoryId]) {
          this.categoryCache[monthCat.categoryId].balance -= monthCat.budget;

          if (!this.categoryCache[monthCat.categoryId].overspending) {
            this._changeCurrentOverspent(Math.min(0, monthCat.budget));
          }
        }

        this.cache.totalBalance -= monthCat.budget;

        delete this.categories[monthCat.categoryId];

        // Don't call nextRollingFn quite yet since we're removing the MonthCategory
        // upon initialization, and we'll run startRolling on the whole collection
        // of months later
      }

      /**
       * @todo Not currently used
       */
      addTransaction(trans) {
        // The splits themselves are added, not the parent
        if (trans.category === "split") {
          return;
        }

        if (
          trans.category === "income" ||
          trans.category === "incomeNextMonth"
        ) {
          this._addIncome(trans);
        } else {
          this._addOutflow(trans);
        }
      }

      _addIncome(trans) {
        const valueChangeFn = (val) => {
          this.cache.totalIncome += val;
          this.changeAvailable(val);
        };

        valueChangeFn(trans.value);

        trans.subscribeValueChange(valueChangeFn);
      }

      _addOutflow(trans) {
        this.createCategoryCacheIfEmpty(trans.category);

        const valueChangeFn = (val) => {
          this.categoryCache[trans.category].outflow += val;
          this.cache.totalOutflow += val;

          const oldBalance = this.categoryCache[trans.category].balance;
          this.categoryCache[trans.category].balance += val;

          if (!this.categoryCache[trans.category].overspending) {
            this._changeCurrentOverspent(
              0 -
                (Math.min(this.categoryCache[trans.category].balance, 0) -
                  Math.min(oldBalance, 0)),
            );
          }

          this.cache.totalBalance += val;

          this.startRolling(trans.category); // todo optimize
        };

        valueChangeFn(trans.value);
        trans.subscribeValueChange(valueChangeFn);
      }

      /**
       * @todo Not currently used
       */
      removeTransaction(trans) {
        // The splits themselves are added, not the parent
        if (trans.category === "split") {
          return;
        }

        if (
          trans.category === "income" ||
          trans.category === "incomeNextMonth"
        ) {
          this._removeIncome(trans);
        } else {
          this._removeOutflow(trans);
        }
      }

      _removeIncome(trans) {
        this.cache.totalIncome -= trans.value;
        this.changeAvailable(-trans.value);

        trans.subscribeValueChange(null);
      }

      _removeOutflow(trans) {
        this.createCategoryCacheIfEmpty(trans.category);

        this.categoryCache[trans.category].outflow -= trans.value;
        this.cache.totalOutflow -= trans.value;

        const oldBalance = this.categoryCache[trans.category].balance;
        this.categoryCache[trans.category].balance -= trans.value;

        if (!this.categoryCache[trans.category].overspending) {
          this._changeCurrentOverspent(
            0 -
              (Math.min(this.categoryCache[trans.category].balance, 0) -
                Math.min(oldBalance, 0)),
          );
        }

        this.cache.totalBalance -= trans.value;

        this.startRolling(trans.category); // todo optimize

        trans.subscribeValueChange(null);
      }

      /**
       * Provide a way to set a note on a category.
       *
       * @param {string} catId - The category's ID.
       * @returns {function} A getter/setter function for a note string.
       * Call with the new note, or undefined to retrieve the note.
       *
       * Used by angular's ngModel getterSetter: true.
       */
      note(catId) {
        this.createCategoryIfEmpty(catId);

        return (note) => {
          if (angular.isDefined(note)) {
            this.categories[catId].note = note;
          } else {
            return this.categories[catId].note;
          }
        };
      }

      /**
       * Used to create and set up a MonthCategory if one doesn't
       * already exist from addBudget.
       *
       * @param {string} catId - The category's ID.
       * @private
       */
      createCategoryIfEmpty(catId) {
        this.createCategoryCacheIfEmpty(catId);

        if (!this.categories[catId]) {
          this.categories[catId] = MonthCategory.from(
            budgetId,
            this.date,
            catId,
          );

          this.categories[catId].subscribe((record) => {
            this.saveFn(record);
          });

          this.categories[catId].subscribeBudget((value) => {
            this.budgetChange(catId, value);
          });

          this.categories[catId].subscribeOverspending((newO) => {
            const oldOverspending = this.categoryCache[catId].overspending;
            this.categoryCache[catId].overspending = newO;

            // We need to manually restore the overspent amount
            // to whatever the functionality should be (for this category)
            if (newO && !oldOverspending) {
              this._changeCurrentOverspent(
                Math.min(0, this.categoryCache[catId].balance),
              );
            } else if (!newO && oldOverspending) {
              this._changeCurrentOverspent(
                -Math.min(0, this.categoryCache[catId].balance),
              );
            }

            this.startRolling(catId);
          });
        }
      }

      /**
       * Used to create a place to hold the rolling amount and current balance
       * for the given category, if one doesn't already exist.
       *
       * @param {string} catId - The category's ID.
       * @private
       */
      createCategoryCacheIfEmpty(catId) {
        if (!this.categoryCache[catId]) {
          this.categoryCache[catId] = {
            rolling: 0,
            outflow: 0,
            balance: 0,
            overspending: null,
          };
        }
      }

      /**
       * Usually called by MonthCategories when they have a budget amount
       * change.
       *
       * @param {string} catId - The category's ID.
       * @param {currency} value - The amount to change by.
       */
      budgetChange(catId, value) {
        this.cache.totalBudget += value;

        this.changeAvailable(-value);

        const oldBalance = this.categoryCache[catId].balance;
        this.categoryCache[catId].balance += value;

        this.cache.totalBalance += value;

        if (this.categoryCache[catId].overspending) {
          this.nextRollingFn &&
            this.nextRollingFn(catId, this.categoryCache[catId].balance);
        } else {
          this._changeCurrentOverspent(
            0 -
              (Math.min(this.categoryCache[catId].balance, 0) -
                Math.min(oldBalance, 0)),
          );

          if (this.categoryCache[catId].balance > 0) {
            this.nextRollingFn &&
              this.nextRollingFn(catId, this.categoryCache[catId].balance);
          } else {
            // Your category balance is overdrawn!
            this.nextRollingFn && this.nextRollingFn(catId, 0);
          }
        }
      }

      /**
       * Links this month to the next month. If this month is January, the next month
       * should be February. Linkedlist style.
       *
       * @param {Month} month - The following month to link together.
       */
      subscribeNextMonth(nextMonth) {
        this.nextRollingFn = (catId, balance, overspending) => {
          nextMonth.setRolling(catId, balance, overspending);
        };
        this.nextChangeAvailableFn = (val) => {
          nextMonth.changeAvailable(val);
        };
        this.nextChangeOverspentFn = (val) => {
          nextMonth.changeOverspent(val);
        };
        this.nextChangeAvailableLastMonthFn = (val) => {
          nextMonth.changeAvailableLastMonth(val);
        };

        // initialize totalAvailable of next month
        this.nextChangeAvailableFn &&
          this.nextChangeAvailableFn(this.cache.totalAvailable);

        // initialize totalAvailableLastMonth of next month
        this.nextChangeAvailableLastMonthFn &&
          this.nextChangeAvailableLastMonthFn(this.cache.totalAvailable);

        // initialize totalOverspent of next month
        this.nextChangeOverspentFn &&
          this.nextChangeOverspentFn(this.cache.totalOverspent);
      }

      /**
       * Change the current total available for this month, and
       * propagate to following months.
       *
       * @param {currency} value - The amount to change by.
       */
      changeAvailable(value) {
        this.cache.totalAvailable += value;
        this.nextChangeAvailableLastMonthFn &&
          this.nextChangeAvailableLastMonthFn(value);
        this.nextChangeAvailableFn && this.nextChangeAvailableFn(value);
      }

      /**
       * Change the current total available for this month, and
       * propagate to following months.
       *
       * @param {currency} value - The amount to change by.
       */
      changeAvailableLastMonth(value) {
        this.cache.totalAvailableLastMonth += value;
      }

      /**
       * Change the current total overspent for this month, and
       * propagate to the following month.
       *
       * @param {currency} value - The amount to change by.
       * @private
       */
      _changeCurrentOverspent(value) {
        this.cache.totalOverspent += value;
        this.nextChangeOverspentFn && this.nextChangeOverspentFn(value);
      }

      /**
       * Called by the proceeding month to tell us to capture the overspent amount
       * last month and also inversely change our available money, since overspent
       * money is taken care of in the following month.
       *
       * @param {currency} value - The amount to change by.
       */
      changeOverspent(value) {
        this.cache.totalOverspentLastMonth += value;
        this.changeAvailable(-value);
      }

      /**
       * Upon serializing, will return the record data.
       *
       * @returns {object} The month's record (with _id and _rev, if applicable)
       */
      toJSON() {
        return this.data;
      }

      /**
       * Create a Month date ID (minus the ID prefix). Will always be the 1st of the month.
       *
       * @example Month.createID(new Date('2015-02-05')) === '2015-02-01' // February, 2015
       *
       * @param {date} date - The date object to convert to a string. The day of the month and time do not matter.
       * @returns {string} Month date ID
       */
      static createID(date) {
        const twoDigitMonth =
          date.getMonth() + 1 >= 10
            ? date.getMonth() + 1
            : "0" + (date.getMonth() + 1);
        return date.getFullYear() + "-" + twoDigitMonth + "-01";
      }

      /**
       * The upper bound of alphabetically sorted months by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get startKey() {
        return `b_${budgetId}_month_`;
      }

      /**
       * The lower bound of alphabetically sorted months by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get endKey() {
        return this.startKey + "\uffff";
      }

      /**
       * The prefix for namespacing the month date ID
       *
       * @type {string}
       */
      static get prefix() {
        return this.startKey;
      }

      /**
       * Used for detecting if a document's _id is a Month
       * in this budget.
       *
       * @param {string} _id - The document's _id
       * @returns {boolean} True if document _id is in the budget
       * as a Month.
       */
      static contains(_id) {
        return _id > this.startKey && _id < this.endKey;
      }
    }

    return Month;
  };
});
