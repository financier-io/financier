angular.module("financier").factory("BudgetOpened", () => {
  /**
   * Represents a BudgetOpened
   */
  class BudgetOpened {
    /**
     * Create a BudgetOpened
     *
     * @param {object} [data] - The record object from the database
     */
    constructor(data) {
      this.id = data._id.slice(data._id.lastIndexOf("_") + 1);

      this._data = data;
    }

    /**
     * When the budget was last opened to sort budgets
     * by most recently used.
     *
     * @example
     * const budget = new BudgetOpened();
     * budget.opened // undefined
     * budget.open();
     * budget.opened; // new Date([just now])
     */
    open() {
      this._data.opened = new Date().toISOString();
      this.emitChange();
    }
    /**
     * When the budget was last opened to sort budgets
     * by most recently used. See `budget.open()` for usage.
     *
     * @type {date}
     */
    get opened() {
      if (!this._opened && this._data.opened) {
        this._opened = new Date(this._data.opened);
      }
      return this._opened;
    }

    get data() {
      return this._data;
    }

    set data(d) {
      this._data.opened = d.opened;
      this._opened = new Date(this._data.opened);
    }

    /**
     * Get the complete `_id`, with namespace as set in the database.
     *
     * @example
     * const cat = new Category();
     * cat._id; // === 'b_8435609a-161c-4eb6-9ed8-a86414a696cf_category_ab735ea6-bd56-449c-8f03-6afcc91e2248'
     *
     * @type {string}
     */
    get _id() {
      return this._data._id;
    }

    /**
     * @todo Remove, moving functionality elsewhere
     */
    remove() {
      this._data._deleted = true;
      return this.emitChange();
    }

    /**
     * Used to set the function to invoke upon record changes.
     *
     * @param {function} fn - This function will be invoked upon record
     * changes with the Category object as the first parameter.
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
     * Set the revision number of the record, via PouchDB. No getter.
     *
     * @example
     * const budgetOpened = new BudgetOpened();
     * budgetOpened._rev = '1-A6157A5EA545C99B00FF904EEF05FD9F';
     *
     * @type {string}
     */
    set _rev(r) {
      this._data._rev = r;
    }

    /**
     * Will serialize the Category object to
     * a JSON object for sending to the database.
     *
     * @returns {object}
     */
    toJSON() {
      return this._data;
    }
    /**
     * The upper bound of alphabetically sorted Categories by ID. Used by PouchDB.
     *
     * @type {string}
     */
    static get startKey() {
      return "budget-opened_";
    }

    /**
     * The lower bound of alphabetically sorted Categories by ID. Used by PouchDB.
     *
     * @type {string}
     */
    static get endKey() {
      return this.startKey + "\uffff";
    }

    /**
     * The prefix for namespacing the Category UID
     *
     * @type {string}
     */
    static get prefix() {
      return this.startKey;
    }

    /**
     * Used for detecting if a document's _id is an BudgetOpened
     * in this budget.
     *
     * @param {string} _id - The document's _id
     * @returns {boolean} True if document _id is in the budget
     * as an account.
     */
    static contains(_id) {
      return _id > this.startKey && _id < this.endKey;
    }
  }

  return BudgetOpened;
});
