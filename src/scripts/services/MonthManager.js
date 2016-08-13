angular.module('financier').factory('monthManager', (month, account) => {
  return budgetId => {

    const Month = month(budgetId);
    const Account = account(budgetId);

    /**
     * Represents a MonthManager, responsible for
     * creating and linking Month objects together.
     */
    class MonthManager {

      /**
       * Create a MonthManager.
       *
       * @param {Month[]} [months] - The Months from the database.
       * @param {function} saveFn - The function that will take a serializable object
       * to save to the database. After complete, it will set `_rev` on the object.
       */
      constructor(months = [], saveFn) {
        // Months need to be ordered
        // Seriously, else it'll be broke af
        if (months.length === 0) {
          // my first time, be gentle

          months.push(new Month(Month.createID(new Date()), saveFn));
        }

        months = this._fillMonthGaps(months);

        for (let i = 0; i < months.length; i++) {
          const month = months[i];

          month.subscribeTransactionDateChange(this.subscribeTransactionDateChangeFn);

          if (months[i + 1]) {
            this._linkMonths(months[i], months[i + 1]);
          }
        }

        this.months = months;
        this.accounts = [];
        this.allAccounts = new Account({
          name: 'All Accounts'
        });
        this.transactions = {};
        this.saveFn = saveFn;

        this.payees = [];
      }

      /**
       * Add a Transaction which will be added to the relevant Month.
       *
       * @param {Transaction} trans - The Transaction to be added.
       */
      addTransaction(trans) {
        const myMonth = this.getMonth(trans.month),
          myAccount = this.getAccount(trans.account);

        trans.subscribe(this.saveFn);

        trans.subscribeAccountChange((newAccount, oldAccount) => {
          this.getAccount(oldAccount).removeTransaction(trans);
          this.getAccount(newAccount).addTransaction(trans);
        });

        trans.subscribeCategoryChange(() => {
          // before change
          const month = this.getMonth(trans.month);
          month.removeTransaction(trans);
          month.startRolling(trans.category);
        }, () => {
          // after change
          const month = this.getMonth(trans.month);
          month.addTransaction(trans);
        });

        trans.subscribeDateChange((newDate, oldDate) => {
          const newMonth = this.getMonth(newDate);

          this.getMonth(oldDate).removeTransaction(trans);
          newMonth.addTransaction(trans);

          newMonth.startRolling(trans.category);
        });

        this.transactions[trans.id] = trans;

        myAccount.addTransaction(trans);

        this.allAccounts.addTransaction(trans);
        myMonth.addTransaction(trans);
      }

      addPayee(payeeName) {
        if (this.payees.indexOf(payeeName) === -1) {
          this.payees.push(payeeName);
        }
      }

      /**
       * Add a Transaction which will be removed
       *
       * @param {Transaction} trans - The Transaction to be removed.
       */
      removeTransaction(trans) {
        const transactions = [trans];

        if (trans.transfer) {
          transactions.push(trans.transfer);
        }

        transactions.forEach(transaction => {
          if (this.transactions[transaction.id]) {
            delete this.transactions[transaction.id];

            const myMonth = this.getMonth(transaction.month),
              myAccount = this.getAccount(transaction.account);

            myAccount.removeTransaction(transaction);

            this.allAccounts.removeTransaction(transaction);
            myMonth.removeTransaction(transaction);
            myMonth.startRolling(transaction.category);

            transaction.subscribeAccountChange(null);
            transaction.subscribeCategoryChange(null, null);
            transaction.subscribeDateChange(null);
          }
        });
      }

      /**
       * Add a MonthCategory which will be added to the relevant Month.
       *
       * @param {MonthCategory} monthCat - The MonthCategory to be added.
       */
      addMonthCategory(monthCat) {
        this.getMonth(MonthManager._dateIDToDate(monthCat.monthId)).addBudget(monthCat);
      }

      /**
       * Add a transaction which will be added to the relevant Month.
       *
       * *NOTE:* Month objects must be ordered oldest to newest!
       * *NOTE:* Does not link months!
       *
       * @param {Month[]} months - The Month objects to look for gaps between.
       * @returns {Month[]} The Month objects with added Month objects between
       * to fill any gaps in months.
       *
       * @throws {Error} If months are not ordered by date (oldest to newest)
       * @example
       * // [Feb, Apr, May, Aug] => [Feb, Mar, Apr, May, Jun, Jul, Aug]
       * @private
       */
      _fillMonthGaps(months) {
        // This function needs to fill gaps of months
        // We can already assume the months are in order,
        // as promised by CouchDB/PouchDB

        if (months.length <= 1) {
          return months;
        }

        let endIndex = months.length - 1;
        for (var i = 0; i < endIndex; i++) {
          const startMonth = MonthManager._dateIDToDate(months[i].date);
          const endMonth = MonthManager._dateIDToDate(months[i + 1].date);
          const diff = MonthManager._diff(startMonth, endMonth);

          if (diff > 1) {
            const monthsToAdd = diff - 1;
            const newMonths = [];

            let id = MonthManager._nextDateID(months[i].date);

            for (let j = 0; j < monthsToAdd; j++) {
              const m = new Month(id, this.saveFn);
              m.subscribeTransactionDateChange(this.subscribeTransactionDateChangeFn);
              newMonths.push(m);

              id = MonthManager._nextDateID(id);
            }
            months.splice.apply(months, [i + 1, 0].concat(newMonths));

            i += monthsToAdd;
            endIndex += monthsToAdd;
          } else if (diff < 1) {
            throw new Error('Provided months are out of order or duplicates exist!');
          }
        }

        return months;
      }

      /**
       * Will get any Month from a given date.
       *
       * @param {date} date - The date of the month that you want. Will either
       * return the existing Month, or create a Month (and fill any gaps) to
       * that month.
       * @returns {Month} The Month in which the month represents.
       */
      getMonth(date) {
        const diff = MonthManager._diff(MonthManager._dateIDToDate(this.months[0].date), date);

        if ((diff + 1) > this.months.length) {
          // we need to append months
          const monthsToAdd = (diff + 1) - this.months.length;

          let d = this.months[this.months.length - 1].date;

          for (let i = 0; i < monthsToAdd; i++) {
            d = MonthManager._nextDateID(d);

            const m = new Month(d, this.saveFn);
            m.subscribeTransactionDateChange(this.subscribeTransactionDateChangeFn);
            this.months.push(m);
            this._linkMonths(this.months[this.months.length - 2], this.months[this.months.length - 1]);
          }

          // this is the only case when we need to propagate rolling
          // prepended months will by definition not have any data rolling
          // into them, so we don't need to do this there
          this._propagateRollingFromMonth(this.months[(this.months.length - 1) - monthsToAdd]);

          return this.months[this.months.length - 1];
        }

        if (diff < 0) {
          // we need to prepend months
          const monthsToAdd = Math.abs(diff);

          let d = this.months[0].date;

          for (let i = 0; i < monthsToAdd; i++) {
            d = MonthManager._previousDateID(d);

            const m = new Month(d, this.saveFn);
            m.subscribeTransactionDateChange(this.subscribeTransactionDateChangeFn);
            this.months.unshift(m);
            this._linkMonths(this.months[0], this.months[1]);
          }
          return this.months[0];
          
        }

        // we already have the month
        return this.months[diff];
      }

      getAccount(id) {
        for (let i = 0; i < this.accounts.length; i++) {
          if (this.accounts[i].id === id) {
            return this.accounts[i];
          }
        }
      }

      addAccount(acc) {
        this.accounts.push(acc);
      }

      removeAccount(acc) {
        const index = this.accounts.indexOf(acc);

        if (index !== -1) {
          this.accounts.splice(index, 1);
        } else {
          throw new Error(`Account with id ${acc.id} not found!`);
        }
      }

      /**
       * Will link together two months, should *probably* be
       * one immediately after the other (e.g. `_linkMonths(Sep, Oct)`).
       *
       * @param {Month} firstMonth - The earlier month.
       * @param {Month} secondMonth - The later month.
       * @private
       */
      _linkMonths(firstMonth, secondMonth) {
        firstMonth.subscribeNextMonth(secondMonth);
      }

      /**
       * Upon initialization and after all Month objects, transactions, etc
       * have been added, call this to calculate any rolling balances, etc.
       *
       * @param {string[]} categoryIds - The category `_id`s in which to
       * propagate balances, etc. Does not include MasterCategory objects.
       */
      propagateRolling(categoryIds) {
        this.categoryIds = categoryIds;

        for (var i = 0; i < categoryIds.length; i++) {
          this.months[0].startRolling(categoryIds[i]);
        }
      }

      /**
       * If months are added in the future, we must propagate balances,
       * etc to those month(s).
       *
       * This will not do anything if `propagateRolling()` has not already
       * been called (since we'll probably call `propagateRolling()` in
       * the future, anyways).
       *
       * @param {Month} month - The Month object to propagate from.
       * @private
       */
      _propagateRollingFromMonth(month) {
        // if categoryIds is not set,
        // we're probably going to call this.propagateRolling
        // in the future, so doing this is moot...
        if (this.categoryIds) {
          for (var i = 0; i < this.categoryIds.length; i++) {
            month.startRolling(this.categoryIds[i]);
          }
        }
      }

      /**
       * Check the difference, in months, between two Month objects.
       *
       * @param {date} d1 - The first month.
       * @param {date} d2 - The second month.
       * @returns {number} The months between the two dates.
       * @private
       */
      static _diff(d1, d2) {
        let months;

        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();

        return months;
      }

      /**
       * Convert a Month dateID to a date object.
       *
       * @param {string} date - The Month date ID.
       * @returns {date} The Month date object.
       * @private
       */
      static _dateIDToDate(date) {
        const [year, month] = date.split('-');
        return new Date(year, month - 1, 1);
      }

      /**
       * Get the next date ID from a date ID.
       *
       * @todo Optimize (don't create intermediate date object).
       *
       * @param {string} date - The Month date ID.
       * @returns {string} The next Month date ID.
       * @private
       */
      static _nextDateID(date) {
        const [year, month] = date.split('-');
        return Month.createID(new Date(year, month, 1));
      }

      /**
       * Get the previous date ID from a date ID.
       *
       * @todo Optimize (don't create intermediate date object).
       *
       * @param {string} date - The Month date ID.
       * @returns {string} The previous Month date ID.
       * @private
       */
      static _previousDateID(date) {
        const [year, month] = date.split('-');
        return Month.createID(new Date(year, month - 2, 1));
      }
    };

    return MonthManager;
  };
});
