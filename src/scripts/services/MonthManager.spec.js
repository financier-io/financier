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
