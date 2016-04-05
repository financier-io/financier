angular.module('financier').factory('account', uuid => {
  return budgetId => {
    return class Account {
      constructor(data = {
        type: 'DEBIT',
        closed: false
      }) {
        // add _id if none exists
        if (!data._id) {
          data._id = Account.prefix + uuid();
        }

        this.id = data._id.slice(data._id.lastIndexOf('_') + 1);

        this.data = data;

      }

      get name() {
        return this.data.name;
      }

      set name(n) {
        this.data.name = n;
        this.emitChange();
      }

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

      /*
        TYPE is one of:

        'DEBIT'
        'CREDIT'
      */

      get type() {
        return this.data.type;
      }

      set type(t) {
        this.data.type = t;
        this.emitChange();
      }

      remove() {
        this.data._deleted = true;
        return this.emitChange();
      }

      get closed() {
        return this.data.closed;
      }

      set closed(c) {
        this.data.closed = c;
        this.emitChange();
      }

      subscribe(fn) {
        this.fn = fn;
      }

      emitChange() {
        return this.fn && this.fn(this);
      }

      toJSON() {
        return this.data;
      }

      static get startKey() {
        return `b_${budgetId}_account_`;
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
