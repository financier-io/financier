angular.module('financier').factory('Transfer', uuid => {
  class Transfer {
    constructor(transaction) {
      this.transaction = transaction;

      this.payee = {
        type: 'TRANSFER',
        id: transaction.account
      };

      this.id = uuid();
    }

    get value() {
      return -this.transaction.value;
    }

    get outflow() {
      return this.transaction.inflow;
    }
    set outflow(v) {
      this.transaction.inflow = v;
    }

    get inflow() {
      return this.transaction.outflow;
    }
    set inflow(v) {
      this.transaction.outflow = v;
    }

    get flag() {
      return this.transaction.data.transfer.flag;
    }
    set flag(x) {
      this.transaction.data.transfer.flag = x;

      this.transaction._emitChange();
    }

    subscribeClearedValueChange(fn) {
      this.subscribeClearedValueChangeFn = fn;
    }

    subscribeUnclearedValueChange(fn) {
      this.subscribeUnclearedValueChangeFn = fn;
    }

    _emitClearedValueChange(val) {
      this.subscribeClearedValueChangeFn && this.subscribeClearedValueChangeFn(val);
    }

    _emitUnclearedValueChange(val) {
      this.subscribeUnclearedValueChangeFn && this.subscribeUnclearedValueChangeFn(val);
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
      return this.transaction.data.transfer.cleared;
    }

    set cleared(x) {
      // Don't do anything if it's the same
      if (x === this.transaction.data.transfer.cleared) {
        return;
      }

      if (x) {
        this._emitUnclearedValueChange(this.transaction.value);
        this._emitClearedValueChange(-this.transaction.value);
      } else {
        this._emitClearedValueChange(this.transaction.value);
        this._emitUnclearedValueChange(-this.transaction.value);
      }

      this.transaction.data.transfer.cleared = x;

      this.transaction._emitChange();
    }


    // EXTENDING TRANSACTION BELOW

    /**
     * The date of the transaction.
     * Will call subscriber when changes.
     *
     * @type {date}
     */
    get date() {
      return this.transaction.date;
    }

    set date(x) {
      this.transaction.date = x;
    }

    /**
     * The category the transaction is assigned to.
     * Will call record and category subscribers when changes.
     *
     * @type {string}
     */
    get category() {
      return this.transaction.category;
    }

    set category(x) {
      this.transaction.category = x;
    }

    /**
     * The account the transaction is assigned to.
     * Will call subscriber when changes.
     *
     * @type {string}
     */
    get account() {
      return this.transaction.payee.id;
    }

    set account(x) {
      this.transaction.payee.id = x;
    }

    /**
     * A user-entered memo for the transaction.
     * Will call subscriber when changes.
     *
     * @type {string}
     */
    get memo() {
      return this.transaction.memo;
    }

    set memo(x) {
      this.transaction.memo = x;
    }

  }

  return Transfer;
});
