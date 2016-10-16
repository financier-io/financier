import moment from 'moment';

angular.module('financier').factory('splitTransaction', uuid => {
  return budgetId => {

    /**
     * Represents a Transaction
     */
    class SplitTransaction {

      /**
       * Create a Transaction.
       *
       * @param {object} [data] - The object record from the database.
       * @param {Transaction} transaction - The transaction that the split belongs to
       */
      constructor(transaction, data) {
        const myData = angular.merge({
          id: uuid(),
          value: 0,
          category: null,
          memo: null,
          payee: null,
          transfer: null
        }, data);

        this.transaction = transaction;

        // Ensure whole number
        myData.value = Math.round(myData.value);

        this.id = myData.id;

        this.subscribeClearedValueChangeFn = [];
        this.subscribeUnclearedValueChangeFn = [];

        this._data = myData;

        this.setMonth();

        this.transfer = null;
      }

      get constructorName() {
        return 'SplitTransaction';
      }

      _remove() {
        // this.transaction.removeSplit(this);
      }

      /**
       * The currency value of the transaction.
       * Will call record, value and cleared or uncleared (depending on state
       * of `cleared`) subscribers upon change.
       *
       * Negative value = outflow, positive = inflow.
       *
       * @type {currency}
       */
      get value() {
        return this._data.value;
      }

      set value(x) {
        const oldValue = this._data.value;
        this._data.value = x;

        if (this.cleared) {
          this._emitClearedValueChange(x - oldValue);
        } else {
          this._emitUnclearedValueChange(x - oldValue);
        }

        this._emitValueChange(x - oldValue);

        this._emitChange();

        if (this.transfer) {
          const transOldValue = this.transfer._data.value;
          this.transfer._data.value = -x;

          if (this.transfer.cleared) {
            this.transfer._emitClearedValueChange(-x - transOldValue);
          } else {
            this.transfer._emitUnclearedValueChange(-x - transOldValue);
          }

          this.transfer._emitValueChange(-x - transOldValue);

          this.transfer._emitChange();
        }
      }

      // Pass through
      get date() {
        return this.transaction.date;
      }

      set date(d) {
        this.transaction.date = d;
      }

      get month() {
        return this._month;
      }

      setMonth() {
        this._month = moment(this.date);

        if (this.category === 'incomeNextMonth') {
          this._month = this._month.add(1, 'month');
        }

        this._month = this._month.toDate();
      }

      get transfer() {
        return this._transfer;
      }

      set transfer(transfer) {
        this._transfer = transfer;
      }

      get payee() {
        return this._data.payee;
      }

      set payee(payee) {
        if (payee !== this._data.payee) {
          this._data.payee = payee;
          
          this._emitChange();
        }
      }

      get outflow() {
        if (this.value < 0) {
          return Math.abs(this.value);
        }
      }

      set outflow(v) {
        this.value = -v;
      }

      get inflow() {
        if (this.value > 0) {
          return this.value;
        }
      }

      set inflow(v) {
        this.value = v;
      }

      /**
       * The category the transaction is assigned to.
       * Will call record and category subscribers when changes.
       *
       * @type {string}
       */
      get category() {
        return this._data.category;
      }

      set category(x) {
        this._emitCategoryChange(() => {
          this._data.category = x;

          this.setMonth();
        });

        this._emitChange();
      }

      /**
       * The account the transaction is assigned to
       *
       * @type {string}
       */
      get account() {
        return this.transaction.account;
      }

      set account(s) {
        // You should never be able to set the account of a split transaction...
        // So let's just do nothing

        return;
      }

      /**
       * A user-entered memo for the transaction.
       * Will call subscriber when changes.
       *
       * @type {string}
       */
      get memo() {
        return this._data.memo;
      }

      set memo(x) {
        this._data.memo = x;

        if (this.transfer) {
          this.transfer.data.memo = x;

          this.transfer._emitChange();
        }

        this._emitChange();
      }

      get data() {
        return this._data;
      }

      set data(data) {
        // SET CATEGORY
        this._emitCategoryChange(() => {
          this._data.category = data.category;

          this.setMonth();
        });

        this._emitValueChange(data.value - this._data.value);

        this._data = data;
      }

      _setDate(x) {
        const splitOldMonth = this.month;
        this.transaction._setDate(x);
        this.setMonth();
        this._emitMonthChange(this.month, splitOldMonth);

      }

      _setDateFromParent(x) {
        const oldMonth = this._month;
        this.setMonth();
        this._emitMonthChange(this.month, oldMonth);

        if (this.transfer) {
          this.transfer._setDate(x);
        }
      }

      /**
       * Used to set the function to invoke upon record changes.
       *
       * @param {function} fn - This function will be invoked upon record
       * changes with the Transaction object as the first parameter.
      */
      subscribe(fn) {
        this.fn = fn;
      }

      set fn(f) {
        this.transaction.fn = f;
      }

      get fn() {
        return this.transaction.fn;
      }

      subscribeMonthChange(fn) {
        this.subscribeMonthChangeFn = fn;
      }

      _emitMonthChange(newMonth, oldMonth) {
        this.subscribeMonthChangeFn && this.subscribeMonthChangeFn(newMonth, oldMonth);
      }

      subscribeCategoryChange(beforeFn, afterFn) {
        this.subscribeCategoryChangeBeforeFn = beforeFn;
        this.subscribeCategoryChangeAfterFn = afterFn;
      }

      _emitCategoryChange(fn) {
        this.subscribeCategoryChangeBeforeFn && this.subscribeCategoryChangeBeforeFn();
        fn();
        this.subscribeCategoryChangeAfterFn && this.subscribeCategoryChangeAfterFn();
      }

      /**
       * Used to set the function to invoke upon uncleared value changes.
       *
       * Can only accept one value change fn, and will overwrite the previous
       * one.
       *
       * @param {function} fn - This function will be invoked upon value
       * changes with the amount the value has changed as the first parameter.
      */
      subscribeValueChange(fn) {
        this.subscribeValueChangeFn = fn;
      }

      subscribeCategoryChange(beforeFn, afterFn) {
        this.subscribeCategoryChangeBeforeFn = beforeFn;
        this.subscribeCategoryChangeAfterFn = afterFn;
      }

      _emitCategoryChange(fn) {
        this.subscribeCategoryChangeBeforeFn && this.subscribeCategoryChangeBeforeFn();
        fn();
        this.subscribeCategoryChangeAfterFn && this.subscribeCategoryChangeAfterFn();
      }

      /**
       * Used to set the function(s) to invoke upon cleared value changes.
       *
       * @param {function} fn - This function will be invoked upon value
       * changes with the amount the value has changed as the first parameter,
       * but only when/if the value is cleared.
      */
      subscribeClearedValueChange(fn) {
        this.subscribeClearedValueChangeFn.push(fn);
      }

      /**
       * Used to unset the function to invoke upon cleared value changes.
       *
       * @param {function} fn - The function reference originally provided
       * to subscribeClearedValueChange.
      */
      unsubscribeClearedValueChange(fn) {
        const index = this.subscribeClearedValueChangeFn.indexOf(fn);

        if (index > -1) {
          this.subscribeClearedValueChangeFn.splice(index, 1);
        } else {
          throw new Error('Subscriber does not exist', fn);
        }
      }

      /**
       * Used to unset the function to invoke upon uncleared value changes.
       *
       * @param {function} fn - The function reference originally provided
       * to subscribeUnclearedValueChange.
      */
      unsubscribeUnclearedValueChange(fn) {
        const index = this.subscribeUnclearedValueChangeFn.indexOf(fn);

        if (index > -1) {
          this.subscribeUnclearedValueChangeFn.splice(index, 1);
        } else {
          throw new Error('Subscriber does not exist', fn);
        }
      }

      /**
       * Used to set the function(s) to invoke upon value changes.
       *
       * @param {function} fn - This function will be invoked upon value
       * changes with the amount the value has changed as the first parameter,
       * but only when/if the value is uncleared.
      */
      subscribeUnclearedValueChange(fn) {
        this.subscribeUnclearedValueChangeFn.push(fn);
      }

      /**
       * Used to set the function(s) to invoke upon value changes.
       *
       * @param {function} fn - This function will be invoked upon value
       * changes with the amount the value has changed as the first parameter,
       * but only when/if the value is uncleared.
      */
      subscribePayeeChange(fn) {
        this.subscribePayeeChangeFn = fn;
      }

      subscribeAccountChange() {
        // Do nothing -- no-op for Transaction vs SplitTransaction
        // (SplitTransactions do not care if the account changes)
      }

      /**
       * Will call the subscribed value function, if it exists, with how much
       * the value has changed by.
       *
       * @private
      */
      _emitPayeeChange(newPayee, oldPayee) {
        return this.subscribePayeeChangeFn && this.subscribePayeeChangeFn(newPayee, oldPayee);
      }

      /**
       * Will call the subscribed value function, if it exists, with how much
       * the value has changed by.
       *
       * @private
      */
      _emitValueChange(val) {
        return this.subscribeValueChangeFn && this.subscribeValueChangeFn(val);
      }

      /**
       * Will call the subscribed value function, if it exists, with how much
       * the cleared value has changed by.
       *
       * @private
      */
      _emitClearedValueChange(val) {
        for (let i = 0; i < this.subscribeClearedValueChangeFn.length; i++) {
          this.subscribeClearedValueChangeFn[i](val);
        }
      }

      /**
       * Will call the subscribed value function, if it exists, with how much
       * the uncleared value has changed by.
       *
       * @private
      */
      _emitUnclearedValueChange(val) {
        for (let i = 0; i < this.subscribeUnclearedValueChangeFn.length; i++) {
          this.subscribeUnclearedValueChangeFn[i](val);
        }
      }

      /**
       * Will call the subscribed function, if it exists, with self.
       *
       * @private
      */
      _emitChange() {
        return this.fn && this.fn(this.transaction);
      }

      /**
       * Gracefully remove from db by marking `_deleted`.
       *
       * Mark any linked transfer as deleted, too.
      */
      remove() {
        if (this.transfer && !this.transfer._data._deleted) {
          this.transfer._data._deleted = true;

          this.transfer._emitChange();
        }

        // if (!this._data._deleted) {
        //   this._data._deleted = true;

        //   this._emitChange();
        // }
      }

      /**
       * Will serialize the Transaction object to
       * a JSON object for sending to the database.
       *
       * @returns {object}
      */
      toJSON() {
        return this._data;
      }
    };

    return SplitTransaction;
  };
});
