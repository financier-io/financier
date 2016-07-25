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
        const myData = angular.extend({
          _id: `b_${budgetId}_transaction_${uuid()}`,
          value: null,
          date: null,
          category: null,
          account: null,
          payee: null,
          memo: null,
          cleared: false,
          flag: null
        }, data);

        this.id = myData._id.slice(myData._id.lastIndexOf('_') + 1);

        if (myData.date) {
          this._date = new Date(myData.date);
        }

        this.subscribeClearedValueChangeFn = [];
        this.subscribeUnclearedValueChangeFn = [];

        this.data = myData;
      }

      /**
       * The currency value of the transaction.
       * Will call record and value subscribers upon change.
       *
       * Negative value = outflow, positive = inflow.
       *
       * @type {currency}
       */
      get value() {
        return this.data.value;
      }
      get clearedValue() {
        if (!this.cleared) {
          return 0;
        }
        return this.data.value;
      }
      get unclearedValue() {
        if (this.cleared) {
          return 0;
        }
        return this.data.value;
      }

      set value(x) {
        const oldValue = this.data.value;

        this.data.value = x;

        if (this.cleared) {
          this._emitClearedValueChange(x - oldValue);
        } else {
          this._emitUnclearedValueChange(x - oldValue);
        }
        this._emitChange();
      }

      get outflow() {
        if (this.value <= 0) {
          return Math.abs(this.value);
        }
      }

      set inflow(v) {
        this.value = -v;
      }

      get inflow() {
        if (this.value >= 0) {
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
        this._date = x;

        this._emitChange();
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
        const oldCategory = this.data.category;

        this.data.category = x;

        this._emitCategoryChange(x, oldCategory);
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
        this.data.account = x;

        this._emitChange();
      }

      /**
       * The payee the transaction is assigned to.
       * Will call subscriber when changes.
       *
       * @type {string}
       */
      get payee() {
        return this.data.payee;
      }

      set payee(x) {
        this.data.payee = x;

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

        this._emitChange();
      }

      /**
       * Whether the transaction is cleared.
       * Will call subscriber when changes.
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
       * trans.flag = 'ff0000'
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
       * Used to set the function to invoke upon value changes.
       *
       * @param {function} fn - This function will be invoked upon value
       * changes with the amount the value has changed as the first parameter.
      */
      subscribeValueChange(fn) {
        this.subscribeValueChangeFn = fn;
      }
      subscribeClearedValueChange(fn) {
        this.subscribeClearedValueChangeFn.push(fn);
      }
      subscribeUnclearedValueChange(fn) {
        this.subscribeUnclearedValueChangeFn.push(fn);
      }

      /**
       * Used to set the function to invoke upon value changes.
       *
       * @param {function} fn - This function will be invoked upon value
       * changes with the new category ID as the first parameter, and the
       * old as the second.
      */
      subscribeCategoryChange(fn) {
        this.subscribeCategoryChangeFn = fn;
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
      _emitClearedValueChange(val) {
        for (let i = 0; i < this.subscribeClearedValueChangeFn.length; i++) {
          this.subscribeClearedValueChangeFn[i](val);
        }
      }
      _emitUnclearedValueChange(val) {
        for (let i = 0; i < this.subscribeUnclearedValueChangeFn.length; i++) {
          this.subscribeUnclearedValueChangeFn[i](val);
        }
      }

      /**
       * Will call the subscribed category function, if it exists, with the
       * new category ID as the first parameter, and the old as the second.
       *
       * @private
      */
      _emitCategoryChange(newCat, oldCat) {
        return this.subscribeCategoryChangeFn && this.subscribeCategoryChangeFn(newCat, oldCat);
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
