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
          _id: `b_${budgetId}_category_${uuid()}`
        }, data);

        this.id = myData._id.slice(myData._id.lastIndexOf('_') + 1);

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
        return this.data.note;
      }

      set note(n) {
        this.data.note = n;
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
        return this.data._id;
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
       * Will serialize the Category object to
       * a JSON object for sending to the database.
       *
       * @returns {object}
      */
      toJSON() {
        return this.data;
      }
    };

    return Category;
  };
});
