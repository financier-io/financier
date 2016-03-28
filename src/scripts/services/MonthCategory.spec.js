describe('MonthCategory', function() {
  let MonthCategory;

  beforeEach(module('financier'));

  beforeEach(inject(_MonthCategory_ => {
    MonthCategory = _MonthCategory_;
  }));

  describe('new Budget.from()', () => {
    it('is a Budget', () => {
      let sets = new MonthCategory.from(
        '111-111-111-111',
        '201501',
        '333-333-333-333'
      );

      expect(sets.constructor.name).toBe('MonthCategory');
    });

    it('creates proper _id', () => {
      let sets = new MonthCategory.from(
        '111-111-111-111',
        '201501',
        '333-333-333-333'
      );

      expect(sets._id).toBe('b_111-111-111-111_m_201501_month-category_333-333-333-333');
    });
  });

  describe('new Budget()', () => {

    it('can take existing settings', () => {
      let sets = new MonthCategory({
        _id: 'b_111-111_m_201501_222-222',
        budget: 223
      });

      expect(sets.budget).toBe(223);
    });

    it('throws if no constructor params', () => {
      
      expect(() => {
        let sets = new MonthCategory();
      }).toThrow();

    });
  });

  describe('set', () => {
    it('budget', () => {
      let sets = new MonthCategory({
        _id: 'b_111-111_m_201501_month-category_222-222'
      });

      sets.budget = 123;

      expect(sets.toJSON().budget).toBe(123);
    });

    it('note', () => {
      let sets = new MonthCategory({
        _id: 'b_111-111_m_201501_month-category_222-222'
      });

      sets.note = 'foobar';

      expect(sets.toJSON().note).toBe('foobar');
    });
  });

  describe('pub/sub', () => {

    it('budget', () => {
      const foo = {
        sub: () => {},
        bdgSub: () => {}
      };

      spyOn(foo, 'sub');
      spyOn(foo, 'bdgSub');

      let sets = new MonthCategory({
        _id: 'b_111-111_m_201501_month-category_222-222',
        budget: 12
      });

      sets.subscribe(foo.sub);
      sets.subscribeBudget(foo.bdgSub);

      expect(foo.sub).not.toHaveBeenCalled();
      expect(foo.bdgSub).not.toHaveBeenCalled();

      sets.budget = 222;

      expect(foo.sub).toHaveBeenCalledWith(sets);
      expect(foo.bdgSub).toHaveBeenCalledWith(222, 12);
    });

    it('budget does not emit event if the same', () => {
      const foo = {
        sub: () => {},
        bdgSub: () => {}
      };

      spyOn(foo, 'sub');
      spyOn(foo, 'bdgSub');

      let sets = new MonthCategory({
        _id: 'b_111-111_m_201501_month-category_222-222',
        budget: 12
      });

      sets.subscribe(foo.sub);
      sets.subscribeBudget(foo.bdgSub);

      expect(foo.sub).not.toHaveBeenCalled();
      expect(foo.bdgSub).not.toHaveBeenCalled();

      sets.budget = 12;

      expect(foo.sub).not.toHaveBeenCalled();
      expect(foo.bdgSub).not.toHaveBeenCalled();
    });

    it('note', () => {
      const foo = {
        sub: () => {},
        bdgSub: () => {}
      };

      spyOn(foo, 'sub');
      spyOn(foo, 'bdgSub');


      let sets = new MonthCategory({
        _id: 'b_111-111_m_201501_month-category_222-222',
        note: 'foobar'
      });

      sets.subscribe(foo.sub);
      sets.subscribeBudget(foo.bdgSub);

      expect(foo.sub).not.toHaveBeenCalled();
      expect(foo.bdgSub).not.toHaveBeenCalled();

      sets.note = 'barfoo';

      expect(foo.sub).toHaveBeenCalledWith(sets);
      expect(foo.bdgSub).not.toHaveBeenCalled();
    });

  });
});
