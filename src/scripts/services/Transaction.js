angular.module('financier').factory('transaction', uuid => {
  return budgetId => {
    return class Transaction {
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

      get value() {
        return this.data.value;
      }

      set value(x) {
        this.data.value = x;

        this.emitChange();
      }

      get date() {
        return this._date;
      }

      set date(x) {
        this.data.date = x.toISOString();
        this._date = x;

        this.emitChange();
      }

      get category() {
        return this.data.category;
      }

      set category(x) {
        this.data.category = x;

        this.emitChange();
      }

      get account() {
        return this.data.account;
      }

      set account(x) {
        this.data.account = x;

        this.emitChange();
      }

      get payee() {
        return this.data.payee;
      }

      set payee(x) {
        this.data.payee = x;

        this.emitChange();
      }

      get memo() {
        return this.data.memo;
      }

      set memo(x) {
        this.data.memo = x;

        this.emitChange();
      }

      get cleared() {
        return this.data.cleared;
      }

      set cleared(x) {
        this.data.cleared = x;

        this.emitChange();
      }

      get flag() {
        return this.data.flag;
      }

      set flag(x) {
        this.data.flag = x;

        this.emitChange();
      }

      get _id() {
        return this.data._id;
      }

      subscribe(fn) {
        this.fn = fn;
      }

      emitChange() {
        return this.fn && this.fn(this);
      }

      remove() {
        this.data._deleted = true;

        return this.emitChange();
      }

      toJSON() {
        return this.data;
      }
    };
  };
});
