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
          flag: false
        }, data);

        this.id = myData._id.slice(myData._id.lastIndexOf('_') + 1);

        if (myData.date) {
          this._date = new Date(myData.date);
        }

        this.data = myData;
      }

      /**
       * The currency value of the transaction.
       * Will call record and value subscribers upon change.
       *
       * @type {currency}
       */
      get value() {
        return this.data.value;
      }

      set value(x) {
        const oldValue = this.data.value;

        this.data.value = x;

        this._emitValueChange(x - oldValue);
        this._emitChange();
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
       * Will call subscriber when changes.
       *
       * @type {string}
       */
      get category() {
        return this.data.category;
      }

      set category(x) {
        this.data.category = x;

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
        this.data.cleared = x;

        this._emitChange();
      }

      /**
       * Whether the transaction is flagged.
       * Will call subscriber when changes.
       *
       * @type {boolean}
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
    };

    return Transaction;
  };
});
