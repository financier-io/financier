describe("category", function () {
  let category, transaction;

  beforeEach(angular.mock.module("financier"));

  beforeEach(inject((_category_, _transaction_) => {
    category = _category_;
    transaction = _transaction_;
  }));

  describe("static property", () => {
    let Category;

    beforeEach(() => {
      Category = category("111-111-111-111");
    });

    it("startKey", () => {
      expect(Category.startKey).toBe("b_111-111-111-111_category_");
    });

    it("endKey", () => {
      expect(Category.endKey).toBe("b_111-111-111-111_category_\uffff");
    });

    it("prefix", () => {
      expect(Category.prefix).toBe("b_111-111-111-111_category_");
    });

    describe("contains", () => {
      it("is true if _id is of budget and is Category", () => {
        const cat = new Category();

        expect(Category.contains(cat.data._id)).toBe(true);
      });

      it("is false if _id is of other budget and is Category", () => {
        const OtherBudgetCategory = category("222-222-222-222"),
          cat = new OtherBudgetCategory();

        expect(Category.contains(cat.data._id)).toBe(false);
      });

      it("is false if _id is of budget and is Category", () => {
        const Transaction = transaction("111-111-111-111"),
          trans = new Transaction();

        expect(Category.contains(trans.data._id)).toBe(false);
      });

      // Explicit coverage test
      it("is false if _id is greater than", () => {
        expect(Category.contains("aaa")).toBe(false);
      });

      // Explicit coverage test
      it("is false if _id is less than", () => {
        expect(Category.contains("zzz")).toBe(false);
      });
    });
  });

  it("is a function", () => {
    expect(typeof category).toBe("function");
  });

  it("takes a budgetId and returns Category", () => {
    const Category = category("123-123-123-123");

    const cat = new Category();

    expect(cat.constructor.name).toBe("Category");
  });

  describe("new Category()", () => {
    let Category;

    beforeEach(() => {
      Category = category("111-111-111-111");
    });

    it("can take an existing database document", () => {
      let cat = new Category({
        name: "My cat",
        _id: "b_123-123-123-123_category_321-321-321-321",
      });

      expect(cat.constructor.name).toBe("Category");
    });

    it("can create default id", () => {
      let cat = new Category();

      expect(cat._id.indexOf("b_111-111-111-111_category_")).toBe(0);
    });

    it("exposes default name and no default note", () => {
      let cat = new Category({
        _id: "foo",
      });

      expect(cat.note).not.toBeDefined();
      expect(cat.data._id).toBeDefined();
      expect(cat.name).toBe("New category");
    });

    it("uses existing _id if exists", () => {
      let cat = new Category({
        _id: "b_123-123-123-123_category_321-321-321-321",
      });

      expect(cat._id).toBe("b_123-123-123-123_category_321-321-321-321");
    });
  });

  it("can be removed", () => {
    const Category = category("111-111-111-111");

    const foo = {
      change: () => {},
    };

    jest.spyOn(foo, "change");

    let cat = new Category({
      _id: "foo",
    });

    cat.subscribe(foo.change);

    expect(foo.change).not.toHaveBeenCalled();
    expect(cat.toJSON()._deleted).not.toBeDefined();

    cat.remove();

    expect(foo.change).toHaveBeenCalledWith(cat);
    expect(cat.toJSON()._deleted).toBe(true);
  });

  describe("set", () => {
    let Category;

    beforeEach(() => {
      Category = category("111-111-111-111");
    });

    it("name", () => {
      let cat = new Category({
        name: "My cat",
        _id: "foobar",
      });

      cat.name = "My custom name";

      expect(cat.toJSON().name).toBe("My custom name");
    });

    it("note", () => {
      let cat = new Category({
        note: "newnote",
        _id: "foobar",
      });

      cat.note = "newnote2";

      expect(cat.toJSON().note).toBe("newnote2");
    });

    it("cannot set _id", () => {
      let cat = new Category({
        _id: "foobar",
      });

      expect(() => (cat._id = 123)).toThrow(TypeError);
    });
  });

  describe("pub/sub", () => {
    let Category;

    beforeEach(() => {
      Category = category("111-111-111-111");
    });

    it("name", () => {
      const foo = {
        change: () => {},
      };

      jest.spyOn(foo, "change");

      let cat = new Category({
        name: "My catount",
        _id: "foobar",
      });

      cat.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      cat.name = "My custom name";

      expect(foo.change).toHaveBeenCalledWith(cat);
    });

    it("note", () => {
      const foo = {
        change: () => {},
      };

      jest.spyOn(foo, "change");

      let cat = new Category({
        note: "first note",
        _id: "foobar",
      });

      cat.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      cat.note = "updated note";

      expect(foo.change).toHaveBeenCalledWith(cat);
    });
  });
});
