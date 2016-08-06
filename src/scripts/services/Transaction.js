import moment from 'moment';

angular.module('financier').factory('transaction', uuid => {
  return budgetId => {
    
    /**
     * Represents a Transaction
     */
    class Transaction {

      /**
       * Create a Transaction.
       *
       * @param {object} [data] - The object record from the database.
       */
      constructor(data) {
        const myData = angular.merge({
          _id: `b_${budgetId}_transaction_${uuid()}`,
          value: null,
          date: null,
          category: null,
          account: null,
          memo: null,
          cleared: false,
          flag: null,
          transfer: {
            flag: null,
            cleared: false
          },
          payee: {
            // type: null,
            name: null
          },
          transferId: null
        }, data);

        this.id = myData._id.slice(myData._id.lastIndexOf('_') + 1);

        if (myData.date) {
          this._date = new Date(myData.date);
        }

        this.subscribeClearedValueChangeFn = [];
        this.subscribeUnclearedValueChangeFn = [];

        this.data = myData;

        this.setMonth();

        this.transfer = null;
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
        return this.data.value;
      }

      set value(x) {
        const oldValue = this.data.value;

        this.data.value = x;

        const changesTo = [this];

        if (this.transfer) {
          this.transfer.data.value = -x;

          changesTo.push(this.transfer);
        }

        changesTo.forEach(transaction => {
          if (transaction.cleared) {
            transaction._emitClearedValueChange(x - oldValue);
          } else {
            transaction._emitUnclearedValueChange(x - oldValue);
          }

          transaction._emitValueChange(x - oldValue);

          transaction._emitChange();
        });
      }

      get payee() {
        const that = this;

        if (!this._payee) {
          this._payee = {
            type: that.transfer ? 'TRANSFER' : that.data.payee.type,
            get id() {
              return that.transfer && that.transfer.account;
            },
            get name() {
              return that.data.payee.name;
            }
          };
        }

        return this._payee;
      }

      set payee(p) {

        if (this.transfer && p.id) {
          const oldAccount = this.transfer.data.account;
          this.transfer.data.account = p.id;

          this.transfer._emitAccountChange(p.id, oldAccount);
          this.transfer._emitChange();

          return; // no record change
        } else if (this.transfer) {
          this.transfer.remove();

          this.transfer = null;
          this.data.transferId = null;

          this.data.payee = p;
        } else if (p.id) {
          this.transfer = new Transaction({
            value: -this.data.value,
            date: this.data.date,
            account: p.id,
            transferId: this.id,
            category: this.data.category
          });

          this.transfer.transfer = this;

          this.data.transferId = this.transfer.id;

          this.transfer.subscribe(this.fn);
          this.fn(this.transfer);
        } else {
          this.data.payee = p;
        }

        this._emitChange();
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
       * The date of the transaction.
       * Will call subscriber when changes.
       *
       * @type {date}
       */
      get date() {
        return this._date;
      }

      set date(x) {
        this.data.date = x.toISOString();
        const oldDate = this._date;
        this._date = x;

        this.setMonth();

        if (this.transfer) {
          this.transfer.data.date = this.data.date;
          this.transfer._date = this._date;
          this.transfer.setMonth();

          this.transfer._emitDateChange(this._date, oldDate);
          this.transfer._emitChange();
        }

        this._emitDateChange(this._date, oldDate);
        this._emitChange();
      }

      get month() {
        return this._month;
      }

      setMonth() {
        this._month = moment(this._date);

        if (this.category === 'incomeNextMonth') {
          this._month = this._month.add(1, 'month');
        }

        this._month = this._month.toDate();
      }

      /**
       * The category the transaction is assigned to.
       * Will call record and category subscribers when changes.
       *
       * @type {string}
       */
      get category() {
        return this.data.category;
      }

      set category(x) {
        if (this.transfer) {
          this.transfer._emitCategoryChange(() => {
            this.transfer.data.category = x;

            this.transfer.setMonth();
          });

          this.transfer._emitChange();
        }

        this._emitCategoryChange(() => {
          this.data.category = x;

          this.setMonth();
        });

        this._emitChange();
      }

      /**
       * The account the transaction is assigned to.
       * Will call subscriber when changes.
       *
       * @type {string}
       */
      get account() {
        return this.data.account;
      }

      set account(x) {
        const oldAccount = this.data.account;
        this.data.account = x;

        this._emitAccountChange(x, oldAccount);
        this._emitChange();
      }

      /**
       * A user-entered memo for the transaction.
       * Will call subscriber when changes.
       *
       * @type {string}
       */
      get memo() {
        return this.data.memo;
      }

      set memo(x) {
        this.data.memo = x;

        if (this.transfer) {
          this.transfer.data.memo = x;

          this.transfer._emitChange();
        }

        this._emitChange();
      }

      /**
       * Whether the transaction is cleared.
       * Will call subscriber if changes.
       *
       * Will also call cleared and uncleared subscribers
       * with the inverse of the current `value` (swapping the value
       * from cleared to uncleared or vice versa).
       *
       * @type {boolean}
       */
      get cleared() {
        return this.data.cleared;
      }

      set cleared(x) {
        // Don't do anything if it's the same
        if (x === this.data.cleared) {
          return;
        }

        if (x) {
          this._emitUnclearedValueChange(-this.value);
          this._emitClearedValueChange(this.value);
        } else {
          this._emitClearedValueChange(-this.value);
          this._emitUnclearedValueChange(this.value);
        }

        this.data.cleared = x;

        this._emitChange();
      }

      /**
       * The color of the transaction flag.
       *
       * @example
       * const trans = new Transaction();
       * trans.flag = '#ff0000'
       *
       * @type {color}
       */
      get flag() {
        return this.data.flag;
      }

      set flag(x) {
        this.data.flag = x;

        this._emitChange();
      }

      /**
       * The complete transaction ID, including namespacing.
       *
       * @type {string}
       */
      get _id() {
        return this.data._id;
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

      subscribeAccountChange(fn) {
        this.subscribeAccountChangeFn = fn;
      }

      _emitAccountChange(newAccount, oldAccount) {
        this.subscribeAccountChangeFn && this.subscribeAccountChangeFn(newAccount, oldAccount);
      }

      subscribeDateChange(fn) {
        this.subscribeDateChangeFn = fn;
      }

      _emitDateChange(newDate, oldDate) {
        this.subscribeDateChangeFn && this.subscribeDateChangeFn(newDate, oldDate);
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
        return this.fn && this.fn(this);
      }

      /**
       * @todo Remove
      */
      remove() {
        this.data._deleted = true;

        if (this.transfer) {
          this.transfer.data._deleted = true;

          this.transfer._emitChange();
        }

        return this._emitChange();
      }

      /**
       * Will serialize the Transaction object to
       * a JSON object for sending to the database.
       *
       * @returns {object}
      */
      toJSON() {
        return this.data;
      }

      /**
       * The upper bound of alphabetically sorted Transactions by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get startKey() {
        return `b_${budgetId}_transaction_`;
      }

      /**
       * The lower bound of alphabetically sorted Transactions by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get endKey() {
        return this.startKey + '\uffff';
      }

      /**
       * The prefix for namespacing the Transaction UID
       *
       * @type {string}
       */
      static get prefix() {
        return this.startKey;
      }
    };

    return Transaction;
  };
});
