describe("masterCategory", function () {
  let category, masterCategory;

  beforeEach(angular.mock.module("financier"));

  beforeEach(inject((_category_, _masterCategory_) => {
    category = _category_;
    masterCategory = _masterCategory_;
  }));

  it("takes a budgetId and returns MasterCategory", () => {
    const MasterCategory = masterCategory("123-123-123-123");

    const cat = new MasterCategory();

    expect(cat.constructor.name).toBe("MasterCategory");
  });

  describe("new MasterCategory()", () => {
    let MasterCategory;

    beforeEach(() => {
      MasterCategory = masterCategory("111-111-111-111");
    });

    describe("static property", () => {
      it("startKey", () => {
        expect(MasterCategory.startKey).toBe(
          "b_111-111-111-111_master-category_"
        );
      });

      it("endKey", () => {
        expect(MasterCategory.endKey).toBe(
          "b_111-111-111-111_master-category_\uffff"
        );
      });

      it("prefix", () => {
        expect(MasterCategory.prefix).toBe(
          "b_111-111-111-111_master-category_"
        );
      });

      describe("contains", () => {
        it("is true if _id is of budget and is MasterCategory", () => {
          const cat = new MasterCategory();

          expect(MasterCategory.contains(cat.data._id)).toBe(true);
        });

        it("is false if _id is of other budget and is MasterCategory", () => {
          const OtherBudgetCategory = masterCategory("222-222-222-222"),
            cat = new OtherBudgetCategory();

          expect(MasterCategory.contains(cat.data._id)).toBe(false);
        });

        it("is false if _id is of budget and is MasterCategory", () => {
          const Category = category("111-111-111-111"),
            cat = new Category();

          expect(MasterCategory.contains(cat.data._id)).toBe(false);
        });

        // Explicit coverage test
        it("is false if _id is greater than", () => {
          expect(MasterCategory.contains("aaa")).toBe(false);
        });

        // Explicit coverage test
        it("is false if _id is less than", () => {
          expect(MasterCategory.contains("zzz")).toBe(false);
        });
      });
    });

    it("can take an existing database document", () => {
      let cat = new MasterCategory({
        name: "My cat",
        _id: "b_123-123-123-123_master-category_321-321-321-321",
      });

      expect(cat.constructor.name).toBe("MasterCategory");
    });

    it("can create default id", () => {
      let cat = new MasterCategory();

      expect(cat._id.indexOf("b_111-111-111-111_master-category_")).toBe(0);
    });

    it("exposes default name and no default note", () => {
      let cat = new MasterCategory({
        _id: "foo",
      });

      expect(cat.note).not.toBeDefined();
      expect(cat.data._id).toBeDefined();
      expect(cat.name).toBe("New master category");
    });

    it("uses existing _id if exists", () => {
      let cat = new MasterCategory({
        _id: "b_123-123-123-123_master-category_321-321-321-321",
      });

      expect(cat._id).toBe("b_123-123-123-123_master-category_321-321-321-321");
    });
  });

  describe("set", () => {
    let MasterCategory;

    beforeEach(() => {
      MasterCategory = masterCategory("111-111-111-111");
    });

    describe("sort", () => {
      it("has getter/setter, saves to record", () => {
        let cat = new MasterCategory();

        cat.sort = 2;

        expect(cat.toJSON().sort).toEqual(2);
        expect(cat.sort).toEqual(2);
      });
    });
  });

  describe("pub/sub", () => {
    let MasterCategory;

    beforeEach(() => {
      MasterCategory = masterCategory("111-111-111-111");
    });

    it("sort", () => {
      const foo = {
        change: () => {},
      };

      jest.spyOn(foo, "change");

      let cat = new MasterCategory({
        name: "My catount",
        _id: "foobar",
        sort: 2,
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
