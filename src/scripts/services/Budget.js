angular.module('financier').factory('Budget', uuid => {
  /**
   * Represents a Budget project
   */
  class Budget {

    /**
     * Create a Budget
     *
     * @param {object} [data] - The record object from the database
     */
    constructor(data) {
      this._data = angular.merge({
        hints: {
          outflow: true
        },
        initialBalancePayee: null,
        _id: 'budget_' + uuid(),
        created: new Date().toISOString()
      }, data);

      const that = this;

      this._hints = {
        get outflow() {
          return that.data.hints.outflow;
        },
        set outflow(o) {
          that.data.hints.outflow = o;
          that.emitChange();
        }
      };

      /**
       * Get the non-namespaced budget UID.
       *
       * @example
       * const budget = new Budget();
       * budget.id; // === 'ab735ea6-bd56-449c-8f03-6afcc91e2248'
       *
       * @type {string}
      */
      this.id = this._data._id.slice(this._data._id.lastIndexOf('_') + 1);
    }

    /**
     * Hint popup helper/tutorial configuration.
     * boxes. Setting a key of `hints{}` will trigger
     * the subscriber. Setting `hints` directly is
     * not allowed.
     *
     * Valid options:
     * * `budget.hints.outflow` (default true)
     *
     * @example
     * const budget = new Budget();
     * budget.hints.outflow // true
     * budget.hints.outflow = false;
     *
     * @type {object}
     */
    get hints() {
      return this._hints;
    }

    /**
     * The budget name. Will trigger subscriber upon set.
     *
     * @example
     * const budget = new Budget();
     * budget.name = 'My new budget';
     * budget.name; // === 'My new budget'
     *
     * @type {string}
     */
    get name() {
      return this._data.name;
    }

    set name(n) {
      this._data.name = n;
      this.emitChange();
    }

    /**
     * When the budget was created.
     * Will be stored in record as `date.toISOString()`.
     * Cannot be set.
     *
     * @example
     * const budget = new Budget();
     * budget.created; // practically `new Date()`
     *
     * @type {date}
     */
    get created() {
      return new Date(this._data.created);
    }

    remove() {
      this._data._deleted = true;
      return this.emitChange();
    }

    /**
     * When the budget was last opened to sort budgets
     * by most recently used.
     *
     * @example
     * const budget = new Budget();
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

    /**
     * When a new change comes in from the _changes Pouch/Couch feed,
     * update the raw record data through this getter/setter so that we
     * have a chance to intercept it
     *
     * @type {object}
     */
    get data() {
      return this._data;
    }

    set data(data) {
      this._data = data;
    }

    get initialBalancePayee() {
      return this._data.initialBalancePayee;
    }

    set initialBalancePayee(payee) {
      this._data.initialBalancePayee = payee;
      this.emitChange();
    }

    /**
     * Used to set the function to invoke upon record changes.
     *
     * @param {function} fn - This function will be invoked upon record
     * changes with the Budget object as the first parameter.
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
     * Get the complete `_id`, with namespace as set in the database.
     *
     * @example
     * const budget = new Budget();
     * budget._id; // === 'budget_ab735ea6-bd56-449c-8f03-6afcc91e2248'
     *
     * @type {string}
    */
    get _id() {
      return this._data._id;
    }

    /**
     * Set the revision number of the record, via PouchDB. No getter.
     *
     * @example
     * const budget = new Budget();
     * budget._rev = '1-A6157A5EA545C99B00FF904EEF05FD9F';
     *
     * @type {string}
    */
    set _rev(r) {
      this._data._rev = r;
    }

    /**
     * Will serialize the Budget object to
     * a JSON object for sending to the database.
     *
     * @returns {object}
    */
    toJSON() {
      return this._data;
    }

    /**
     * The upper bound of alphabetically sorted Budgets by ID. Used by PouchDB.
     *
     * @type {string}
     */
    static get startKey() {
      return 'budget_';
    }

    /**
     * The lower bound of alphabetically sorted Budgets by ID. Used by PouchDB.
     *
     * @type {string}
     */
    static get endKey() {
      return this.startKey + '\uffff';
    }

    /**
     * The prefix for namespacing the Budget UID
     *
     * @type {string}
     */
    static get prefix() {
      return this.startKey;
    }

    /**
     * Used for detecting if a document's _id is a Budget
     *
     * @param {string} _id - The document's _id
     * @returns {boolean} True if document _id is a Budget
     */
    static contains(_id) {
      return _id > this.startKey && _id < this.endKey;
    }
  };

  return Budget;
});
