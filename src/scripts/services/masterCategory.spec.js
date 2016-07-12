describe('category', function() {
  let category, masterCategory;

  beforeEach(module('financier'));

  beforeEach(inject((_category_, _masterCategory_) => {
    category = _category_;
    masterCategory = _masterCategory_;
  }));

  it('extends Category', () => {
    const Category = category('123-123-123-123'),
        MasterCategory = masterCategory('123-123-123-123');

    expect(Object.getPrototypeOf(MasterCategory).name).toBe(Category.name);
  });

  it('takes a budgetId and returns MasterCategory', () => {
    const MasterCategory = masterCategory('123-123-123-123');

    const cat = new MasterCategory();

    expect(cat.constructor.name).toBe('MasterCategory');
  });

  describe('new MasterCategory()', () => {
    let MasterCategory;

    beforeEach(() => {
      MasterCategory = masterCategory('111-111-111-111');
    });

    it('can take an existing database document', () => {
      let cat = new MasterCategory({
        name: 'My cat',
        _id: 'b_123-123-123-123_masterCategory_321-321-321-321'
      });

      expect(cat.constructor.name).toBe('MasterCategory');
    });

    it('can create default id', () => {
      let cat = new MasterCategory();

      expect(cat._id.indexOf('b_111-111-111-111_masterCategory_')).toBe(0);
    });

    it('exposes default name and no default note', () => {
      let cat = new MasterCategory({
        _id: 'foo'
      });

      expect(cat.note).not.toBeDefined();
      expect(cat.data._id).toBeDefined();
      expect(cat.name).toBe('New category');
    });

    it('uses existing _id if exists', () => {
      let cat = new MasterCategory({
        _id: 'b_123-123-123-123_masterCategory_321-321-321-321'
      });

      expect(cat._id).toBe('b_123-123-123-123_masterCategory_321-321-321-321');
    });
  });

  describe('set', () => {
    let MasterCategory;

    beforeEach(() => {
      MasterCategory = masterCategory('111-111-111-111');
    });

    describe('categories', () => {
      it('toJSON maps categories to their IDs', () => {
        let cat = new MasterCategory({
          name: 'My cat',
          _id: 'foobar'
        });

        cat.categories = [{
          _id: 'subcategory1Id'
        }, {
          _id: 'subcategory2Id'
        }];

        expect(cat.toJSON().categories).toEqual(['subcategory1Id', 'subcategory2Id']);
      });

      it('adds update() to self', () => {
        const foo = {
          change: () => {},
        };

        spyOn(foo, 'change');

        let cat = new MasterCategory({
          name: 'My cat',
          _id: 'foobar'
        });

        cat.subscribe(foo.change);

        cat.categories = [{
          _id: 'subcategory1Id'
        }, {
          _id: 'subcategory2Id'
        }];

        expect(typeof cat.categories.update).toBe('function');

        expect(foo.change).not.toHaveBeenCalled();
        cat.categories.update();
        expect(foo.change).toHaveBeenCalled();
      });
    });

    describe('sort', () => {
      it('has getter/setter, saves to record', () => {
        let cat = new MasterCategory();

        cat.sort = 2;

        expect(cat.toJSON().sort).toEqual(2);
        expect(cat.sort).toEqual(2);

      });
    });
  });

  describe('pub/sub', () => {
    let MasterCategory;

    beforeEach(() => {
      MasterCategory = masterCategory('111-111-111-111');
    });

    it('sort', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let cat = new MasterCategory({
        name: 'My catount',
        _id: 'foobar',
        sort: 2
      });

      cat.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      cat.sort = 2;

      expect(foo.change).not.toHaveBeenCalled();

      cat.sort = 3;

      expect(foo.change).toHaveBeenCalled();
    });
  });
});
