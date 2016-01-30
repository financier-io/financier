describe("Month", function() {
  let Month, Transaction;

  function defaultMonth() {
    return {
      categories: {},
      _id: '201211'
    };
  }

  beforeEach(module('financier'));

  beforeEach(inject((_Month_, _Transaction_) => {
    Month = _Month_;
    Transaction = _Transaction_;
  }));

  it('throws if not passed Date', () => {
    expect(() => new Month('boom')).toThrowError(TypeError, 'date is not Date!');
  });

  it('should be a Month', () => {
    const mo = new Month(defaultMonth());
    expect(mo.constructor.name).toBe('Month');
  });

  it('should serialize to JSON', () => {
    expect(JSON.stringify(new Month(defaultMonth()))).toBe('{"categories":{},"_id":"201211"}');
  });

  it('should add a transaction', () => {
    const mo = new Month(defaultMonth());
    const tr = new Transaction(12.33);

    mo.addTransaction(123, tr);

    var data = JSON.parse(JSON.stringify(mo));
    var cache = JSON.parse(JSON.stringify(mo.cache));

    expect(data).toEqual({
      _id: '201211',
      categories: {
        123: {
          budget: 0,
          transactions: [{
            value: 12.33
          }]
        }
      }
    });
    expect(cache).toEqual({
      123: {
        rolling: 0,
        total: -12.33
      }
    });
  });

  it('should notify a subscriber upon transaction update', () => {
    const foo = {
      bar: () => {}
    }
    spyOn(foo, 'bar');

    const mo = new Month(defaultMonth());
    mo.subscribe(foo.bar);
    const tr = new Transaction(12.33);

    mo.addTransaction(123, tr);

    expect(foo.bar).toHaveBeenCalledWith(123, -12.33);

    tr.value = 10.01;

    expect(foo.bar).toHaveBeenCalledWith(123, -10.01);

  });

  it('should allow setting budget', () => {
    const mo = new Month(defaultMonth());

    mo.setBudget(123, 12);

    var data = JSON.parse(JSON.stringify(mo));
    var cache = JSON.parse(JSON.stringify(mo.cache));

    expect(data).toEqual({
      _id: '201211',
      categories: {
        123: {
          budget: 12,
          transactions: []
        }
      }
    });

    expect(cache).toEqual({
      123: {
        rolling: 0,
        total: 12
      }
    });
  });

  it('should remove a transaction', () => {
    const mo = new Month(defaultMonth());
    const tr = new Transaction(12.33);

    mo.addTransaction(123, tr);
    mo.removeTransaction(123, tr);

    var data = JSON.parse(JSON.stringify(mo));
    var cache = JSON.parse(JSON.stringify(mo.cache));

    expect(data).toEqual({
      _id: '201211',
      categories: {
        123: {
          budget: 0,
          transactions: []
        }
      }
    });

    expect(cache).toEqual({
      123: {
        rolling: 0,
        total: 0
      }
    });
  });

  it('can set a rolling (incoming) value', () => {
    const mo = new Month(defaultMonth());

    mo.setRolling(123, 69);

    var data = JSON.parse(JSON.stringify(mo));
    var cache = JSON.parse(JSON.stringify(mo.cache));

    expect(data).toEqual({
      _id: '201211',
      categories: {
        123: {
          budget: 0,
          transactions: []
        }
      }
    });

    expect(cache).toEqual({
      123: {
        rolling: 69,
        total: 69
      }
    });
  });

  it('does The Kitchen Sink(tm)', () => {
    const mo = new Month(defaultMonth());

    mo.setRolling(123, 69);

    mo.addTransaction(123, new Transaction(12.33));
    mo.setBudget(123, 50);
    mo.addTransaction(123, new Transaction(32));
    const tr = new Transaction(1.02);
    mo.addTransaction(124, tr);
    mo.addTransaction(124, new Transaction(1.02));
    mo.removeTransaction(124, tr);

    var data = JSON.parse(JSON.stringify(mo));
    var cache = JSON.parse(JSON.stringify(mo.cache));

    expect(data).toEqual({
      _id: '201211',
      categories: {
        123: {
          budget: 50,
          transactions: [{
            value: 12.33
          }, {
            value: 32
          }]
        },
        124: {
          budget: 0,
          transactions: [{
            value: 1.02
          }]
        }
      }
    });

    expect(cache).toEqual({
      123: {
        rolling: 69,
        total: 74.67
      },
      124: {
        rolling: 0,
        total: -1.02
      }
    });
  });
});
