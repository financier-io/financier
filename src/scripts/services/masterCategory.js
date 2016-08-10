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
          categories: [],
          sort: 0
        }, data);

        this.id = myData._id.slice(myData._id.lastIndexOf('_') + 1);

        // Hack below
        myData.categories.update = () => {
          this.emitChange();
        };

        this.data = myData;
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
        return this.data.name;
      }

      set name(n) {
        this.data.name = n;
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
        return this.data;        
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
        return this.data.categories;
      }

      set categories(arr) {
        // Hack below
        arr.update = () => {
          this.emitChange();
        };

        return this.data.categories;
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
        return this.data.sort;
      }

      set sort(i) {
        // only put() new record if
        // there has been a change

        if (this.data.sort !== i) {
          this.data.sort = i;
          this.emitChange();
        }
      }

      /**
       * @todo Remove, moving functionality elsewhere
       */
      remove() {
        this.data._deleted = true;
        this.emitChange();
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
        return `b_${budgetId}_masterCategory_`;
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
