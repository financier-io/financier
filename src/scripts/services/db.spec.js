describe("db", function () {
  let db /*, Budget */;

  beforeEach(
    angular.mock.module("financier", (dbProvider) => {
      dbProvider.adapter = "memory";
    }),
  );

  beforeEach(inject((_db_ /* _Budget_ */) => {
    db = _db_;
    // Budget = _Budget_;
  }));

  it("should return an object", () => {
    expect(typeof db).toBe("object");
  });

  describe("budgets", () => {
    it("should return an object", () => {
      expect(typeof db.budgets).toBe("object");
    });

    it("all() should return empty array", async () => {
      const res = await db.budgets.all();

      expect(Array.isArray(res)).toBe(true);

      expect(res.length).toBe(0);
    });

    it("all() should return budgets", async () => {
      await db._pouch.bulkDocs([
        {
          _id: "budget_1234",
        },
        {
          _id: "budget_2345",
        },
      ]);

      const res = await db.budgets.all();

      expect(res[0].constructor.name).toBe("Budget");
      expect(res[0]._id).toBe("budget_1234");
      expect(res[1]._id).toBe("budget_2345");
    });

    // eslint-disable-next-line vitest/no-commented-out-tests
    // it("put() should add budget", async () => {
    //   const b = new Budget();

    //   await db.budgets.put(b);
    //   const res = await db._pouch.allDocs({
    //     include_docs: true,
    //     startkey: "budget_",
    //     endkey: "budget_\uffff",
    //   });
    //   // expect(res.rows[0].id).toBe(b._id);
    //   expect(res.rows[0].doc).toBe(b.toJSON());
    // });
  });
});
