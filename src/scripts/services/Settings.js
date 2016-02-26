angular.module('financier').factory('Settings', () => {
  return class Settings {
    constructor(data) {
      this.data = angular.merge({
        hints: {
          outflow: true
        },
        _id: 'settings'
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
