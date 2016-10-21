angular.module('financier').factory('payee', uuid => {
  return budgetId => {

    /**
     * Represents a payee
     */
    class Payee {

      /**
       * Create an Payee
       *
       * @param {object} [data] - The record object from the database
       * (with `_id` and `_rev`).
       */
      constructor(data) {
        const myData = angular.extend({
          name: null,
          autosuggest: true,
          internal: false,
          categorySuggest: null
        }, data);

        // add _id if none exists
        if (!myData._id) {
          myData._id = Payee.prefix + uuid();
        }

        /**
         * Get the non-namespaced payee UID.
         *
         * @example
         * const payee = new Payee();
         * payee.id; // === 'ab735ea6-bd56-449c-8f03-6afcc91e2248'
         *
         * @type {string}
        */
        this.id = myData._id.slice(myData._id.lastIndexOf('_') + 1);

        this.data = myData;
      }

      get constructorName() {
        return 'Payee';
      }

      /**
       * The name of the payee. When set, will immediately call subscribed function.
       *
       * @example
       * const payee = new Payee();
       * payee.name = 'Apple Computers';
       * console.log(payee.name); // 'Apple Computers'
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
       * If this is a "special" payee that should not be removable
       *
       * @type {boolean}
      */
      get internal() {
        return this.data.internal;
      }

      /**
       * Whether the payee is set to autosuggest
       *
       * @example
       * const payee = new Payee();
       * payee.name = 'Apple Computers';
       * console.log(payee.name); // 'Apple Computers'
       *
       * @type {boolean}
      */
      get autosuggest() {
        return this.data.autosuggest;
      }

      set autosuggest(n) {
        this.data.autosuggest = n;
        this.emitChange();
      }

      /**
       * A category ID last used with this payee
       *
       * @example
       * const payee = new Payee();
       * payee.categorySuggest = '123-123-123-123';
       * console.log(payee.categorySuggest); // '123-123-123-123'
       *
       * @type {boolean}
      */
      get categorySuggest() {
        return this.data.categorySuggest;
      }

      set categorySuggest(n) {
        if (this.data.categorySuggest !== n) {
          this.data.categorySuggest = n;
          this.emitChange();
        }
      }

      /**
       * Sets _deleted on the record and calls record subscriber.
      */
      remove() {
        if (this.internal) {
          throw new Error('Cannot remove internal payee!');
        }

        this.data._deleted = true;
        return this.emitChange();
      }

      get _id() {
        return this.data._id;
      }

      /**
       * Used to set the function to invoke upon record changes.
       *
       * @param {function} fn - This function will be invoked upon record
       * changes with the Payee object as the first parameter.
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
       * Will serialize the Payee object to
       * a JSON object for sending to the database.
       *
       * @returns {object}
      */
      toJSON() {
        return this.data;
      }

      /**
       * The upper bound of alphabetically sorted Payees by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get startKey() {
        return `b_${budgetId}_payee_`;
      }

      /**
       * The lower bound of alphabetically sorted Payees by ID. Used by PouchDB.
       *
       * @type {string}
       */
      static get endKey() {
        return this.startKey + '\uffff';
      }

      /**
       * The prefix for namespacing the Payee UID
       *
       * @type {string}
       */
      static get prefix() {
        return this.startKey;
      }

      /**
       * Used for detecting if a document's _id is a Payee
       * in this budget.
       *
       * @param {string} _id - The document's _id
       * @returns {boolean} True if document _id is in the budget
       * as a payee.
       */
      static contains(_id) {
        return _id > this.startKey && _id < this.endKey;
      }
    };

    return Payee;
    
  };

});
