angular.module("financier").factory("MonthCategory", () => {
  /**
   * Represents a MonthCategory (containing a budget cell for the intersection of a given month and category).
   */
  class MonthCategory {
    /**
     * Create a MonthCategory.
     *
     * If creating for the first time (don't have data from database and `_id`), use `MonthCategory.from()`.
     *
     * @param {object} data - The record object from the database
     */
    constructor(data) {
      if (!data || !data._id) {
        throw new Error(`
          Needs _id!
          To generate a new MonthCategory, use
          MonthCategory.from()
        `);
      }
      const myData = angular.extend(
        {
          budget: 0,
          overspending: null,
          note: null,
        },
        data
      );

      this._data = myData;

      const s = myData._id.split("_");
      this.categoryId = s[s.length - 1];
      this.monthId = s[s.length - 2];
    }

    /**
     * Create a MonthCategory `_id` from other IDs.
     *
     * @param {string} budgetId - The budget UUID.
     * @param {string} monthId - The month ID.
     * @param {string} categoryId - The category UUID.
     * @returns {string} - A MonthCategory `_id`.
     * @private
     */
    static _fromId(budgetId, monthId, categoryId) {
      return `${MonthCategory.prefix(budgetId)}${monthId}_${categoryId}`;
    }

    /**
     * Create a MonthCategory `_id` from other IDs.
     *
     * @param {string} budgetId - The budget UUID.
     * @param {string} monthId - The month ID.
     * @param {string} categoryId - The category UUID.
     *
     * @example
     * const monthCat = MonthCategory.from(
     *   '111-111-111-111',
     *   '201501',
     *   '333-333-333-333'
     * );
     *
     * @returns {MonthCategory} - A new MonthCategory object.
     */
    static from(budgetId, monthId, categoryId) {
      return new MonthCategory({
        _id: MonthCategory._fromId(budgetId, monthId, categoryId),
      });
    }

    /**
     * The budget currency value for the given month's category.
     * Will call `subscribe(fn)` with record, and `subscribeBudget(fn)`
     * if the budgeted amount has changed.
     *
     * @type {currency}
     */
    get budget() {
      return this.data.budget;
    }

    set budget(v) {
      const old = this.data.budget;

      // do not re-update the database if the same
      if (v !== old) {
        this.data.budget = v;

        this._emitChange();
        this._emitBudgetChange(v - old);
      }
    }

    /**
     * A note for the MonthCategory object. Will call `MonthCategory.subscribe`'s
     * function.
     *
     * @type {string}
     */
    get note() {
      return this.data.note;
    }

    set note(n) {
      this.data.note = n;

      this._emitChange();
    }

    /**
     * Whether to allow overspending to propagate to future months
     * function. Null is unset (inherit from past months),
     * true/false are explicit and propagate to following until
     * another boolean setting.
     *
     * @type {?boolean}
     */
    get overspending() {
      return this.data.overspending;
    }

    set overspending(o) {
      const oldO = this.data.overspending;
      this.data.overspending = o;

      this._emitOverspendingChange(o, oldO);
      this._emitChange();
    }

    get data() {
      return this._data;
    }

    set data(data) {
      // Set overspending
      const oldOverspending = this.data.overspending;
      this.data.overspending = data.overspending;

      // If not set, don't need to change anything
      if (this.data.overspending != null) {
        this._emitOverspendingChange(data.overspending, oldOverspending);
      }

      // Set budget
      const oldBudget = this.data.budget;
      this.data.budget = data.budget;
      this._emitBudgetChange(data.budget - oldBudget);

      // Set note
      this.data.note = data.note;

      this.data._rev = data._rev;
    }

    /**
     * The `_id` for the record in the database.
     *
     * @type {string}
     */
    get _id() {
      return this.data._id;
    }

    /**
     *
     */
    remove() {
      this.data._deleted = true;
      return this._emitChange();
    }

    /**
     * Set a subscriber for record changes.
     * Will be called with the MonthCategory object.
     *
     * @example
     * const monthCat = MonthCategory.from(
     *   '111-111-111-111',
     *   '201501',
     *   '333-333-333-333'
     * );
     * monthCat.subscribe(obj => {
     *   console.log(obj);
     * });
     * monthCat.budget = 1200; // Will console.log(obj)
     * monthCat.budget = 1200; // Will not console.log(obj) (hasn't changed)
     * monthCat.note = 'Budget more during December'; // Will console.log(obj)
     *
     * @param {function}
     */
    subscribe(fn) {
      this.fn = fn;
    }

    /**
     * Set a subscriber for budget changes. Will be called with
     * the budget delta.
     *
     * @example
     * const monthCat = MonthCategory.from(
     *   '111-111-111-111',
     *   '201501',
     *   '333-333-333-333'
     * );
     * monthCat.subscribeBudget(amount => {
     *   console.log(amount);
     * });
     * monthCat.budget = 1200; // Will console.log(1200)
     * monthCat.budget = 1000; // Will console.log(-200)
     *
     * @param {function}
     */
    subscribeBudget(fn) {
      this.budgetFn = fn;
    }

    /**
     * Will call subscribed function with self, if set.
     *
     * @private
     */
    _emitChange() {
      return this.fn && this.fn(this);
    }

    /**
     * Set a subscriber for overspending changes. Will be called with
     * the new and old overspending value.
     *
     * @example
     * const monthCat = MonthCategory.from(
     *   '111-111-111-111',
     *   '201501',
     *   '333-333-333-333'
     * );
     * monthCat.subscribeOverspending((newVal, oldVal) => {
     *   console.log(newVal, oldVal);
     * });
     * monthCat.overspending = true; // Will console.log(true, null)
     * monthCat.budget = false; // Will console.log(false, true)
     *
     * @param {function}
     */
    subscribeOverspending(fn) {
      this.overspendingFn = fn;
    }

    /**
     * Will call subscribed function with self, if set.
     *
     * @private
     */
    _emitOverspendingChange(newOverspending, oldOverspending) {
      return (
        this.overspendingFn &&
        this.overspendingFn(newOverspending, oldOverspending)
      );
    }

    /**
     * Will call subscribed budget function with value, if set.
     *
     * @param {currency} value - The budget change (newBudget - oldBudget).
     * @private
     */
    _emitBudgetChange(value) {
      return this.budgetFn && this.budgetFn(value);
    }

    /**
     * Will serialize the MonthCategory object to
     * a JSON object for sending to the database.
     *
     * @returns {object}
     */
    toJSON() {
      return this.data;
    }

    /**
     * The upper bound of alphabetically sorted `MonthCategory`s
     * for a whole budget project by ID. Used by PouchDB.
     *
     * @param {string} budgetId - The budget's ID
     * @returns {string} The start key
     */
    static startKey(budgetId) {
      return `b_${budgetId}_m_category_`;
    }

    /**
     * The lower bound of alphabetically sorted `MonthCategory`s
     * for a whole budget project by ID. Used by PouchDB.
     *
     * @param {string} budgetId - The budget's ID
     * @returns {string} The end key
     */
    static endKey(budgetId) {
      return this.startKey(budgetId) + "\uffff";
    }

    /**
     * The prefix for namespacing the monthCategory ID
     *
     * @param {string} budgetId - The budget's ID
     * @returns {string} The prefix
     */
    static prefix(budgetId) {
      return this.startKey(budgetId);
    }

    /**
     * Used for detecting if a document's _id is a MonthCategory
     * in this budget.
     *
     * @param {string} budgetId - The budget's ID
     * @param {string} _id - The document's _id
     * @returns {boolean} True if document _id is in the budget
     * as a MonthCategory.
     */
    static contains(budgetId, _id) {
      return _id > this.startKey(budgetId) && _id < this.endKey(budgetId);
    }
  }

  return MonthCategory;
});
