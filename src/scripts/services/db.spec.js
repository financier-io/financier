describe('db', function() {
  let db, Month;

  beforeEach(module('financier', dbProvider => {
    dbProvider.adapter = 'memory';
  }));

  beforeEach(inject((_db_, _Month_) => {
    db = _db_;
    Month = _Month_;
  }));

  afterEach((done) => {
    db._pouch.destroy()
    .then(() => {
      done();
    });
  });


  it('should return an object', () => {
    expect(typeof db).toBe('object');
  });

  describe('budget', () => {
    it('should return an object', () => {
      expect(typeof db.budget).toBe('object');
    });
    
    it('should return with object', (done) => {
      db._pouch.bulkDocs([{
        _id: 'month_' + Month.createID(new Date('1/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('2/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('3/1/15'))
      }]).then(res => {
        const arr = db.budget.all().then(arr => {
          expect(arr.length).toBe(3);

          done();
        });
      });
    });

    it('should return with object', (done) => {
      db._pouch.bulkDocs([{
        _id: 'month_' + Month.createID(new Date('1/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('2/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('3/1/15'))
      }]).then(res => {
        const arr = db.budget.all().then(arr => {
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
      db._pouch.bulkDocs([{
        _id: 'month_' + Month.createID(new Date('1/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('2/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('3/1/15'))
      }]).then(res => {
        const arr = db.budget.all().then(arr => {
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
      db._pouch.bulkDocs([{
        _id: 'month_' + Month.createID(new Date('1/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('2/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('3/1/15'))
      }]).then(res => {
        db.budget.getFourMonthsFrom(new Date('6/1/15')).then(res => {
          const expectedDates = [
            '2015-01-01',
            '2015-02-01',
            '2015-03-01',
            '2015-04-01',
            '2015-05-01',
            '2015-06-01',
            '2015-07-01',
            '2015-08-01',
            '2015-09-01',
            '2015-10-01',
            '2015-11-01'
          ];

          expect(res.length).toBe(expectedDates.length);

          for (var i = 0; i < res.length; i++) {
            expect(res[i].data._id).toBe('month_' + expectedDates[i]);
          }

          done();
        });
      });
    });

    it('should provide Months before specified date', (done) => {
      db._pouch.bulkDocs([{
        _id: 'month_' + Month.createID(new Date('4/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('5/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('6/1/15'))
      }]).then(res => {
        db.budget.getFourMonthsFrom(new Date('1/1/15')).then(res => {
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
            expect(res[i].data._id).toBe('month_' + expectedDates[i]);
          }

          done();
        });
      });
    });

    it('should provide existing if populating to that last month', (done) => {
      db._pouch.bulkDocs([{
        _id: 'month_' + Month.createID(new Date('1/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('2/1/15'))
      }, {
        _id: 'month_' + Month.createID(new Date('3/1/15'))
      }]).then(res => {
        db.budget.getFourMonthsFrom(new Date('3/1/15')).then(res => {
          const expectedDates = [
            '2015-01-01',
            '2015-02-01',
            '2015-03-01',
            '2015-04-01',
            '2015-05-01',
            '2015-06-01',
            '2015-07-01',
            '2015-08-01'
          ];

          expect(res.length).toBe(expectedDates.length);

          for (var i = 0; i < res.length; i++) {
            expect(res[i].data._id).toBe('month_' + expectedDates[i]);
          }

          done();
        });
      });
    });

    it('should add that date if none exists in database', (done) => {
      db.budget.getFourMonthsFrom(new Date('3/1/15')).then(res => {
        const expectedDates = [
          '2015-03-01',
          '2015-04-01',
          '2015-05-01',
          '2015-06-01',
          '2015-07-01',
        ];

        expect(res.length).toBe(expectedDates.length);

        for (var i = 0; i < res.length; i++) {
          expect(res[i].data._id).toBe('month_' + expectedDates[i]);
        }

        done();
      });
    });
  });



  // it('propagateRolling should call startRolling on first Month', (done) => {
  //   db.budget.getFourMonthsFrom(new Date('3/1/15')).then(months => {
  //     db.categories.then(categories => {
  //       spyOn(months[0], 'startRolling').and.callThrough();

  //       bdg.propagateRolling(categories, months[0]);

  //       for (var i = 0; i < categories.length; i++) {
  //         expect(months[0].startRolling).toHaveBeenCalledWith(categories[i]._id);
  //       }

  //       done();
  //     });
  //   });
  // });
});
