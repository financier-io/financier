angular.module('financier').factory('Account', uuid => {
  return class Account {
    constructor(data = {
      name: 'New account',
      type: 'DEBIT'
    }) {
      // add _id if none exists
      if (!data._id) {
        data._id = 'account_' + uuid();
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

    subscribe(fn) {
      this.fn = fn;
    }

    emitChange() {
      return this.fn && this.fn(this);
    }

    toJSON() {
      return this.data;
    }
  };
});
