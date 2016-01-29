describe("Unit Testing Examples", function() {

  beforeEach(module('financier', dbProvider => {
    dbProvider.adapter = 'memory';
  }));

  let db;

  beforeEach(inject(_db_ => {
    db = _db_;
  }));

  // afterEach(() => {
  //   localStorage.clear();
  // })

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
    expect(typeof db.budget('hello, world!')).toBe('object');
  });

  it('should return with object of functions', () => {
    expect(typeof db.budget('hello, world!').getMonth).toBe('function');
    expect(typeof db.budget('hello, world!').setMonth).toBe('function');
  });

  it('should allow creating Month', (done) => {
    const now = new Date();
    const date = `${now.getFullYear()}${now.getMonth()}`;

    db.budget('hello, world!').setMonth(date).then(res => {
      expect(res.constructor.name).toBe('Month');
      done()
    }).catch(err => {
      done(new Error('Promise should not be rejected', err));
    })
  });

  it('should allow retrieving a Month', (done) => {
    const now = new Date();
    const date = `${now.getFullYear()}${now.getMonth()}`;

    db.budget('hello, world!').getMonth(date, {
      category: {}
    }).then(res => {
      expect(res.constructor.name).toBe('Month');
      done()
    }).catch(err => {
      done(new Error('Promise should not be rejected', err));
    })
  });



  // it('should create an empty entry in localStorage', () => {
  //   expect(localStorage.getItem('financier')).toBe('[]');
  // });

  // it('should add a budget to the array', () => {
  //   const budget = db('newBudget');
  //   expect(JSON.parse(localStorage.getItem('financier'))).toEqual(['newBudget']);
  // });

  // it('should not allow duplicates', () => {
  //   expect(() => db('newBudget')).not.toThrow();
  //   expect(() => db('newBudget')).toThrow();
  // });

  // it('should allow creating new Month', () => {
  //   expect(db('newBudget').newMonth(new Date())).toEqual({
  //     categories: {}
  //   });

  //   expect(JSON.parse(localStorage.getItem('financier01012016'))).toEqual({
  //     categories: {}
  //   });
  // });

  // it('should not allow creating a duplicate new Month', () => {
  //   expect(() => {
  //     db('newBudget').newMonth(new Date());
  //   }).not.toThrow();

  //   expect(() => {
  //     db('newBudget').newMonth(new Date());
  //   }).toThrow();
  // });
});