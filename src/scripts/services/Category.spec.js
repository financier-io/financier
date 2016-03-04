describe('Category', function() {
  let Category;

  beforeEach(module('financier'));

  beforeEach(inject(_Category_ => {
    Category = _Category_;
  }));

  describe('new Category()', () => {
    it('can take an existing database document', () => {
      let cat = new Category({
        name: 'My cat',
        _id: 'b_123-123-123-123_category_321-321-321-321'
      });

      expect(cat.constructor.name).toBe('Category');
    });

    it('must have constructor params', () => {
      expect(() => {
        let cat = new Category();
      }).toThrow();
    });

    it('must have _id', () => {
      expect(() => {
        let cat = new Category({
          name: 'foobar'
        });
      }).toThrow();
    });

    it('exposes default name and no default note', () => {
      let cat = new Category({
        _id: 'foo'
      });

      expect(cat.note).not.toBeDefined();
      expect(cat.data._id).toBeDefined();
      expect(cat.name).toBe('New category');
    });

    it('uses existing _id if exists', () => {
      let cat = new Category({
        _id: 'b_123-123-123-123_category_321-321-321-321'
      });

      expect(cat._id).toBe('b_123-123-123-123_category_321-321-321-321');
    });
  });

  describe('set', () => {
    it('name', () => {
      let cat = new Category({
        name: 'My cat',
        _id: 'foobar'
      });

      cat.name = 'My custom name';

      expect(cat.toJSON().name).toBe('My custom name');
    });

    it('note', () => {
      let cat = new Category({
        note: 'newnote',
        _id: 'foobar'
      });

      cat.note = 'newnote2';

      expect(cat.toJSON().note).toBe('newnote2');
    });

    it('cannot set _id', () => {
      let cat = new Category({
        _id: 'foobar'
      });

      expect(() => cat._id = 123).toThrow();
    });
  });

  describe('pub/sub', () => {

    it('name', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let cat = new Category({
        name: 'My catount',
        _id: 'foobar'
      });

      cat.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      cat.name = 'My custom name';

      expect(foo.change).toHaveBeenCalledWith(cat);
    });

    it('note', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let cat = new Category({
        note: 'first note',
        _id: 'foobar'
      });

      cat.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      cat.note = 'updated note';

      expect(foo.change).toHaveBeenCalledWith(cat);
    });

  });
});
