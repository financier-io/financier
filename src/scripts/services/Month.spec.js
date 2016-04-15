describe('month', function() {
  let month, Month, transaction, Transaction, Income;

  function defaultMonth() {
    return {
      _id: 'b_111-111-111-111_month_' + Month.createID(new Date('1/1/15'))
    };
  }

  beforeEach(module('financier'));

  beforeEach(inject((_month_, _transaction_, _Income_) => {
    month = _month_;
    transaction = _transaction_;
    Income = _Income_;
  }));

  describe('Month', () => {
    beforeEach(() => {
      Month = month('111-111-111-111');
      Transaction = transaction('111-111-111-111');
    });

    describe('static properties', () => {
      describe('createID', () => {
        it('converts date', () => {
          expect(Month.createID(new Date('12/12/15'))).toBe('2015-12-01');
        });

        it('converts date in two-digit form', () => {
          expect(Month.createID(new Date('1/1/15'))).toBe('2015-01-01');
        });
      });

      it('startKey', () => {
        expect(Month.startKey).toBe('b_111-111-111-111_month_');
      });

      it('endKey', () => {
        expect(Month.endKey).toBe('b_111-111-111-111_month_\uffff');
      });

      it('prefix', () => {
        expect(Month.prefix).toBe('b_111-111-111-111_month_');
      });
    });

    it('can take string', () => {
      var mo = new Month('2015-01-01');

      expect(angular.equals(mo.data, {
        _id: 'b_111-111-111-111_month_2015-01-01'
      })).toBe(true);
    });

    it('should be a Month', () => {
      const mo = new Month(defaultMonth());
      expect(mo.constructor.name).toBe('Month');
    });

    it('should serialize to JSON', () => {
      expect(JSON.stringify(new Month(defaultMonth()))).toBe('{"_id":"b_111-111-111-111_month_2015-01-01"}');
    });

    it('should properly extract date', () => {
      expect(new Month(defaultMonth()).date).toBe('2015-01-01');
    });

    it('can be removed', () => {
        const foo = {
          change: () => {},
        };

        spyOn(foo, 'change');

        const mo = new Month(defaultMonth());

        mo.subscribeRecordChanges(foo.change);

        expect(foo.change).not.toHaveBeenCalled();
        expect(mo.toJSON()._deleted).not.toBeDefined();

        mo.remove();

        expect(foo.change).toHaveBeenCalledWith(mo);
        expect(mo.toJSON()._deleted).toBe(true);
    });

    it('should notify subscribeNextMonth & subscribeRecordChanges upon budget update', () => {
      const foo = {
        subscribeNextMonth: () => {},
        subscribeRecordChanges: () => {}
      };

      spyOn(foo, 'subscribeNextMonth');
      spyOn(foo, 'subscribeRecordChanges');

      const mo = new Month(defaultMonth(), () => {});
      mo.subscribeNextMonth(foo.subscribeNextMonth);
      mo.subscribeRecordChanges(foo.subscribeRecordChanges);

      mo.setBudget(123, 1200);

      expect(foo.subscribeNextMonth).toHaveBeenCalledWith(123, 1200);
      expect(foo.subscribeRecordChanges).not.toHaveBeenCalledWith(mo);

      mo.setBudget(123, 1000);

      expect(foo.subscribeNextMonth).toHaveBeenCalledWith(123, 1000);
      expect(foo.subscribeRecordChanges).not.toHaveBeenCalledWith(mo);
    });

    it('should notify subscribeRecordChanges upon rolling update', () => {
      const foo = {
        subscribeNextMonth: () => {},
        subscribeRecordChanges: () => {}
      };

      spyOn(foo, 'subscribeNextMonth');
      spyOn(foo, 'subscribeRecordChanges');

      const mo = new Month(defaultMonth(), () => {});
      mo.subscribeNextMonth(foo.subscribeNextMonth);
      mo.subscribeRecordChanges(foo.subscribeRecordChanges);

      mo.setRolling(123, 1200);

      expect(foo.subscribeNextMonth).toHaveBeenCalledWith(123, 1200);
      expect(foo.subscribeRecordChanges).not.toHaveBeenCalled();

      mo.setRolling(123, 1000);

      expect(foo.subscribeNextMonth).toHaveBeenCalledWith(123, 1000);
      expect(foo.subscribeRecordChanges).not.toHaveBeenCalled();
    });

    it('should allow setting budget', () => {
      const mo = new Month(defaultMonth(), () => {});

      mo.setBudget(123, 1200);

      var data = JSON.parse(JSON.stringify(mo));
      var categoryCache = JSON.parse(JSON.stringify(mo.categoryCache));

      expect(data).toEqual({
        _id: 'b_111-111-111-111_month_2015-01-01'
      });

      expect(categoryCache).toEqual({
        123: {
          rolling: 0,
          balance: 1200
        }
      });

      expect(mo.categories['123'].budget).toBe(1200);
    });

    it('can set a rolling (incoming) value', () => {
      const mo = new Month(defaultMonth());

      mo.setRolling(123, 6900);

      var data = JSON.parse(JSON.stringify(mo));
      var categoryCache = JSON.parse(JSON.stringify(mo.categoryCache));

      expect(data).toEqual({
        _id: 'b_111-111-111-111_month_2015-01-01'
      });

      expect(categoryCache).toEqual({
        123: {
          rolling: 6900,
          balance: 6900
        }
      });
    });

    describe('totals', () => {
      it('totalBudget should update on setBudget', () => {
        const mo = new Month(defaultMonth(), () => {});

        mo.setBudget(123, 5000);

        expect(mo.cache.totalBudget).toBe(5000);

        mo.setBudget(124, 1000);

        expect(mo.cache.totalBudget).toBe(6000);
      });

      describe('totalBalance', () => {
        it('totalBalance should update on setRolling', () => {
          const mo = new Month(defaultMonth());

          mo.setRolling(123, 5000);

          expect(mo.cache.totalBalance).toBe(5000);

          mo.setRolling(124, 1000);

          expect(mo.cache.totalBalance).toBe(6000);
        });

        it('totalBalance should update on setBudget', () => {
          const mo = new Month(defaultMonth(), () => {});

          mo.setBudget(123, 5000);

          expect(mo.cache.totalBalance).toBe(5000);

          mo.setBudget(124, 1000);

          expect(mo.cache.totalBalance).toBe(6000);
        });
      });

      describe('totalAvailable', () => {
        // it('runs on existing data', () => {
        //   const mo = new Month({
        //     categories: {
        //       123: {
        //         budget: 1234,
        //         transactions: [{
        //           value: 222
        //         }]
        //       }
        //     },
        //     income: [{
        //       value: 10000
        //     }],
        //     _id: Month.createID(new Date('1/1/15'))
        //   });

        //   // prevMo.totalAvailable - |prevMo.totalBalance| + totalIncome - totalBudgeted
        //   expect(mo.cache.totalAvailable).toBe(10000 - 1234);
        // });

        // it('propagates to following months', () => {
        //   const foo = { bar: () => {}};

        //   const mo = new Month({
        //     categories: {
        //       123: {
        //         budget: 1234,
        //         transactions: [{
        //           value: 222
        //         }]
        //       }
        //     },
        //     income: [{
        //       value: 10000
        //     }],
        //     _id: Month.createID(new Date('1/1/15'))
        //   });

        //   spyOn(foo, 'bar');

        //   mo.subscribeNextMonth(
        //     () => {},
        //     foo.bar
        //   );


        //   expect(foo.bar).toHaveBeenCalledWith(10000 - 1234);
        // });
      });
    });
    // describe('totalRolling', () => {
    
    //   it('runs on existing data', () => {
    //     const mo = new Month({
    //       categories: {
    //         123: {
    //           budget: 333
    //         }
    //       },
    //       _id: Month.createID(new Date('1/1/15'))
    //     });

    //     spyOn(mo, 'setRolling').and.callThrough();

    //     mo.startRolling(123);

    //     expect(mo.setRolling).toHaveBeenCalledWith(123, 0);
    //     expect(mo.cache.totalBalance).toBe(333);
    //   });

    // })

    // describe('importing data', () => {
    //   it('transforms transactions', () => {
    //     const mo = new Month({
    //       categories: {
    //         123: {
    //           transactions: [{
    //             value: 12
    //           }],
    //           budget: 12
    //         }
    //       },
    //       _id: Month.createID(new Date('1/1/15'))
    //     });
        
    //     expect(mo.data.categories[123].transactions[0].constructor.name).toBe('Transaction');
    //   });

    //   it('adds up category balance', () => {
    //     const mo = new Month({
    //       categories: {
    //         123: {
    //           transactions: [{
    //             value: 12
    //           }, {
    //             value: 20
    //           }]
    //         }
    //       },
    //       _id: Month.createID(new Date('1/1/15'))
    //     });

    //     expect(mo.categoryCache[123].balance).toBe(-32);

    //     expect(mo.cache.totalBalance).toBe(-32);
    //   });

    //   it('adds up category budgets', () => {
    //     const mo = new Month({
    //       categories: {
    //         123: {
    //           budget: 12
    //         }
    //       },
    //       _id: Month.createID(new Date('1/1/15'))
    //     });

    //     expect(mo.categoryCache[123].balance).toBe(12);

    //     expect(mo.cache.totalBalance).toBe(12);
    //   });
    // });
    
    describe('startRolling', () => {
      it('runs on existing data', () => {
        const mo = new Month({
          _id: Month.createID(new Date('1/1/15'))
        }, () => {});

        mo.setBudget('123', 333);

        spyOn(mo, 'setRolling').and.callThrough();

        mo.startRolling(123);

        expect(mo.setRolling).toHaveBeenCalledWith(123, 0);
        expect(mo.cache.totalBalance).toBe(333);
      });
    });

  //   describe('income', () => {
  //     it('#addIncome', () => {
  //       const obj = { mock: () => {} };

  //       spyOn(obj, 'mock');

  //       const mo = new Month({
  //         _id: Month.createID(new Date('1/1/15'))
  //       });
  //       const income = new Transaction({ value: 20 });

  //       mo.subscribeRecordChanges(obj.mock);

  //       mo.addIncome(income);

  //       expect(mo.data.income).toEqual([income]);
  //       expect(obj.mock).toHaveBeenCalledWith(mo);
  //       expect(mo.cache.totalIncome).toBe(20);
  //     });

  //     it('changing income', () => {
  //       const mo = new Month({
  //         _id: Month.createID(new Date('1/1/15'))
  //       });
  //       const income = new Transaction({ value: 20 });
  //       mo.addIncome(income);

  //       const obj = { mock: () => {} };
  //       spyOn(obj, 'mock');
  //       mo.subscribeRecordChanges(obj.mock);

  //       expect(obj.mock).not.toHaveBeenCalledWith(mo);

  //       income.value = 40;

  //       expect(obj.mock).toHaveBeenCalledWith(mo);
  //       expect(mo.cache.totalIncome).toBe(40);
  //     });

  //     it('#removeIncome', () => {
  //       const mo = new Month({
  //         _id: Month.createID(new Date('1/1/15'))
  //       });
  //       const income = new Transaction({ value: 20 });
  //       mo.addIncome(income);

  //       const obj = { mock: () => {} };
  //       spyOn(obj, 'mock');
  //       mo.subscribeRecordChanges(obj.mock);

  //       mo.removeIncome(income);

  //       expect(mo.data.income).toEqual([]);
  //       expect(obj.mock).toHaveBeenCalledWith(mo);
  //       expect(mo.cache.totalIncome).toBe(0);
  //     });

  //     it('existing income', () => {
  //       const mo = new Month({
  //         _id: Month.createID(new Date('1/1/15')),
  //         income: [{
  //           value: 10
  //         }, {
  //           value: 20
  //         }]
  //       });

  //       expect(mo.cache.totalIncome).toBe(30);
  //     });
  //   });
  });
});
