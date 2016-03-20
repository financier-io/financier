angular.module('financier').factory('Budget', uuid => {
  return class Budget {
    constructor(data) {
      this.data = angular.merge({
        hints: {
          outflow: true
        },
        _id: `budget_` + uuid(),
        created: new Date().toISOString()
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

    get lastMonthOpenedId() {
      return this.data.lastMonthOpenedId;
    }

    set lastMonthOpenedId(id) {
      this.data.lastMonthOpenedId = id;
      this.emitChange();
    }

    get created() {
      return new Date(this.data.created);
    }

    remove() {
      this.data._deleted = true;
      return this.emitChange();
    }

    // call this when you've actually 'opened'
    // the budget (to show 'last opened on')
    open() {
      this.data.opened = new Date().toISOString();
      return this.emitChange();
    }

    get opened() {
      if (!this._opened && this.data.opened) {
        this._opened = new Date(this.data.opened);
      }

      return this._opened;
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

    get id() {
      return this.data._id.slice(this.data._id.lastIndexOf('_') + 1);
    }

    set _rev(r) {
      this.data._rev = r;
    }

    toJSON() {
      return this.data;
    }
  };
});
