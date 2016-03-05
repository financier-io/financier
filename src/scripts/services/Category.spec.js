describe('category', function() {
  let category;

  beforeEach(module('financier'));

  beforeEach(inject(_category_ => {
    category = _category_;
  }));

  it('is a function', () => {
    expect(typeof category).toBe('function');
  });

  it('takes a budgetId and returns Category', () => {
    const Category = category('123-123-123-123');

    const cat = new Category();

    expect(cat.constructor.name).toBe('Category');
  });

  describe('new Category()', () => {
    let Category;

    beforeEach(() => {
      Category = category('111-111-111-111');
    });

    it('can take an existing database document', () => {
      let cat = new Category({
        name: 'My cat',
        _id: 'b_123-123-123-123_category_321-321-321-321'
      });

      expect(cat.constructor.name).toBe('Category');
    });

    it('can create default id', () => {
      let cat = new Category();

      expect(cat._id.indexOf('b_111-111-111-111_category_')).toBe(0);
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
    let Category;

    beforeEach(() => {
      Category = category('111-111-111-111');
    });

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
    let Category;

    beforeEach(() => {
      Category = category('111-111-111-111');
    });

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
