angular.module('financier').factory('account', uuid => {
  return budgetId => {
    return class Account {
      constructor(data = {
        name: 'New account',
        type: 'DEBIT'
      }) {
        // add _id if none exists
        if (!data._id) {
          data._id = `b_${budgetId}_account_${uuid()}`;
        }

        this.data = data;

      }

      get name() {
        return this.data.name;
      }

      set name(n) {
        this.data.name = n;
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
        return `b_${budgetId}_account_\uffff`;
      }
    };
  };
});
