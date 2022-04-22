describe("MonthCategory", function () {
  let MonthCategory, transaction;

  beforeEach(angular.mock.module("financier"));

  beforeEach(inject((_MonthCategory_, _transaction_) => {
    MonthCategory = _MonthCategory_;
    transaction = _transaction_;
  }));

  describe("new Budget.from()", () => {
    describe("static property", () => {
      it("startKey", () => {
        expect(MonthCategory.startKey("111-111-111-111")).toBe(
          "b_111-111-111-111_m_category_"
        );
      });

      it("startKey", () => {
        expect(MonthCategory.endKey("111-111-111-111")).toBe(
          "b_111-111-111-111_m_category_\uffff"
        );
      });

      it("prefix", () => {
        expect(MonthCategory.prefix("111-111-111-111")).toBe(
          "b_111-111-111-111_m_category_"
        );
      });

      describe("contains", () => {
        it("is true if _id is of budget and is MonthCategory", () => {
          let moCat = MonthCategory.from(
            "111-111-111-111",
            "201501",
            "333-333-333-333"
          );

          expect(
            MonthCategory.contains("111-111-111-111", moCat.data._id)
          ).toBe(true);
        });

        it("is false if _id is of other budget and is MonthCategory", () => {
          let moCat = MonthCategory.from(
            "111-111-111-111",
            "201501",
            "333-333-333-333"
          );

          expect(
            MonthCategory.contains("222-222-222-222", moCat.data._id)
          ).toBe(false);
        });

        it("is false if _id is of budget and is MonthCategory", () => {
          const Transaction = transaction("111-111-111-111"),
            trans = new Transaction();

          expect(
            MonthCategory.contains("111-111-111-111", trans.data._id)
          ).toBe(false);
        });

        // Explicit coverage test
        it("is false if _id is greater than", () => {
          expect(MonthCategory.contains("111-111-111-111", "aaa")).toBe(false);
        });

        // Explicit coverage test
        it("is false if _id is less than", () => {
          expect(MonthCategory.contains("111-111-111-111", "zzz")).toBe(false);
        });
      });
    });
    it("is a Budget", () => {
      let sets = MonthCategory.from(
        "111-111-111-111",
        "201501",
        "333-333-333-333"
      );

      expect(sets.constructor.name).toBe("MonthCategory");
    });

    it("creates proper _id", () => {
      let sets = MonthCategory.from(
        "111-111-111-111",
        "201501",
        "333-333-333-333"
      );

      expect(sets._id).toBe(
        "b_111-111-111-111_m_category_201501_333-333-333-333"
      );
    });
  });

  describe("new Budget()", () => {
    it("can take existing settings", () => {
      let sets = new MonthCategory({
        _id: "b_111-111_m_201501_222-222",
        budget: 223,
      });

      expect(sets.budget).toBe(223);
    });

    it("throws if no constructor params", () => {
      expect(() => {
        new MonthCategory();
      }).toThrow();
    });
  });

  describe("set", () => {
    it("budget", () => {
      let sets = new MonthCategory({
        _id: "b_111-111_m_201501_month-category_222-222",
      });

      sets.budget = 123;

      expect(sets.toJSON().budget).toBe(123);
    });

    it("note", () => {
      let sets = new MonthCategory({
        _id: "b_111-111_m_201501_month-category_222-222",
      });

      sets.note = "foobar";

      expect(sets.toJSON().note).toBe("foobar");
      expect(sets.note).toBe("foobar");
    });

    it("overspending", () => {
      let sets = new MonthCategory({
        _id: "b_111-111_m_201501_month-category_222-222",
      });

      sets.overspending = true;

      expect(sets.toJSON().overspending).toBe(true);
      expect(sets.overspending).toBe(true);
    });
  });

  describe("pub/sub", () => {
    it("budget", () => {
      const foo = {
        sub: () => {},
        bdgSub: () => {},
      };

      jest.spyOn(foo, "sub");
      jest.spyOn(foo, "bdgSub");

      let sets = new MonthCategory({
        _id: "b_111-111_m_201501_month-category_222-222",
        budget: 12,
      });

      sets.subscribe(foo.sub);
      sets.subscribeBudget(foo.bdgSub);

      expect(foo.sub).not.toHaveBeenCalled();
      expect(foo.bdgSub).not.toHaveBeenCalled();

      sets.budget = 222;

      expect(foo.sub).toHaveBeenCalledWith(sets);
      expect(foo.bdgSub).toHaveBeenCalledWith(210);
    });

    it("budget does not emit event if the same", () => {
      const foo = {
        sub: () => {},
        bdgSub: () => {},
      };

      jest.spyOn(foo, "sub");
      jest.spyOn(foo, "bdgSub");

      let sets = new MonthCategory({
        _id: "b_111-111_m_201501_month-category_222-222",
        budget: 12,
      });

      sets.subscribe(foo.sub);
      sets.subscribeBudget(foo.bdgSub);

      expect(foo.sub).not.toHaveBeenCalled();
      expect(foo.bdgSub).not.toHaveBeenCalled();

      sets.budget = 12;

      expect(foo.sub).not.toHaveBeenCalled();
      expect(foo.bdgSub).not.toHaveBeenCalled();
    });

    it("note", () => {
      const foo = {
        sub: () => {},
        bdgSub: () => {},
      };

      jest.spyOn(foo, "sub");
      jest.spyOn(foo, "bdgSub");

      let sets = new MonthCategory({
        _id: "b_111-111_m_201501_month-category_222-222",
        note: "foobar",
      });

      sets.subscribe(foo.sub);
      sets.subscribeBudget(foo.bdgSub);

      expect(foo.sub).not.toHaveBeenCalled();
      expect(foo.bdgSub).not.toHaveBeenCalled();

      sets.note = "barfoo";

      expect(foo.sub).toHaveBeenCalledWith(sets);
      expect(foo.bdgSub).not.toHaveBeenCalled();
    });

    it("overspending", () => {
      const foo = {
        sub: () => {},
        bdgSub: () => {},
      };

      jest.spyOn(foo, "sub");
      jest.spyOn(foo, "bdgSub");

      let sets = new MonthCategory({
        _id: "b_111-111_m_201501_month-category_222-222",
        overspending: true,
      });

      sets.subscribe(foo.sub);
      sets.subscribeBudget(foo.bdgSub);

      expect(foo.sub).not.toHaveBeenCalled();
      expect(foo.bdgSub).not.toHaveBeenCalled();

      sets.overspending = false;

      expect(foo.sub).toHaveBeenCalledWith(sets);
      expect(foo.bdgSub).not.toHaveBeenCalled();
    });
  });
});
