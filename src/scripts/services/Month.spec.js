describe("Month", function() {
  let Month, Transaction;

  beforeEach(module('financier'));

  beforeEach(inject((_Month_, _Transaction_) => {
    Month = _Month_;
    Transaction = _Transaction_;
  }));

  it('should be a Month', () => {
    const mo = new Month();
    expect(mo.constructor.name).toBe('Month');
  });

  it('should serialize to JSON', () => {
    expect(JSON.stringify(new Month())).toBe('{"categories":{}}');
  });

  it('should add a transaction', () => {
    const mo = new Month();
    const tr = new Transaction(12.33);

    mo.addTransaction(123, tr);

    var obj = JSON.parse(JSON.stringify(mo));

    expect(obj).toEqual({
      categories: {
        123: {
          rolling: 0,
          budget: 0,
          transactions: [{
            value: 12.33
          }],
          total: -12.33
        }
      }
    });
  });

  it('should notify subscriber upon transaction update', () => {
    const foo = {
      bar: () => {}
    }
    spyOn(foo, 'bar');

    const mo = new Month(foo.bar);
    const tr = new Transaction(12.33);

    mo.addTransaction(123, tr);

    expect(foo.bar).toHaveBeenCalledWith(123, -12.33);

    tr.value = 10.01;

    expect(foo.bar).toHaveBeenCalledWith(123, -10.01);

  });
});
