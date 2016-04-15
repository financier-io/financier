angular.module('financier').factory('monthManager', month => {
  return budgetId => {

    const Month = month(budgetId);

    return class MonthManager {
      // Months need to be ordered
      // Seriously, else it'll be broke af
      constructor(months, saveFn) {
        if (months.length === 0) {
          // my first time, be gentle

          months.push(new Month(Month.createID(new Date()), saveFn));
        }

        months = this.fillMonthGaps(months);

        for (let i = 0; i < months.length; i++) {
          const month = months[i];

          month.subscribeTransactionDateChange(this.subscribeTransactionDateChangeFn);

          if (months[i + 1]) {
            this.linkMonths(months[i], months[i + 1]);
          }
        }

        this.months = months;
        this.saveFn = saveFn;
      }

      addTransaction(trans) {
        const month = this.getMonth(trans.date);

        trans.subscribeRemove(() => {
          month.removeTransaction(tran);
        });

        month.addTransaction(trans);
      }

      addMonthCategory(monthCat) {
        this.getMonth(MonthManager.dateIDToDate(monthCat.monthId)).setBudget(monthCat);
      }

      subscribeTransactionDateChangeFn(trans) {
        // move the transaction to a new month, if needed

        // if the transaction's new date is not in the current month
        if (month.date.getMonth() !== trans.date.getMonth() ||
            month.date.getFullYear() !== trans.date.getFullYear()) {
          // remove the transaction from the month, and then
          month.removeTransaction(trans);

          // find the month that the transaction should belong to
          const newMonth = this.getMonth(trans.date);

          // and add it to that month
          newMonth.addTransaction(trans);
        }

        // else, do nothing -- just a simple day of the month change

      }

      fillMonthGaps(months) {
        // This function needs to fill gaps of months
        // We can already assume the months are in order,
        // as promised by CouchDB/PouchDB

        if (months.length <= 1) {
          return months;
        }

        let endIndex = months.length - 1;
        for (var i = 0; i < endIndex; i++) {
          const startMonth = MonthManager.dateIDToDate(months[i].date);
          const endMonth = MonthManager.dateIDToDate(months[i + 1].date);
          const diff = MonthManager.diff(startMonth, endMonth);

          if (diff > 1) {
            const monthsToAdd = diff - 1;
            const newMonths = [];

            let id = MonthManager.nextDateID(months[i].date);

            for (let j = 0; j < monthsToAdd; j++) {
              const m = new Month(id, this.saveFn);
              month.subscribeTransactionDateChange(this.subscribeTransactionDateChangeFn);
              newMonths.push(m);

              id = MonthManager.nextDateID(id);
            }
            months.splice.apply(null, [i + 1, 0].concat(newMonths));

            i += monthsToAdd;
            endIndex += monthsToAdd;
          }
        }

        return months;
      }

      getMonth(date) {
        const diff = MonthManager.diff(MonthManager.dateIDToDate(this.months[0].date), date);

        if ((diff + 1) > this.months.length) {
          // we need to append months
          const monthsToAdd = (diff + 1) - this.months.length;

          let d = this.months[this.months.length - 1].date;

          for (let i = 0; i < monthsToAdd; i++) {
            d = MonthManager.nextDateID(d);

            const m = new Month(d, this.saveFn);
            m.subscribeTransactionDateChange(this.subscribeTransactionDateChangeFn);
            this.months.push(m);
            this.linkMonths(this.months[this.months.length - 2], this.months[this.months.length - 1]);
          }

          // this is the only case when we need to propagate rolling
          // prepended months will by definition not have any data rolling
          // into them, so we don't need to do this there
          this.propagateRollingFromMonth(this.months[(this.months.length - 1) - monthsToAdd]);

          return this.months[this.months.length - 1];
        }

        if (diff < 0) {
          // we need to prepend months
          const monthsToAdd = Math.abs(diff);

          let d = this.months[0].date;

          for (let i = 0; i < monthsToAdd; i++) {
            d = MonthManager.previousDateID(d);

            const m = new Month(d, this.saveFn);
            m.subscribeTransactionDateChange(this.subscribeTransactionDateChangeFn);
            this.months.unshift(m);
            this.linkMonths(this.months[0], this.months[1]);
          }
          return this.months[0];
          
        }

        // we already have the month
        return this.months[diff];
      }

      linkMonths(firstMonth, secondMonth) {
        firstMonth.subscribeNextMonth((catId, balance) => {
          secondMonth.setRolling(catId, balance);
        }, val => {
          secondMonth.changeAvailable(val);
        });
      }

      propagateRolling(categoryIds) {
        this.categoryIds = categoryIds;

        for (var i = 0; i < categoryIds.length; i++) {
          this.months[0].startRolling(categoryIds[i]);
        }
      }

      propagateRollingFromMonth(month) {
        // if categoryIds is not set,
        // we're probably going to call this.propagateRolling
        // in the future, so doing this is moot...
        if (this.categoryIds) {
          for (var i = 0; i < this.categoryIds.length; i++) {
            month.startRolling(this.categoryIds[i]);
          }
        }
      }

      static diff(d1, d2) {
        let months;

        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();

        return months;
      }

      static dateIDToDate(date) {
        const [year, month] = date.split('-');
        return new Date(year, month - 1, 1);
      }

      static nextDateID(date) {
        const [year, month] = date.split('-');
        return Month.createID(new Date(year, month, 1));
      }
      static previousDateID(date) {
        const [year, month] = date.split('-');
        return Month.createID(new Date(year, month - 2, 1));
      }
    };
  };
});
