angular.module('financier').factory('masterCategory', (category, uuid) => {
  return budgetId => {
    const Category = category(budgetId);

    /**
     * Represents a MasterCategory (contains Category[])
     *
     * @extends Category
     */
    class MasterCategory {

      /**
       * Create a MasterCategory
       *
       * @param {object} [data] - The record object from the database
       */
      constructor(data) {
        const myData = angular.extend({
          name: 'New master category',
          _id: MasterCategory.prefix + uuid(),
          sort: 0,
          collapsed: false
        }, data);

        this.id = myData._id.slice(myData._id.lastIndexOf('_') + 1);

        this._data = myData;

        this._categories = [];
        this._categories.masterCategory = this;
      }

      /**
       * The category name. Will trigger subscriber upon set.
       *
       * @example
       * const cat = new Category();
       * cat.name = '⛽ Fuel/Gas';
       * cat.name; // === '⛽ Fuel/Gas'
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
       * If the category is collapsed. Will trigger subscriber upon set.
       *
       * @example
       * const cat = new Category();
       * cat.collapsed = true;
       * cat.collapsed; // === true
       *
       * @type {boolean}
       */
      get collapsed() {
        return this._data.collapsed;
      }

      set collapsed(n) {
        this._data.collapsed = n;
        this.emitChange();
      }

      /**
       * Will serialize the MasterCategory object to
       * a JSON object for sending to the database.
       *
       * *Note:* Will create an array of `_id`s of
       * the Category objects it contains, in order.
       *
       * @returns {object}
       */
      toJSON() {
        return this._data;        
      }

      /**
       * The `Category`s contained within this `MasterCategory`.
       *
       * *NOTE:* When setting, there is a hack to expose an `update()` function
       * extended off the array provided. This is a hack for the Sortable library
       * because it only provides the changed array in an event upon sort update,
       * and we need some way to notify the subscriber of a record change.
       * See the example below and/or the source.
       *
       * @example
       * const masterCat = new MasterCategory();
       * masterCat.categories = [];
       * masterCat.categories.update(); // Will call subscriber
       * masterCat.categories.length; // === 0
       *
       * @type {Category[]}
       */
      get categories() {
        return this._categories;
      }

      set categories(arr) {
        arr.masterCategory = this;

        this._categories = arr;
      }

      addCategory(cat) {
        this._categories.push(cat);

        const sort = () => {
          this._categories.sort((a, b) => a.sort - b.sort);
        };

        sort();

        cat.subscribeSortChange(sort);
      }

      removeCategory(cat) {
        const index = this._categories.indexOf(cat);

        if (index !== -1) {
          this._categories.splice(index, 1);
        }
      }

      /**
       * The `MasterCategory` object order relative to other `MasterCategory`s.
       * Will call subscriber if the number has changed.
       *
       * @example
       * const masterCat = new MasterCategory();
       * masterCat.sort = 1; // will emit to subscriber
       * masterCat.sort = 1; // will *not* emit to subscriber
       * masterCat.sort = 2; // will emit to subscriber
       *
       * @type {number}
       */
      get sort() {
        return this._data.sort;
      }

      set sort(i) {
        // only put() new record if
        // there has been a change

        if (this._data.sort !== i) {
          this._data.sort = i;
          this.emitChange();
        }
      }

      remove() {
        this._data._deleted = true;
        this.emitChange();
      }

      get _id() {
        return this._data._id;
      }

      get data() {
        return this._data;
      }

      set data(d) {
        this._data.sort = d.sort;

        this._data.name = d.name;

        this._data.collapsed = d.collapsed;

        this._data._rev = d._rev;
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
        this.fn && this.fn(this);
      }

      /**
       * The upper bound of alphabetically sorted MasterCategories by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get startKey() {
        return `b_${budgetId}_master-category_`;
      }

      /**
       * The lower bound of alphabetically sorted MasterCategories by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get endKey() {
        return this.startKey + '\uffff';
      }

      /**
       * The prefix for namespacing the MasterCategory's UID
       *
       * @type {string}
       */
      static get prefix() {
        return this.startKey;
      }

      /**
       * Used for detecting if a document's _id is a MasterCategory
       * in this budget.
       *
       * @param {string} _id - The document's _id
       * @returns {boolean} True if document _id is in the budget
       * as a MasterCategory.
       */
      static contains(_id) {
        return _id > this.startKey && _id < this.endKey;
      }
    };

    return MasterCategory;
  };
});
