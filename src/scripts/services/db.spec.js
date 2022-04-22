// import PouchDB from 'PouchDB';
// PouchDB.plugin(require('pouchdb-adapter-memory'));

describe("db", function () {
  // jest complains on empty spec file
  test("mocks", () => {
    expect(true).toBe(true);
  });
});
//   let db, Budget;

//   beforeEach(angular.mock.module('financier', dbProvider => {
//     dbProvider.adapter = 'memory';

//   }));

//   beforeEach(inject((_db_, _Budget_) => {
//     db = _db_;
//     Budget = _Budget_;
//   }));

//   it('should return an object', () => {
//     expect(typeof db).toBe('object');
//   });

//   describe('budgets', () => {
//     it('should return an object', () => {
//       expect(typeof db.budgets).toBe('object');
//     });

//     it('all() should return empty array', done => {
//       db.budgets.all().then(res => {
//         expect(Array.isArray(res)).toBe(true);

//         expect(res.length).toBe(0);

//         done();
//       });
//     });

//     it('all() should return budgets', done => {
//       db._pouch.bulkDocs([{
//         _id: 'budget_1234'
//       }, {
//         _id: 'budget_2345'
//       }]).then(res => {
//         db.budgets.all().then(res => {

//           expect(res[0].constructor.name).toBe('Budget');
//           expect(res[0]._id).toBe('budget_1234');
//           expect(res[1]._id).toBe('budget_2345');

//           done();
//         });
//       });
//     });

//     it('put() should add budget', done => {
//       const b = new Budget();

//       db.budgets.put(b).then(() => {
//         db._pouch.allDocs({
//           include_docs: true,
//           startkey: 'budget_',
//           endkey: 'budget_\uffff'
//         }).then(res => {
//           expect(res.rows[0].id).toBe(b._id);
//           expect(angular.equals(res.rows[0], b.toJSON()));

//           done();
//         });
//       });
//     });
//   });

// });
