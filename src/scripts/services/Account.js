angular.module('financier').factory('account', uuid => {
  return budgetId => {

    /**
     * Represents an account (credit card, checking, etc)
     */
    class Account {
      /**
       * Create an Account
       *
       * @param {object} [data] - The record object from the database
       * (with `_id` and `_rev`).
       */
      constructor(data = {
        type: 'DEBIT',
        closed: false,
        name: null
      }) {
        // add _id if none exists
        if (!data._id) {
          data._id = Account.prefix + uuid();
        }

        this.id = data._id.slice(data._id.lastIndexOf('_') + 1);

        this.data = data;

      }

      /**
       * The name of the account. When set, will immediately call subscribed function.
       *
       * @example
       * const checking = new Account();
       * checking.name = 'USAA Checking 1234';
       * console.log(checking.name); // 'USAA Checking 1234'
       *
       * @type {string}
      */
      get name() {
        return this.data.name;
      }

      set name(n) {
        this.data.name = n;
        this.emitChange();
      }

      /**
       * @todo Remove, should just be a normal Transaction
      */
      get startingBalance() {
        return this.data.startingBalance;
      }

      set startingBalance(n) {
        this.data.startingBalance = n;
        this.emitChange();
      }

      get startingBalanceDate() {
        return this.data.startingBalanceDate;
      }

      set startingBalanceDate(n) {
        this.data.startingBalanceDate = n;
        this.emitChange();
      }

      /**
       * The type of account, either `'DEBIT'` for checking
       * & savings accounts, or `'CREDIT'` for credit cards.
       *
       * When set, will immediately call subscribed function.
       *
       * @type {string}
      */
      get type() {
        return this.data.type;
      }

      set type(type) {
        this.data.type = type;
        this.emitChange();
      }

      remove() {
        this.data._deleted = true;
        return this.emitChange();
      }

      /**
       * Whether the account is closed or not. Closing an account has no
       * functional effects (just visual - removed from list of active
       * accounts)
       *
       * @type {boolean}
      */
      get closed() {
        return this.data.closed;
      }

      set closed(c) {
        this.data.closed = c;
        this.emitChange();
      }

      /**
       * Used to set the function to invoke upon record changes.
       *
       * @param {function} fn - This function will be invoked upon record
       * changes with the Account object as the first parameter.
      */
      subscribe(fn) {
        this.fn = fn;
      }

      /**
       * Will call the subscribed function, if it exists, with self.
       *
       * @private
      */
      emitChange() {
        return this.fn && this.fn(this);
      }

      /**
       * Will serialize the Account object to
       * a JSON object for sending to the database.
       *
       * @returns {object}
      */
      toJSON() {
        return this.data;
      }

      /**
       * The upper bound of alphabetically sorted months by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get startKey() {
        return `b_${budgetId}_account_`;
      }

      /**
       * The lower bound of alphabetically sorted months by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get endKey() {
        return this.startKey + '\uffff';
      }

      /**
       * The prefix for namespacing the Account UID
       *
       * @type {string}
       */
      static get prefix() {
        return this.startKey;
      }
    };

    return Account;
    
  };

});
