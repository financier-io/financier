angular.module('financier').factory('Month', () => {
  return class Month {
    const that = this;

    constructor({date, db, data}) {
      this.date = date;
      this.db = db;
      this.data = data;
    }

    this.setRolling = (catId, rolling) => {

    }

    this.addTransaction = transaction => {
      calcTotal();
      next.setRolling();
    }

    this.removeTransaction = transaction => {
      calcTotal();
      next.setRolling();
    }
  }
})