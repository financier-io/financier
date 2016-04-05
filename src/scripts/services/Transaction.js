angular.module('financier').factory('transaction', uuid => {
  return class Transaction {
    constructor(obj, fn) {
      if (!angular.isNumber(obj.value)) {
        throw new TypeError('Must provide number');
      }

      if (!obj.id) {
        // TODO
        this.id = uuid();
      } else {
        this.id = obj.id;
      }

      this._value = obj.value;
      this.date = obj.date;
      this.account = obj.account;
      this.payee = obj.payee;
      this.memo = obj.memo;
      this.cleared = obj.cleared;
      this.flag = obj.flag;

      this.fn = fn;
    }

    get value() {
      return this._value;
    }

    set value(_value) {
      const old = this._value;
      this._value = _value;

      this.fn && this.fn(_value, old);
    }

    subscribe(fn) {
      this.fn = fn;
    }

    toJSON() {
      return {
        value: this._value,
        date: this.date,
        account: this.account,
        payee: this.payee,
        memo: this.memo,
        cleared: this.cleared,
        flag: this.flag,
        id: this.id
      };
    }
  };
});
