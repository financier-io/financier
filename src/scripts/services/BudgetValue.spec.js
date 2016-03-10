describe('BudgetValue', function() {
  let BudgetValue;

  beforeEach(module('financier'));

  beforeEach(inject(_BudgetValue_ => {
    BudgetValue = _BudgetValue_;
  }));

  describe('new Budget.from()', () => {
    it('is a Budget', () => {
      let sets = new BudgetValue.from(
        '111-111-111-111',
        '201501',
        '333-333-333-333'
      );

      expect(sets.constructor.name).toBe('BudgetValue');
    });

    it('creates proper _id', () => {
      let sets = new BudgetValue.from(
        '111-111-111-111',
        '201501',
        '333-333-333-333'
      );

      expect(sets._id).toBe('b_111-111-111-111_m_201501_budget-value_333-333-333-333');
    });
  });

  describe('new Budget()', () => {

    it('can take existing settings', () => {
      let sets = new BudgetValue({
        _id: 'b_111-111_m_201501_222-222',
        value: 223
      });

      expect(sets.value).toBe(223);
    });

    it('throws if no constructor params', () => {
      
      expect(() => {
        let sets = new BudgetValue();
      }).toThrow();

    });
  });

  describe('set', () => {
    it('value', () => {
      let sets = new BudgetValue({
        _id: 'b_111-111_m_201501_222-222'
      });

      sets.value = 123;

      expect(sets.toJSON().value).toBe(123);
    });
  });

  describe('pub/sub', () => {

    it('value', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let sets = new BudgetValue({
        _id: 'b_111-111_m_201501_222-222',
        value: 12
      });

      sets.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      sets.value = 222;

      expect(foo.change).toHaveBeenCalledWith(sets);
    });

  });
});
