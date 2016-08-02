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

        /**
         * Get the non-namespaced account UID.
         *
         * @example
         * const account = new Account();
         * account.id; // === 'ab735ea6-bd56-449c-8f03-6afcc91e2248'
         *
         * @type {string}
        */
        this.id = data._id.slice(data._id.lastIndexOf('_') + 1);

        this.data = data;
        this.transactions = [];

        this.cache = {
          clearedBalance: 0,
          unclearedBalance: 0,
          get balance() {
            return this.clearedBalance + this.unclearedBalance;
          }
        };

        this._clearedValueChangeFn = val => {
          this._changeClearedBalance(val);
        };

        this._unclearedValueChangeFn = val => {
          this._changeUnclearedBalance(val);
        };

        this._transferClearedValueChangeFn = val => {
          this._changeClearedBalance(-val);
        };

        this._transferUnclearedValueChangeFn = val => {
          this._changeUnclearedBalance(-val);
        };
      }

      /**
       * Add a transaction to an account
       *
       * @param {Transaction} trans The Transaction to add to the account balance, and
       * to subscribe to for future changes.
      */
      addTransaction(trans) {
        let _transfer = trans;

        if (trans.payee.id === this.id) {
          // Transfer to this account
          _transfer = trans.transfer;
        }

        this.transactions.push(_transfer);

        if (_transfer.cleared) {
          this._changeClearedBalance(_transfer.value);
        } else {
          this._changeUnclearedBalance(_transfer.value);
        }

        _transfer.subscribeClearedValueChange(this._clearedValueChangeFn);
        _transfer.subscribeUnclearedValueChange(this._unclearedValueChangeFn);
      }

      /**
       * Remove a transaction from an account
       *
       * @param {Transaction} trans The Transaction to remove from the account balance, and
       * to unsubscribe from for future changes.
      */
      removeTransaction(trans) {
        let _transfer = trans;

        if (trans.payee.id === this.id) {
          // Transfer to this account
          _transfer = trans.transfer;
        }

        const index = this.transactions.indexOf(trans);
        if (index !== -1) {
          this.transactions.splice(index, 1);
        }

        if (_transfer.cleared) {
          this._changeClearedBalance(-_transfer.value);
        } else {
          this._changeUnclearedBalance(-_transfer.value);
        }

        _transfer.unsubscribeClearedValueChange(this._clearedValueChangeFn);
        _transfer.unsubscribeUnclearedValueChange(this._unclearedValueChangeFn);
      }

      /**
       * Change the current cleared account balance by a certain amount.
       *
       * @param {currency} val The relative value to change the cleared
       * balance by.
       * @private
      */
      _changeClearedBalance(val) {
        this.cache.clearedBalance += val;
      }

      /**
       * Change the current cleared account balance by a certain amount.
       *
       * @param {currency} val The relative value to change the uncleared
       * balance by.
       * @private
      */
      _changeUnclearedBalance(val) {
        this.cache.unclearedBalance += val;
      }

      /**
       * The current balance of the account.
       *
       * @type {currency}
      */
      get balance() {
        return this.cache.balance;
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

      /**
       * Sets _deleted on the record and calls record subscriber.
      */
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
       * The upper bound of alphabetically sorted Accounts by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get startKey() {
        return `b_${budgetId}_account_`;
      }

      /**
       * The lower bound of alphabetically sorted Accounts by ID. Used by PouchDB.
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
