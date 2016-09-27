angular.module('financier').factory('Settings', () => {
  return class Settings {
    constructor(data) {
      this.data = angular.merge({
        closedAccountsCollapsed: false,
        offBudgetAccountsCollapsed: false,
        _id: 'settings'
      }, data);

      const that = this;
    }

    /**
     * The closedAccountsCollapsed of the account. When set, will immediately call subscribed function.
     *
     * @example
     * const checking = new Account();
     * checking.closedAccountsCollapsed = 'USAA Checking 1234';
     * console.log(checking.closedAccountsCollapsed); // 'USAA Checking 1234'
     *
     * @type {string}
    */
    get closedAccountsCollapsed() {
      return this.data.closedAccountsCollapsed;
    }

    set closedAccountsCollapsed(n) {
      this.data.closedAccountsCollapsed = n;
      this.emitChange();
    }

    /**
     * The offBudgetAccountsCollapsed of the account. When set, will immediately call subscribed function.
     *
     * @example
     * const checking = new Account();
     * checking.offBudgetAccountsCollapsed = 'USAA Checking 1234';
     * console.log(checking.offBudgetAccountsCollapsed); // 'USAA Checking 1234'
     *
     * @type {string}
    */
    get offBudgetAccountsCollapsed() {
      return this.data.offBudgetAccountsCollapsed;
    }

    set offBudgetAccountsCollapsed(n) {
      this.data.offBudgetAccountsCollapsed = n;
      this.emitChange();
    }

    get hints() {
      return this._hints;
    }

    subscribe(fn) {
      this.fn = fn;
    }

    emitChange() {
      return this.fn && this.fn(this);
    }

    get _id() {
      return this.data._id;
    }

    set _rev(r) {
      this.data._rev = r;
    }

    toJSON() {
      return this.data;
    }
  };
});
