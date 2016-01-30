describe("Unit Testing Examples", function() {

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

  it('should return with object', () => {
    const arr = db.budget('hello, world!');
    console.log(arr[0].cache.total, arr[1].cache.total, arr[2].cache.total)
    arr[0].setBudget(123, 23);
    console.log(arr[0].cache[123].total, arr[1].cache[123].total, arr[2].cache[123].total)
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