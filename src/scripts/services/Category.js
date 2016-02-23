angular.module('financier').factory('Category', uuid => {
  return class Category {
    constructor(data = {
      name: 'New category'
    }) {
      // add _id if none exists
      if (!data._id) {
        data._id = 'category_' + uuid();
      }

      this.data = data;

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
});
