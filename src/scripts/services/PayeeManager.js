angular.module('financier').factory('PayeeManager', () => {
  class PayeeManager {
    constructor() {
      this._payees = {};
    }

    add(payee) {
      if (payee === '') {
        return;
      }

      if (angular.isUndefined(this._payees[payee])) {
        this._payees[payee] = 0;
      }

      this._payees[payee]++;
    }

    remove(payee) {
      if (payee === '' || angular.isUndefined(this._payees[payee])) {
        return;
      }

      this._payees[payee]--;

      if (this._payees[payee] <= 0) {
        delete this._payees[payee];
      }
    }

    toArray() {
      return Object.keys(this._payees).sort();
    }
  }

  return PayeeManager;
})
