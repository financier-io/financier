describe('month', function() {
  let month, Month, transaction, Transaction, MonthCategory;

  function defaultMonth() {
    return {
      _id: 'b_111-111-111-111_month_' + Month.createID(new Date('1/1/15'))
    };
  }

  beforeEach(module('financier'));

  beforeEach(inject((_month_, _transaction_, _MonthCategory_) => {
    month = _month_;
    transaction = _transaction_;
    MonthCategory = _MonthCategory_;
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

    it('should notify budgetChange upon budget update', () => {
      const mo = new Month(defaultMonth(), () => {});

      mo.budgetChange = () => {};
      spyOn(mo, 'budgetChange');

      mo.setBudget(123, 1200);

      expect(mo.budgetChange).toHaveBeenCalledWith(123, 1200);

      mo.setBudget(123, 1000);

      expect(mo.budgetChange).toHaveBeenCalledWith(123, -200);
    });

    it('should notify subscribeNextMonth upon rolling update', () => {
      const mo = new Month(defaultMonth(), () => {});

      mo.nextRollingFn = () => {};
      spyOn(mo, 'nextRollingFn');

      mo.setRolling(123, 1200);

      expect(mo.nextRollingFn).toHaveBeenCalledWith(123, 1200);

      mo.setRolling(123, 1000);

      expect(mo.nextRollingFn).toHaveBeenCalledWith(123, 1000);
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
          outflow: 0,
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
          outflow: 0,
          balance: 6900
        }
      });
    });

    describe('addBudget', () => {
      it('should be set on categories[]', () => {
        const mo = new Month(defaultMonth(), () => {}),
            cat = new MonthCategory.from(
              '111-111-111-111',
              mo.date,
              '333-333-333-333'
            );

        mo.addBudget(cat);

        expect(mo.categories['333-333-333-333']).toBe(cat);
      });

      it('subscribes to saveFn on Month', () => {
        const foo = {
          change: () => {},
        };

        spyOn(foo, 'change');

        const mo = new Month(defaultMonth(), foo.change),
            cat = new MonthCategory.from(
              '111-111-111-111',
              mo.date,
              '333-333-333-333'
            );

        mo.addBudget(cat);

        expect(foo.change).not.toHaveBeenCalled();

        cat._emitChange();

        expect(foo.change).toHaveBeenCalled();
      });

      it('should update categoryCache balance', () => {
        const foo = {
          change: () => {},
        };

        spyOn(foo, 'change');

        const mo = new Month(defaultMonth(), foo.change),
            cat = new MonthCategory({
              _id: 'b_111-111-111-111_m_category_2015-01-01_333-333-333-333',
              budget: 300
            });

        mo.addBudget(cat);

        expect(mo.categoryCache[cat.categoryId].balance).toBe(300);
      });

      it('should update totalBudget', () => {
        const foo = {
          change: () => {},
        };

        spyOn(foo, 'change');

        const mo = new Month(defaultMonth(), foo.change),
            cat = new MonthCategory({
              _id: 'b_111-111-111-111_m_category_2015-01-01_333-333-333-333',
              budget: 300
            });

        mo.addBudget(cat);

        expect(mo.cache.totalBudget).toBe(300);
      });

      it('should update totalBalance', () => {
        const foo = {
          change: () => {},
        };

        spyOn(foo, 'change');

        const mo = new Month(defaultMonth(), foo.change),
            cat = new MonthCategory({
              _id: 'b_111-111-111-111_m_category_2015-01-01_333-333-333-333',
              budget: 300
            });

        mo.addBudget(cat);

        expect(mo.cache.totalBalance).toBe(300);
      });

      it('should update totalAvailable', () => {
        const foo = {
          change: () => {},
        };

        spyOn(foo, 'change');

        const mo = new Month(defaultMonth(), foo.change),
            cat = new MonthCategory({
              _id: 'b_111-111-111-111_m_category_2015-01-01_333-333-333-333',
              budget: 300
            });

        mo.addBudget(cat);

        expect(mo.cache.totalAvailable).toBe(-300);
      });

      it('should call nextChangeAvailableFn with negative budget', () => {
        const mo = new Month(defaultMonth()),
            cat = new MonthCategory({
              _id: 'b_111-111-111-111_m_category_2015-01-01_333-333-333-333',
              budget: 300
            });

        mo.nextChangeAvailableFn = () => {};
        spyOn(mo, 'nextChangeAvailableFn');

        mo.addBudget(cat);

        expect(mo.nextChangeAvailableFn).toHaveBeenCalledWith(-300);
      });

      it('should call saveFn when MonthCategory changes', () => {
        const foo = {
          saveFn: () => {},
        };

        spyOn(foo, 'saveFn');

        const mo = new Month(defaultMonth(), foo.saveFn),
            cat = new MonthCategory({
              _id: 'b_111-111-111-111_m_category_2015-01-01_333-333-333-333',
              budget: 300
            });

        mo.addBudget(cat);

        expect(foo.saveFn).not.toHaveBeenCalled();

        cat.budget = 200;

        expect(foo.saveFn).toHaveBeenCalled();
      });

      it('should call budgetChange properly', () => {
        const mo = new Month(defaultMonth(), () => {}),
            cat = new MonthCategory({
              _id: 'b_111-111-111-111_m_category_2015-01-01_333-333-333-333',
              budget: 300
            });

        spyOn(mo, 'budgetChange');

        mo.addBudget(cat);

        expect(mo.budgetChange).not.toHaveBeenCalled();

        cat.budget = 200;

        expect(mo.budgetChange).toHaveBeenCalledWith('333-333-333-333', -100);
      });

      describe('_changeCurrentOverspent', () => {
        it('>= 0 current budget', () => {
          const mo = new Month(defaultMonth(), () => {}),
              cat = new MonthCategory({
                _id: 'b_111-111-111-111_m_category_2015-01-01_333-333-333-333',
                budget: 300
              });

          spyOn(mo, '_changeCurrentOverspent');

          mo.addBudget(cat);

          expect(mo._changeCurrentOverspent).toHaveBeenCalledWith(-0);
        });

        it('< 0 current budget', () => {
          const mo = new Month(defaultMonth(), () => {}),
              cat = new MonthCategory({
                _id: 'b_111-111-111-111_m_category_2015-01-01_333-333-333-333',
                budget: -300
              });

          spyOn(mo, '_changeCurrentOverspent');

          mo.addBudget(cat);

          expect(mo._changeCurrentOverspent).toHaveBeenCalledWith(300);
        });
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
    });

    describe('addTransaction', () => {
      it('adjusts balance when added', () => {
        const mo = new Month(defaultMonth(), () => {}),
          trans = new Transaction({
            value: -300,
            category: '123-123-123-123'
          });

        mo.addTransaction(trans);

        expect(mo.categoryCache['123-123-123-123'].balance).toBe(-300);
      });

      it('adjusts outflow when added', () => {
        const mo = new Month(defaultMonth(), () => {}),
          trans = new Transaction({
            value: -300,
            category: '123-123-123-123'
          });

        mo.addTransaction(trans);

        expect(mo.categoryCache['123-123-123-123'].outflow).toBe(-300);
      });
    });

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

    describe('budgetChange', () => {
      it('should update totalBudget', () => {
          const mo = new Month(defaultMonth());

          mo.createCategoryCacheIfEmpty('333-333-333-333');

          mo.budgetChange('333-333-333-333', 100);

          expect(mo.cache.totalBudget).toBe(100);
      });

      it('should update totalAvailable', () => {
          const mo = new Month(defaultMonth());

          mo.createCategoryCacheIfEmpty('333-333-333-333');

          mo.budgetChange('333-333-333-333', -100);

          expect(mo.cache.totalAvailable).toBe(100);
      });

      it('should call nextChangeAvailableFn properly', () => {
          const mo = new Month(defaultMonth());

          mo.createCategoryCacheIfEmpty('333-333-333-333');

          mo.nextChangeAvailableFn = () => {};
          spyOn(mo, 'nextChangeAvailableFn');

          mo.budgetChange('333-333-333-333', -100);

          expect(mo.nextChangeAvailableFn).toHaveBeenCalledWith(100);
      });

      it('should update categoryCache balance', () => {
          const mo = new Month(defaultMonth());

          mo.createCategoryCacheIfEmpty('333-333-333-333');

          mo.budgetChange('333-333-333-333', 100);

          expect(mo.categoryCache['333-333-333-333'].balance).toBe(100);
      });

      describe('_changeCurrentOverspent', () => {
        it('>= 0 budget', () => {
          const mo = new Month(defaultMonth(), () => {});

          mo.createCategoryCacheIfEmpty('333-333-333-333');

          spyOn(mo, '_changeCurrentOverspent');

          mo.budgetChange('333-333-333-333', 50);

          expect(mo._changeCurrentOverspent).toHaveBeenCalledWith(0);
        });

        it('< 0 budget', () => {
          const mo = new Month(defaultMonth(), () => {});

          mo.createCategoryCacheIfEmpty('333-333-333-333');

          spyOn(mo, '_changeCurrentOverspent');

          mo.budgetChange('333-333-333-333', -50);

          expect(mo._changeCurrentOverspent).toHaveBeenCalledWith(50);
        });
      });

      it('should update totalBalance', () => {
        const mo = new Month(defaultMonth());

        mo.createCategoryCacheIfEmpty('333-333-333-333');

        mo.budgetChange('333-333-333-333', 150);

        expect(mo.cache.totalBalance).toBe(150);
      });
    });

    describe('changeAvailable', () => {
      it('should update totalAvailable', () => {
        const mo = new Month(defaultMonth());

        mo.changeAvailable(500);

        expect(mo.cache.totalAvailable).toBe(500);
      });

      it('should call nextChangeAvailableFn properly', () => {
        const mo = new Month(defaultMonth());

        mo.nextChangeAvailableFn = () => {};
        spyOn(mo, 'nextChangeAvailableFn');

        expect(mo.nextChangeAvailableFn).not.toHaveBeenCalled();

        mo.changeAvailable(500);

        expect(mo.nextChangeAvailableFn).toHaveBeenCalledWith(500);
      });
    });

    describe('_changeCurrentOverspent', () => {

      it('should update totalOverspent', () => {
        const mo = new Month(defaultMonth());

        mo._changeCurrentOverspent(500);

        expect(mo.cache.totalOverspent).toBe(500);
      });

      it('should call nextChangeOverspentFn properly', () => {
        const mo = new Month(defaultMonth());

        mo.nextChangeOverspentFn = () => {};
        spyOn(mo, 'nextChangeOverspentFn');

        expect(mo.nextChangeOverspentFn).not.toHaveBeenCalled();

        mo._changeCurrentOverspent(500);

        expect(mo.nextChangeOverspentFn).toHaveBeenCalledWith(500);
      });
    });

    describe('changeOverspent', () => {

      it('should update totalOverspent', () => {
        const mo = new Month(defaultMonth());

        mo.changeOverspent(500);

        expect(mo.cache.totalOverspentLastMonth).toBe(500);
      });

      it('should call changeAvailable properly', () => {
        const mo = new Month(defaultMonth());

        mo.changeAvailable = () => {};
        spyOn(mo, 'changeAvailable');

        expect(mo.changeAvailable).not.toHaveBeenCalled();

        mo.changeOverspent(500);

        expect(mo.changeAvailable).toHaveBeenCalledWith(-500);
      });
    });
  });
});
