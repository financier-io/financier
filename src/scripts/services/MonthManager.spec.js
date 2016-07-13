describe('category', function() {
  let monthManager, MonthManager;

  beforeEach(module('financier'));

  beforeEach(inject(_monthManager_ => {
    monthManager = _monthManager_;
  }));

  it('is a function', () => {
    expect(typeof monthManager).toBe('function');
  });

  describe('Category class', () => {

    beforeEach(() => {
      MonthManager = monthManager('111-111-111-111');
    });

    describe('static properties', () => {
      describe('_diff', () => {
        it('0 for same date', () => {
          const date = new Date('1/1/16');

          expect(MonthManager._diff(date, date)).toBe(0);
        });

        it('1 for next month', () => {
          const first = new Date('1/1/16');
          const second = new Date('2/1/16');

          expect(MonthManager._diff(first, second)).toBe(1);
        });

        it('-1 for previous month', () => {
          const first = new Date('2/1/16');
          const second = new Date('1/1/16');

          expect(MonthManager._diff(first, second)).toBe(-1);
        });

        it('1 for 2/29 => 3/1', () => {
          const first = new Date('2/29/16');
          const second = new Date('3/1/16');

          expect(MonthManager._diff(first, second)).toBe(1);
        });

        it('26 for multiple years', () => {
          const first = new Date('1/1/16');
          const second = new Date('3/1/18');

          expect(MonthManager._diff(first, second)).toBe(26);
        });
      });

      describe('_dateIDToDate', () => {
        it('converts ID to date', () => {
          const date = MonthManager._dateIDToDate('2016-06-07');

          expect(date.getFullYear()).toBe(2016);
          expect(date.getMonth()).toBe(5); // June
          expect(date.getDate()).toBe(1);
        });
      });

      describe('_nextDateID', () => {
        it('Jul => Aug', () => {
          expect(MonthManager._nextDateID('2016-06-01')).toBe('2016-07-01');
        });

        it('Dec => Jan', () => {
          expect(MonthManager._nextDateID('2016-12-01')).toBe('2017-01-01');
        });
      });

      describe('_previousDateID', () => {
        it('Aug => Jul', () => {
          expect(MonthManager._previousDateID('2016-07-01')).toBe('2016-06-01');
        });

        it('Jan => Feb', () => {
          expect(MonthManager._previousDateID('2017-01-01')).toBe('2016-12-01');
        });
      });
    });
  });
});



// OLD TESTS FROM BUDGETDB BELOW FOR REFERENCE

// it('should provide Months until specified date', () => {
//   return db._pouch.bulkDocs([{
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('1/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('2/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('3/1/15'))
//   }]).then(res => {
//     return budget.budget.getFourMonthsFrom(new Date('6/1/15')).then(res => {
//       const expectedDates = [
//         '2015-01-01',
//         '2015-02-01',
//         '2015-03-01',
//         '2015-04-01',
//         '2015-05-01',
//         '2015-06-01',
//         '2015-07-01',
//         '2015-08-01',
//         '2015-09-01',
//         '2015-10-01',
//         '2015-11-01'
//       ];

//       expect(res.length).toBe(expectedDates.length);

//       for (var i = 0; i < res.length; i++) {
//         expect(res[i].data._id).toBe('b_555-555-555-555_month_' + expectedDates[i]);
//       }
//     });
//   });
// });

// it('should provide Months before specified date', () => {
//   return db._pouch.bulkDocs([{
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('4/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('5/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('6/1/15'))
//   }]).then(res => {
//     return budget.budget.getFourMonthsFrom(new Date('1/1/15')).then(res => {
//       const expectedDates = [
//         '2015-01-01',
//         '2015-02-01',
//         '2015-03-01',
//         '2015-04-01',
//         '2015-05-01',
//         '2015-06-01'
//       ];

//       expect(res.length).toBe(expectedDates.length);

//       for (var i = 0; i < res.length; i++) {
//         expect(res[i].data._id).toBe('b_555-555-555-555_month_' + expectedDates[i]);
//       }

//     });
//   });
// });

// it('should provide existing if populating to that last month', () => {
//   return db._pouch.bulkDocs([{
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('1/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('2/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('3/1/15'))
//   }]).then(res => {
//     return budget.budget.getFourMonthsFrom(new Date('3/1/15')).then(res => {
//       const expectedDates = [
//         '2015-01-01',
//         '2015-02-01',
//         '2015-03-01',
//         '2015-04-01',
//         '2015-05-01',
//         '2015-06-01',
//         '2015-07-01',
//         '2015-08-01'
//       ];

//       expect(res.length).toBe(expectedDates.length);

//       for (var i = 0; i < res.length; i++) {
//         expect(res[i].data._id).toBe('b_555-555-555-555_month_' + expectedDates[i]);
//       }
//     });
//   });
// });

// it('should add that date if none exists in database', () => {
//   return budget.budget.getFourMonthsFrom(new Date('3/1/15')).then(res => {
//     const expectedDates = [
//       '2015-03-01',
//       '2015-04-01',
//       '2015-05-01',
//       '2015-06-01',
//       '2015-07-01',
//     ];

//     expect(res.length).toBe(expectedDates.length);

//     for (var i = 0; i < res.length; i++) {
//       expect(res[i].data._id).toBe('b_555-555-555-555_month_' + expectedDates[i]);
//     }
//   });
// });
