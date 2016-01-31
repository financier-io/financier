describe('db', function() {
  beforeEach(module('financier', dbProvider => {
    dbProvider.adapter = 'memory';
  }));

  let budgetDB;
  beforeEach(() => {
    budgetDB = new PouchDB('financierer', {
      adapter: 'memory'
    });
  });

  afterEach((done) => {
    budgetDB.destroy().then(() => {
      done();
    });
  });

  let db, Month;
  beforeEach(inject((_db_, _Month_) => {
    db = _db_;
    Month = _Month_;
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
    budgetDB.bulkDocs([{
      _id: Month.createID(new Date('1/1/15')),
      categories: {}
    }, {
      _id: Month.createID(new Date('2/1/15')),
      categories: {}
    }, {
      _id: Month.createID(new Date('3/1/15')),
      categories: {}
    }]).then(res => {
      const arr = db.budget(budgetDB).all().then(arr => {
        expect(arr.length).toBe(3);

        done();
      });
    });
  });

  it('should return with object', (done) => {
    budgetDB.bulkDocs([{
      _id: Month.createID(new Date('1/1/15')),
      categories: {}
    }, {
      _id: Month.createID(new Date('2/1/15')),
      categories: {}
    }, {
      _id: Month.createID(new Date('3/1/15')),
      categories: {}
    }]).then(res => {
      const arr = db.budget(budgetDB).all().then(arr => {
        expect(arr[0].cache[123]).toBeUndefined();
        expect(arr[1].cache[123]).toBeUndefined();
        expect(arr[2].cache[123]).toBeUndefined();

        arr[0].setBudget(123, 23);

        expect(arr[0].cache[123].total).toBe(23);
        expect(arr[1].cache[123].total).toBe(23);
        expect(arr[2].cache[123].total).toBe(23);

        done();
      });
    });
  });

  it('should update database', (done) => {
    budgetDB.bulkDocs([{
      _id: Month.createID(new Date('1/1/15')),
      categories: {}
    }, {
      _id: Month.createID(new Date('2/1/15')),
      categories: {}
    }, {
      _id: Month.createID(new Date('3/1/15')),
      categories: {}
    }]).then(res => {
      const arr = db.budget(budgetDB).all().then(arr => {
        arr[0].setBudget(123, 23).then(res => {
          expect(res.ok).toBe(true);
          done();
        }).catch(err => {
          done(err);
        })

      });
    });
  });

});