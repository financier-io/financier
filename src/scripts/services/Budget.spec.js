describe('Budget', function() {
  let Budget;

  beforeEach(module('financier'));

  beforeEach(inject(_Budget_ => {
    Budget = _Budget_;
  }));

  describe('new Budget()', () => {
    it('can take existing settings', () => {
      let sets = new Budget({
        hints: {
          outflow: false
        }
      });

      expect(sets.constructor.name).toBe('Budget');
    });

    it('can take no constructor params', () => {
      let sets = new Budget();

      expect(sets.constructor.name).toBe('Budget');
    });

    it('exposes default settings', () => {
      let sets = new Budget();

      expect(sets._id.indexOf('budget_')).toBe(0);
      expect(sets.hints.outflow).toBe(true);
    });
  });

  describe('set', () => {
    it('hints.outflow', () => {
      let sets = new Budget();

      sets.hints.outflow = false;

      expect(sets.toJSON().hints.outflow).toBe(false);
    });

    it('cannot set _id', () => {
      let sets = new Budget();

      expect(() => sets._id = 123).toThrow();
    });
  });

  describe('pub/sub', () => {

    it('hints.outflow', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let sets = new Budget({
        hints: {
          outflow: false
        }
      });

      sets.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      sets.hints.outflow = true;

      expect(foo.change).toHaveBeenCalledWith(sets);
    });

  });
});
