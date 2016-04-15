angular.module('financier').factory('MonthCategory', uuid => {
  return class MonthCategory {
    constructor(data) {
      if (!data._id) {
        throw new Error(`
          Needs _id!
          To generate a new MonthCategory, use
          MonthCategory.from()
        `);
      }
      const myData = angular.extend({
        budget: 0
      }, data);

      this.data = myData;

      const s = myData._id.split('_');
      this.categoryId = s[s.length - 1];
      this.monthId = s[s.length - 2];
    }

    static _fromId(budgetId, monthId, categoryId) {
      return `b_${budgetId}_m_category_${monthId}_${categoryId}`;
    }

    static from(budgetId, monthId, categoryId) {
      return new MonthCategory({
        _id: MonthCategory._fromId(budgetId, monthId, categoryId)
      });
    }

    get budget() {
      return this.data.budget;
    }

    set budget(v) {
      const old = this.data.budget;

      // do not re-update the database if the same
      if (v !== old) {
        this.data.budget = v;

        this.emitChange();
        this.emitBudgetChange(v, old);
      }
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

    subscribeBudget(fn) {
      this.budgetFn = fn;
    }

    emitChange() {
      return this.fn && this.fn(this);
    }

    emitBudgetChange(newVal, oldVal) {
      return this.budgetFn && this.budgetFn(newVal, oldVal);
    }

    toJSON() {
      return this.data;
    }

    static startKey(budgetId) {
      return `b_${budgetId}_m_category_`;
    }

    static endKey(budgetId) {
      return `b_${budgetId}_m_category_\uffff`;
    }
  };
});
