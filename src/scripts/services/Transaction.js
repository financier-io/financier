angular.module('financier').factory('Transaction', () => {
  return class Transaction {
    constructor(amount, fn) {
      if (!angular.isNumber(amount)) {
        throw new TypeError('Must provide number');
      }
      this.amount = amount;
      this.fn = fn;
    }

    get value() {
      return this.amount;
    }

    set value(amount) {
      const old = this.amount;
      this.amount = amount;

      this.fn && this.fn(amount, old);
    }

    subscribe(fn) {
      this.fn = fn;
    }

    toJSON() {
      return {
        value: this.amount
      };
    }
  }
})