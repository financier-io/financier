angular.module('financier').factory('masterCategory', (category, uuid) => {
  return budgetId => {
    const Category = category(budgetId);

    return class MasterCategory extends Category {
      constructor(data) {
        if (!data._id) {
          data._id = `b_${budgetId}_masterCategory_${uuid()}`;
        }

        super(data);
      }

      toJSON() {
        const ret = super.toJSON();

        ret.categories = [];
          
        for (let i = 0; i < this._categories.length; i++) {
          ret.categories.push(this._categories[i]._id);
        }

        return ret;
        
      }

      updateCategories() {
        super.emitChange();
      }

      get categories() {
        return this._categories;
      }

      set categories(arr) {
        this._categories = arr;

        this._categories.update = () => {
          this.updateCategories();
        };
      }

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
  };
});
