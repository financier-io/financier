describe('Budget', function() {
  let Budget;

  beforeEach(module('financier'));

  beforeEach(inject(_Budget_ => {
    Budget = _Budget_;
  }));

  describe('new Budget()', () => {
    it('is a Budget', () => {
      let sets = new Budget();

      expect(sets.constructor.name).toBe('Budget');
    });
    it('can take existing settings', () => {
      let sets = new Budget({
        hints: {
          outflow: false
        },
        name: 'foobar',
        created: '2016-03-03T03:16:34.882Z'
      });

      expect(sets.hints.outflow).toBe(false);
      expect(sets.name).toBe('foobar');
      expect(sets.created.toISOString()).toBe('2016-03-03T03:16:34.882Z');
    });

    it('can take no constructor params', () => {
      let sets = new Budget();

      expect(sets.constructor.name).toBe('Budget');

      // should compare *that* second... may cause race conditions :/
      expect(sets.created.toUTCString()).toBe(new Date().toUTCString());
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

    it('name', () => {
      let sets = new Budget();

      sets.name = 'foobar';

      expect(sets.toJSON().name).toBe('foobar');
    });

    it('cannot set _id', () => {
      let sets = new Budget();

      expect(() => sets._id = 123).toThrow();
    });

    it('cannot set created', () => {
      let sets = new Budget();

      expect(() => sets.created = '2016-03-03T03:16:34.882Z').toThrow();
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

    it('name', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let sets = new Budget({
        name: 'foobar'
      });

      sets.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      sets.name = 'barfoo';

      expect(foo.change).toHaveBeenCalledWith(sets);
    });

  });
});
