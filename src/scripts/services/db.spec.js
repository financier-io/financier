describe('db', function() {
  beforeEach(module('financier', dbProvider => {
    dbProvider.adapter = 'memory';
  }));

  let budgetDB, categoriesDB;
  beforeEach(() => {
    budgetDB = new PouchDB('financierer', {
      adapter: 'memory'
    });
    categoriesDB = new PouchDB('financierercats', {
      adapter: 'memory'
    });
  });

  afterEach((done) => {
    budgetDB.destroy()
    .then(() => {
      return categoriesDB.destroy();
    })
    .then(() => {
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
    });
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
        expect(arr[0].categoryCache[123]).toBeUndefined();
        expect(arr[1].categoryCache[123]).toBeUndefined();
        expect(arr[2].categoryCache[123]).toBeUndefined();

        arr[0].setBudget(123, 23);

        expect(arr[0].categoryCache[123].balance).toBe(23);
        expect(arr[1].categoryCache[123].balance).toBe(23);
        expect(arr[2].categoryCache[123].balance).toBe(23);

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
        });

      });
    });
  });

  it('should provide Months until specified date', (done) => {
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
      db.budget(budgetDB).allUntil(new Date('6/1/15')).then(res => {
        const expectedDates = [
          '2015-01-01',
          '2015-02-01',
          '2015-03-01',
          '2015-04-01',
          '2015-05-01',
          '2015-06-01'
        ];

        expect(res.length).toBe(expectedDates.length);

        for (var i = 0; i < res.length; i++) {
          expect(res[i].data._id).toBe(expectedDates[i]);
        }

        done();
      });
    });
  });

  it('should provide existing if populating to that last month', (done) => {
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
      db.budget(budgetDB).allUntil(new Date('3/1/15')).then(res => {
        const expectedDates = [
          '2015-01-01',
          '2015-02-01',
          '2015-03-01'
        ];

        expect(res.length).toBe(expectedDates.length);

        for (var i = 0; i < res.length; i++) {
          expect(res[i].data._id).toBe(expectedDates[i]);
        }

        done();
      });
    });
  });

  it('should add that date (and two moew) if none exist in database', (done) => {
    db.budget(budgetDB).allUntil(new Date('3/1/15')).then(res => {
      const expectedDates = [
        '2015-03-01',
        '2015-04-01',
        '2015-05-01'
      ];

      expect(res.length).toBe(expectedDates.length);

      for (var i = 0; i < res.length; i++) {
        expect(res[i].data._id).toBe(expectedDates[i]);
      }

      done();
    });
  });

  it('propagateRolling should call startRolling on first Month', (done) => {
    const bdg = db.budget(budgetDB);

    bdg.allUntil(new Date('3/1/15')).then(months => {
      db.categories(categoriesDB).then(categories => {
        spyOn(months[0], 'startRolling').and.callThrough();

        bdg.propagateRolling(categories, months[0]);

        for (var i = 0; i < categories.length; i++) {
          expect(months[0].startRolling).toHaveBeenCalledWith(categories[i]._id);
        }

        done();
      });
    });
  });
});
