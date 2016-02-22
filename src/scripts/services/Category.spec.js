describe('Category', function() {
  let Category;

  beforeEach(module('financier'));

  beforeEach(inject(_Category_ => {
    Category = _Category_;
  }));

  describe('new Category()', () => {
    it('can take an existing database document', () => {
      let cat = new Category({
        name: 'My cat'
      });

      expect(cat.constructor.name).toBe('Category');
    });

    it('can take no constructor params', () => {
      let cat = new Category();

      expect(cat.constructor.name).toBe('Category');
    });

    it('exposes default name and no default note', () => {
      let cat = new Category();

      expect(cat.note).not.toBeDefined();
      expect(cat.data._id).toBeDefined(); // randomly generated if not provided
      expect(cat.name).toBe('New category');
    });

    it('generates _id if none exists', () => {
      let cat = new Category();

      expect(cat.data._id).toBeDefined();
    });

    it('uses existing _id if exists', () => {
      let cat = new Category({
        _id: 'myid'
      });

      expect(cat.data._id).toBe('myid');
    });

    it('prefixes _id in data with "category_"', () => {
      let cat = new Category();

      expect(cat.data._id.indexOf('category_')).toEqual(0);
    });
  });

  describe('set', () => {
    it('name', () => {
      let cat = new Category({
        name: 'My cat'
      });

      cat.name = 'My custom name';

      expect(cat.toJSON().name).toBe('My custom name');
    });

    it('note', () => {
      let cat = new Category({
        note: 'newnote'
      });

      cat.note = 'newnote2';

      expect(cat.toJSON().note).toBe('newnote2');
    });
  });

  describe('pub/sub', () => {

    it('name', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let cat = new Category({
        name: 'My catount'
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
        note: 'first note'
      });

      cat.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      cat.note = 'updated note';

      expect(foo.change).toHaveBeenCalledWith(cat);
    });

  });
});
