angular.module('financier').factory('masterCategory', (category, uuid) => {
  return budgetId => {
    const Category = category(budgetId);

    /**
     * Represents a MasterCategory (contains Category[])
     *
     * @extends Category
     */
    class MasterCategory extends Category {

      /**
       * Create a MasterCategory
       *
       * @param {object} [data] - The record object from the database
       */
      constructor(data = {}) {
        if (!data._id) {
          data._id = `b_${budgetId}_masterCategory_${uuid()}`;
        }

        super(data);

        this._categories = [];
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
        const ret = super.toJSON();

        ret.categories = [];
          
        for (let i = 0; i < this._categories.length; i++) {
          ret.categories.push(this._categories[i]._id);
        }

        return ret;
        
      }

      /**
       * Will call subscriber function.
       *
       * @private
       */
      _updateCategories() {
        super.emitChange();
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
        this._categories = arr;

        // Hack below
        this._categories.update = () => {
          this._updateCategories();
        };
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
          super.emitChange();
        }
      }
    };

    return MasterCategory;
  };
});
