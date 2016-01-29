angular.module('financier').factory('Month', () => {
  return class Month {

    constructor(fn, data = {categories: {}}) {
      this.fn = fn;
      this.data = data;
    }

    // setRolling(catId, prevRolling) {
    //   createCategoryIfEmpty(catId);

    //   if (angular.isNumber(prevRolling)) {
    //     this.data.categories.catId.prevRolling = prevRolling;
    //   }

    //   let myRolling = this.prevRolling + this.data.categories.catId.budget;

    //   for (let i = 0; i < this.data.categories.catId.transactions.length; i++) {
    //     myRolling -= this.data.categories.catId.transactions[i].value;
    //   }

    //   this.data.categories.catId.rolling = myRolling;
    // }

    // setNextMonth(next) {
    //   this.next = next;
    // }

    // getRolling(catId) {
    //   if (!angular.isDefined(this.data.categories.catId)) {
    //     throw new Error('Have not calculated rolling value yet!')
    //   }
    //   return this.data.categories.catId.rolling;
    // }

    addTransaction(catId, transaction) {
      if (transaction.constructor.name !== 'Transaction') {
        throw new TypeError('Not passed a Transaction!');
      }

      this.createCategoryIfEmpty(catId);

      transaction.subscribe((newValue, oldValue) => {
        console.log(this.data.categories[catId].total, newValue, oldValue)
        this.data.categories[catId].total += (oldValue - newValue);

        this.fn && this.fn(catId, this.data.categories[catId].total);
      });

      this.data.categories[catId].transactions.push(transaction);

      this.data.categories[catId].total -= transaction.value;
      this.fn && this.fn(catId, this.data.categories[catId].total);
    }

    // removeTransaction(catId, transaction) {
    //   createCategoryIfEmpty(catId);

    //   const index = this.data.categories.catId.transactions.indexOf(transaction);

    //   if (index > -1) {
    //     this.data.categories.catId.transactions.splice(index, 1);
    //   }
    //   next && next.setRolling();
    // }

    createCategoryIfEmpty(catId) {
      if (!this.data.categories.catId) {
        this.data.categories[catId] = {
          rolling: 0,
          budget: 0,
          transactions: [],
          total: 0
        };
      }
    }

    toJSON() {
      return this.data;
    }
  }
})