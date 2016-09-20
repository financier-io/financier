angular.module('financier').factory('category', uuid => {
  return budgetId => {
    /**
     * Represents a Category, contained within a MasterCategory
     */
    class Category {

      /**
       * Create a Category
       *
       * @param {object} [data] - The record object from the database
       */
      constructor(data) {
        const myData = angular.extend({
          name: 'New category',
          masterCategory: null,
          sort: 0,
          _id: Category.prefix + uuid()
        }, data);

        this.id = myData._id.slice(myData._id.lastIndexOf('_') + 1);

        this._data = myData;

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
       * The parent category id. Will trigger subscriber upon set.
       *
       * @example
       * const cat = new Category();
       * cat.masterCategory = 'b_8435609a-161c-4eb6-9ed8-a86414a696cf_master-category_ab735ea6-bd56-449c-8f03-6afcc91e2248';
       * cat.masterCategory; // === 'b_8435609a-161c-4eb6-9ed8-a86414a696cf_master-category_ab735ea6-bd56-449c-8f03-6afcc91e2248'
       *
       * @type {string}
       */
      get masterCategory() {
        return this._data.masterCategory;
      }

      set masterCategory(n) {
        if (this._data.masterCategory !== n) {
          this._data.masterCategory = n;
          this.emitChange();
        }
      }

      setMasterAndSort(masterCategory, i) {
        const saveFn = this.fn;
        this.fn = null;

        const oldSort = this.sort,
          master = this.masterCategory;

        this.masterCategory = masterCategory;
        this.sort = i;

        this.fn = saveFn;

        if (i !== oldSort || masterCategory !== master) {
          this.emitChange();
        }
      }

      /**
       * The category sort order. Will trigger subscriber upon set.
       *
       * @example
       * const cat = new Category();
       * cat.sort = 1;
       * cat.sort; // === 1
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

      /**
       * The category note (description, any user data).
       * Will trigger subscriber upon set.
       *
       * @example
       * const cat = new Category();
       * cat.note = 'Commute 30 miles per day.';
       * cat.note; // === 'Commute 30 miles per day.'
       *
       * @type {string}
       */
      get note() {
        return this._data.note;
      }

      set note(n) {
        this._data.note = n;
        this.emitChange();
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
       * 
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
       * Used to set the function to invoke upon record changes
       *
       * @param {function} fn - This function will be invoked upon record
       * changes with the Category object as the first parameter.
      */
      subscribeSortChange(fn) {
        this.sortFn = fn;
      }

      /**
       * Used to set the function to invoke upon master category changes
       *
       * @param {function} fn - This function will be invoked upon record
       * changes with the Category object as the first parameter.
      */
      subscribeMasterCategoryChange(fn) {
        this.masterCategoryFn = fn;
      }

      /**
       * Will call the subscribed function, if it exists, with self.
       *
       * @private
      */
      emitSortChange() {
        return this.sortFn && this.sortFn(this);
      }

      /**
       * Will call the subscribed function, if it exists, with self.
       *
       * @private
      */
      emitMasterCategoryChange(newCat, oldCat) {
        return this.masterCategoryFn && this.masterCategoryFn(newCat, oldCat);
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

      get data() {
        return this._data;
      }

      set data(d) {
        this._data.name = d.name;

        this._data.note = d.note;

        const oldSort = this._data.sort;
        this._data.sort = d.sort;
        if (oldSort !== d.sort) {
          this.emitSortChange();
        }

        const oldMasterCategory = this._data.masterCategory;
        this._data.masterCategory = d.masterCategory;
        if (oldMasterCategory !== d.masterCategory) {
          this.emitMasterCategoryChange(d.masterCategory, oldMasterCategory);
        }
      }

      /**
       * The upper bound of alphabetically sorted Categories by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get startKey() {
        return `b_${budgetId}_category_`;
      }

      /**
       * The lower bound of alphabetically sorted Categories by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get endKey() {
        return this.startKey + '\uffff';
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
       * Used for detecting if a document's _id is a Category
       * in this budget.
       *
       * @param {string} _id - The document's _id
       * @returns {boolean} True if document _id is in the budget
       * as an category.
       */
      static contains(_id) {
        return _id > this.startKey && _id < this.endKey;
      }
    };

    return Category;
  };
});
