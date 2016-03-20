angular.module('financier').factory('category', uuid => {
  return budgetId => {
    return class Category {
      constructor(data) {
        const myData = angular.extend({
          name: 'New category',
          _id: `b_${budgetId}_category_${uuid()}`
        }, data);

        this.id = myData._id.slice(myData._id.lastIndexOf('_') + 1);

        this.data = myData;

      }

      get name() {
        return this.data.name;
      }

      set name(n) {
        this.data.name = n;
        this.emitChange();
      }

      get note() {
        return this.data.note;
      }

      set note(n) {
        this.data.note = n;
        this.emitChange();
      }

      get _id() {
        return this.data._id;
      }

      remove() {
        this.data._deleted = true;
        return this.emitChange();
      }

      subscribe(fn) {
        this.fn = fn;
      }

      emitChange() {
        return this.fn && this.fn(this);
      }

      toJSON() {
        return this.data;
      }
    };
  };
});
