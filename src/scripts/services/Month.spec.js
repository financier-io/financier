describe("Month", function() {
  let Month, Transaction;

  function defaultMonth() {
    return {
      categories: {},
      _id: Month.createID(new Date('1/1/15'))
    };
  }

  beforeEach(module('financier'));

  beforeEach(inject((_Month_, _Transaction_) => {
    Month = _Month_;
    Transaction = _Transaction_;
  }));

  describe('static properties', () => {
    describe('createID', () => {
      it('converts date', () => {
        expect(Month.createID(new Date('12/12/15'))).toBe('2015-12-01');
      });

      it('converts date in two-digit form', () => {
        expect(Month.createID(new Date('1/1/15'))).toBe('2015-01-01');
      });
    });
  });

  it('throws if not passed Date', () => {
    expect(() => new Month('boom')).toThrowError(TypeError, 'date is not Date!');
  });

  it('should be a Month', () => {
    const mo = new Month(defaultMonth());
    expect(mo.constructor.name).toBe('Month');
  });

  it('should serialize to JSON', () => {
    expect(JSON.stringify(new Month(defaultMonth()))).toBe('{"categories":{},"_id":"2015-01-01"}');
  });

  it('should add a transaction', () => {
    const mo = new Month(defaultMonth());
    const tr = new Transaction({value: 1233});

    mo.addTransaction(123, tr);

    var data = JSON.parse(JSON.stringify(mo));
    var categoryCache = JSON.parse(JSON.stringify(mo.categoryCache));

    expect(data).toEqual({
      _id: '2015-01-01',
      categories: {
        123: {
          budget: 0,
          transactions: [{
            value: 1233
          }]
        }
      }
    });
    expect(categoryCache).toEqual({
      123: {
        rolling: 0,
        balance: -1233
      }
    });
  });

  it('should notify subscribeNextMonth & subscribeRecordChanges upon transaction add/update/remove', () => {
    const foo = {
      subscribeNextMonth: () => {},
      subscribeRecordChanges: () => {}
    }
    spyOn(foo, 'subscribeNextMonth');
    spyOn(foo, 'subscribeRecordChanges');

    const mo = new Month(defaultMonth());
    mo.subscribeNextMonth(foo.subscribeNextMonth);
    mo.subscribeRecordChanges(foo.subscribeRecordChanges);
    const tr = new Transaction({value: 1233});

    mo.addTransaction(123, tr);

    expect(foo.subscribeNextMonth).toHaveBeenCalledWith(123, -1233);
    expect(foo.subscribeRecordChanges).toHaveBeenCalledWith(mo);
    expect(foo.subscribeRecordChanges.calls.count()).toBe(1);

    tr.value = 1001;

    expect(foo.subscribeNextMonth).toHaveBeenCalledWith(123, -1001);
    expect(foo.subscribeRecordChanges.calls.count()).toBe(2);

    mo.removeTransaction(123, tr);

    expect(foo.subscribeNextMonth).toHaveBeenCalledWith(123, 0);
    expect(foo.subscribeRecordChanges.calls.count()).toBe(3);
  });

  it('should notify subscribeNextMonth & subscribeRecordChanges upon budget update', () => {
    const foo = {
      subscribeNextMonth: () => {},
      subscribeRecordChanges: () => {}
    }
    spyOn(foo, 'subscribeNextMonth');
    spyOn(foo, 'subscribeRecordChanges');

    const mo = new Month(defaultMonth());
    mo.subscribeNextMonth(foo.subscribeNextMonth);
    mo.subscribeRecordChanges(foo.subscribeRecordChanges);

    mo.setBudget(123, 1200);

    expect(foo.subscribeNextMonth).toHaveBeenCalledWith(123, 1200);
    expect(foo.subscribeRecordChanges).toHaveBeenCalledWith(mo);
    expect(foo.subscribeRecordChanges.calls.count()).toBe(1);

    mo.setBudget(123, 1000);

    expect(foo.subscribeNextMonth).toHaveBeenCalledWith(123, 1000);
    expect(foo.subscribeRecordChanges.calls.count()).toBe(2);
  });

  it('should notify subscribeRecordChanges upon rolling update', () => {
    const foo = {
      subscribeNextMonth: () => {},
      subscribeRecordChanges: () => {}
    }
    spyOn(foo, 'subscribeNextMonth');
    spyOn(foo, 'subscribeRecordChanges');

    const mo = new Month(defaultMonth());
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
    const mo = new Month(defaultMonth());

    mo.setBudget(123, 1200);

    var data = JSON.parse(JSON.stringify(mo));
    var categoryCache = JSON.parse(JSON.stringify(mo.categoryCache));

    expect(data).toEqual({
      _id: Month.createID(new Date('1/1/15')),
      categories: {
        123: {
          budget: 1200,
          transactions: []
        }
      }
    });

    expect(categoryCache).toEqual({
      123: {
        rolling: 0,
        balance: 1200
      }
    });
  });

  it('should remove a transaction', () => {
    const mo = new Month(defaultMonth());
    const tr = new Transaction({value: 1233});

    mo.addTransaction(123, tr);
    mo.removeTransaction(123, tr);

    var data = JSON.parse(JSON.stringify(mo));
    var categoryCache = JSON.parse(JSON.stringify(mo.categoryCache));

    expect(data).toEqual({
      _id: Month.createID(new Date('1/1/15')),
      categories: {
        123: {
          budget: 0,
          transactions: []
        }
      }
    });

    expect(categoryCache).toEqual({
      123: {
        rolling: 0,
        balance: 0
      }
    });
  });

  it('can set a rolling (incoming) value', () => {
    const mo = new Month(defaultMonth());

    mo.setRolling(123, 6900);

    var data = JSON.parse(JSON.stringify(mo));
    var categoryCache = JSON.parse(JSON.stringify(mo.categoryCache));

    expect(data).toEqual({
      _id: Month.createID(new Date('1/1/15')),
      categories: {
        123: {
          budget: 0,
          transactions: []
        }
      }
    });

    expect(categoryCache).toEqual({
      123: {
        rolling: 6900,
        balance: 6900
      }
    });
  });

  it('does The Kitchen Sink(tm)', () => {
    const mo = new Month(defaultMonth());

    mo.setRolling(123, 6900);

    mo.addTransaction(123, new Transaction({value: 1233}));
    mo.setBudget(123, 5000);
    mo.addTransaction(123, new Transaction({value: 3200}));
    const tr = new Transaction({value: 10200});
    mo.addTransaction(124, tr);
    mo.addTransaction(124, new Transaction({value: 10200}));
    mo.removeTransaction(124, tr);

    var data = JSON.parse(JSON.stringify(mo));
    var categoryCache = JSON.parse(JSON.stringify(mo.categoryCache));

    expect(data).toEqual({
      _id: Month.createID(new Date('1/1/15')),
      categories: {
        123: {
          budget: 5000,
          transactions: [{
            value: 1233
          }, {
            value: 3200
          }]
        },
        124: {
          budget: 0,
          transactions: [{
            value: 10200
          }]
        }
      }
    });

    expect(categoryCache).toEqual({
      123: {
        rolling: 6900,
        balance: 7467
      },
      124: {
        rolling: 0,
        balance: -10200
      }
    });
  });

  describe('totals', () => {
    it('totalTransactions should update upon transaction add/update/remove', () => {
      const mo = new Month(defaultMonth());

      const tr = new Transaction({value: 1233});

      mo.addTransaction(123, tr);

      expect(mo.cache.totalTransactions).toBe(1233);

      tr.value = 1001;

      expect(mo.cache.totalTransactions).toBe(1001);

      mo.removeTransaction(123, tr);

      expect(mo.cache.totalTransactions).toBe(0);
    });
  });

  it('totalBudget should update on setBudget', () => {
    const mo = new Month(defaultMonth());

    mo.setBudget(123, 5000);

    expect(mo.cache.totalBudget).toBe(5000);

    mo.setBudget(124, 1000);

    expect(mo.cache.totalBudget).toBe(6000);
  });

  describe('totalBalance', () => {
    it('totalBalance should update on add/update/remove', () => {
      const mo = new Month(defaultMonth());

      const tr = new Transaction({value: 1233});

      mo.addTransaction(123, tr);

      expect(mo.cache.totalBalance).toBe(-1233);

      tr.value = 1001;

      expect(mo.cache.totalBalance).toBe(-1001);

      mo.removeTransaction(123, tr);

      expect(mo.cache.totalBalance).toBe(0);
    });

    it('totalBalance should update on setRolling', () => {
      const mo = new Month(defaultMonth());

      mo.setRolling(123, 5000);

      expect(mo.cache.totalBalance).toBe(5000);

      mo.setRolling(124, 1000);

      expect(mo.cache.totalBalance).toBe(6000);
    });

    it('totalBalance should update on setBudget', () => {
      const mo = new Month(defaultMonth());

      mo.setBudget(123, 5000);

      expect(mo.cache.totalBalance).toBe(5000);

      mo.setBudget(124, 1000);

      expect(mo.cache.totalBalance).toBe(6000);
    });
  });

  describe('importing data', () => {
    it('transforms transactions', () => {
      const mo = new Month({
        categories: {
          123: {
            transactions: [{
              value: 12
            }],
            budget: 12
          }
        },
        _id: Month.createID(new Date('1/1/15'))
      });
      
      expect(mo.data.categories[123].transactions[0].constructor.name).toBe('Transaction');
    });

    it('adds up category balance', () => {
      const mo = new Month({
        categories: {
          123: {
            transactions: [{
              value: 12
            }, {
              value: 20
            }]
          }
        },
        _id: Month.createID(new Date('1/1/15'))
      });

      expect(mo.categoryCache[123].balance).toBe(-32);

      expect(mo.cache.totalBalance).toBe(-32);
    });

    it('adds up category budgets', () => {
      const mo = new Month({
        categories: {
          123: {
            budget: 12
          }
        },
        _id: Month.createID(new Date('1/1/15'))
      });

      expect(mo.categoryCache[123].balance).toBe(12);

      expect(mo.cache.totalBalance).toBe(12);
    });
  });
});
