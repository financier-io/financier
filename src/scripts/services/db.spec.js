describe('db', function() {

  beforeEach(module('financier', dbProvider => {
    dbProvider.adapter = 'memory';
  }));

  let db;

  beforeEach(inject(_db_ => {
    db = _db_;
  }));

  it('should return an object', () => {
    expect(typeof db).toBe('object');
  });

  it('should provide budgets', (done) => {
    db.budgets.then(budgets => {
      expect(angular.isArray(budgets)).toBe(true);
      done(); 
    })
  });

  it('has budget function', () => {
    expect(typeof db.budget).toBe('function');
  });

  it('should return with object', (done) => {
    const d = new PouchDB('financier1', {
      adapter: 'memory'
    });

    const budgetDB = new PouchDB('financierer', {
      adapter: 'memory'
    });

    budgetDB.bulkDocs([{
      _id: '20150',
      categories: {}
    }, {
      _id: '20151',
      categories: {}
    }, {
      _id: '20152',
      categories: {}
    }]).then(res => {
      const arr = db.budget(budgetDB).then(arr => {
        console.log(arr[0].cache.total, arr[1].cache.total, arr[2].cache.total)
        arr[0].setBudget(123, 23);
        console.log(arr[0].cache[123].total, arr[1].cache[123].total, arr[2].cache[123].total)
        done();
      })
      
    })
  });

  // it('should return with object of functions', () => {
  //   expect(typeof db.budget('hello, world!').getMonth).toBe('function');
  //   expect(typeof db.budget('hello, world!').setMonth).toBe('function');
  // });

  // it('should allow creating Month', (done) => {
  //   const now = new Date();
  //   const date = `${now.getFullYear()}${now.getMonth()}`;

  //   db.budget('hello, world!').setMonth(date).then(res => {
  //     expect(res.constructor.name).toBe('Month');
  //     done()
  //   }).catch(err => {
  //     done(new Error('Promise should not be rejected', err));
  //   })
  // });

  // it('should allow retrieving a Month', (done) => {
  //   const now = new Date();
  //   const date = `${now.getFullYear()}${now.getMonth()}`;

  //   db.budget('hello, world!').getMonth(date, {
  //     category: {}
  //   }).then(res => {
  //     expect(res.constructor.name).toBe('Month');
  //     done()
  //   }).catch(err => {
  //     done(new Error('Promise should not be rejected', err));
  //   })
  // });

});