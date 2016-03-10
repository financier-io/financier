angular.module('financier').factory('BudgetValue', uuid => {
  return class BudgetValue {
    constructor(data) {
      if (!data._id) {
        throw new Error(`
          Needs _id!
          To generate a new BudgetValue, use
          BudgetValue.from()
        `);
      }
      const myData = angular.extend({
        value: 0
      }, data);

      this.data = myData;

    }

    static id(budgetId, monthId, categoryId) {
      return `b_${budgetId}_m_${monthId}_budget-value_${categoryId}`;
    }

    get value() {
      return this.data.value;
    }

    set value(v) {
      this.data.value = v;
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
