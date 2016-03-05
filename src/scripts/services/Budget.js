angular.module('financier').factory('Budget', uuid => {
  return class Budget {
    constructor(data) {
      this.data = angular.merge({
        hints: {
          outflow: true
        },
        _id: `budget_` + uuid(),
        created: new Date().toUTCString()
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
    }

    get hints() {
      return this._hints;
    }

    get name() {
      return this.data.name;
    }

    set name(n) {
      this.data.name = n;
      this.emitChange();
    }

    get created() {
      return new Date(this.data.created);
    }

    subscribe(fn) {
      this.fn = fn;
    }

    emitChange() {
      return this.fn && this.fn(this);
    }

    get _id() {
      return this.data._id;
    }

    set _rev(r) {
      this.data._rev = r;
    }

    toJSON() {
      return this.data;
    }
  };
});
