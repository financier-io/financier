describe("Budget", function () {
  let Budget, account;

  beforeEach(angular.mock.module("financier"));

  beforeEach(inject((_Budget_, _account_) => {
    Budget = _Budget_;
    account = _account_;
  }));

  describe("new Budget()", () => {
    describe("static property", () => {
      it("startKey", () => {
        expect(Budget.startKey).toBe("budget_");
      });

      it("startKey", () => {
        expect(Budget.endKey).toBe("budget_\uffff");
      });

      it("prefix", () => {
        expect(Budget.prefix).toBe("budget_");
      });

      describe("contains", () => {
        it("is true if _id is of budget", () => {
          const bdg = new Budget();

          expect(Budget.contains(bdg.data._id)).toBe(true);
        });

        it("is false if _id is not of budget", () => {
          const Account = account("222-222-222-222"),
            acc = new Account();

          expect(Budget.contains(acc.data._id)).toBe(false);
        });

        // Explicit coverage test
        it("is false if _id is greater than", () => {
          expect(Budget.contains("aaa")).toBe(false);
        });

        // Explicit coverage test
        it("is false if _id is less than", () => {
          expect(Budget.contains("zzz")).toBe(false);
        });
      });
    });

    it("is a Budget", () => {
      let sets = new Budget();

      expect(sets.constructor.name).toBe("Budget");
    });
    it("can take existing settings", () => {
      let sets = new Budget({
        hints: {
          outflow: false,
        },
        name: "foobar",
        created: "2016-03-03T03:16:34.882Z",
      });

      expect(sets.hints.outflow).toBe(false);
      expect(sets.name).toBe("foobar");
      expect(sets.created instanceof Date).toBe(true);
      expect(sets.created.toISOString()).toBe("2016-03-03T03:16:34.882Z");
    });

    it("can take no constructor params", () => {
      let sets = new Budget();

      expect(sets.constructor.name).toBe("Budget");

      // should compare *that* second... may cause race conditions :/
      expect(sets.created.toUTCString()).toBe(new Date().toUTCString());
      expect(new Date(sets.toJSON().created).toUTCString()).toBe(
        new Date().toUTCString()
      );
    });

    it("exposes default settings", () => {
      let sets = new Budget();

      expect(sets._id.indexOf("budget_")).toBe(0);
      expect(sets.hints.outflow).toBe(true);
    });

    it("returns id from _id", () => {
      let sets = new Budget({
        _id: "budget_222-222-222-222",
      });

      expect(sets.id).toBe("222-222-222-222");
    });
  });

  it("can be removed", () => {
    const foo = {
      change: () => {},
    };

    jest.spyOn(foo, "change");

    let sets = new Budget();

    sets.subscribe(foo.change);

    expect(foo.change).not.toHaveBeenCalled();
    expect(sets.toJSON()._deleted).not.toBeDefined();

    sets.remove();

    expect(foo.change).toHaveBeenCalledWith(sets);
    expect(sets.toJSON()._deleted).toBe(true);
  });

  describe("set", () => {
    it("hints.outflow", () => {
      let sets = new Budget();

      sets.hints.outflow = false;

      expect(sets.toJSON().hints.outflow).toBe(false);
    });

    it("name", () => {
      let sets = new Budget();

      sets.name = "foobar";

      expect(sets.toJSON().name).toBe("foobar");
    });

    it("cannot set _id", () => {
      let sets = new Budget();

      expect(() => (sets._id = 123)).toThrow(TypeError);
    });

    it("cannot set created", () => {
      let sets = new Budget();

      expect(() => (sets.created = 123)).toThrow(TypeError);
    });
  });

  describe("pub/sub", () => {
    it("hints.outflow", () => {
      const foo = {
        change: () => {},
      };

      jest.spyOn(foo, "change");

      let sets = new Budget({
        hints: {
          outflow: false,
        },
      });

      sets.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      sets.hints.outflow = true;

      expect(foo.change).toHaveBeenCalledWith(sets);
    });

    it("name", () => {
      const foo = {
        change: () => {},
      };

      jest.spyOn(foo, "change");

      let sets = new Budget({
        name: "foobar",
      });

      sets.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      sets.name = "barfoo";

      expect(foo.change).toHaveBeenCalledWith(sets);
    });
  });
});
