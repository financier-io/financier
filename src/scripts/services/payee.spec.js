describe("payee", function () {
  let payeeService, Payee, Transaction;

  beforeEach(angular.mock.module("financier"));

  beforeEach(inject((_payee_, _transaction_) => {
    payeeService = _payee_;

    Payee = payeeService("111-111-111-111");
    Transaction = _transaction_("111-111-111-111");
  }));

  describe("new Payee()", () => {
    describe("static property", () => {
      it("startKey", () => {
        expect(Payee.startKey).toBe("b_111-111-111-111_payee_");
      });

      it("startKey", () => {
        expect(Payee.endKey).toBe("b_111-111-111-111_payee_\uffff");
      });

      it("prefix", () => {
        expect(Payee.prefix).toBe("b_111-111-111-111_payee_");
      });

      describe("contains", () => {
        it("is true if _id is of budget and is payee", () => {
          const payee = new Payee();

          expect(Payee.contains(payee.data._id)).toBe(true);
        });

        it("is false if _id is of other budget and is payee", () => {
          const OtherBudgetPayee = payeeService("222-222-222-222"),
            payee = new OtherBudgetPayee();

          expect(Payee.contains(payee.data._id)).toBe(false);
        });

        it("is false if _id is of transaction and is payee", () => {
          const payee = new Payee();

          expect(Transaction.contains(payee.data._id)).toBe(false);
        });

        // Explicit coverage test
        it("is false if _id is greater than", () => {
          expect(Payee.contains("aaa")).toBe(false);
        });

        // Explicit coverage test
        it("is false if _id is less than", () => {
          expect(Payee.contains("zzz")).toBe(false);
        });
      });
    });

    it("can take an existing database document", () => {
      let payee = new Payee({
        name: "Apple",
        autosuggest: false,
      });

      expect(payee.constructor.name).toBe("Payee");
    });

    it("can take no constructor params", () => {
      let payee = new Payee();

      expect(payee.constructor.name).toBe("Payee");
    });

    it("exposes default name and autosuggest", () => {
      let payee = new Payee();

      expect(payee.name).toBe(null);
      expect(payee.data._id).toBeDefined(); // randomly generated if not provided
      expect(payee.autosuggest).toBe(true);
    });

    it("generates _id if none exists", () => {
      let payee = new Payee();

      expect(payee.data._id).toBeDefined();
    });

    it("uses existing _id if exists", () => {
      let payee = new Payee({
        _id: "myid",
      });

      expect(payee.data._id).toBe("myid");
    });

    it("prefixes _id properly", () => {
      let payee = new Payee();

      expect(payee.data._id.indexOf("b_111-111-111-111_payee_")).toEqual(0);
    });

    it("sets id properly", () => {
      let payee = new Payee({
        _id: "b_111-111-111-111_payee_123-123-123-123",
      });

      expect(payee.id).toBe("123-123-123-123");
    });
  });

  it("can be removed", () => {
    const foo = {
      change: () => {},
    };

    jest.spyOn(foo, "change");

    let payee = new Payee();

    payee.subscribe(foo.change);

    expect(foo.change).not.toHaveBeenCalled();
    expect(payee.toJSON()._deleted).not.toBeDefined();

    payee.remove();

    expect(foo.change).toHaveBeenCalledWith(payee);
    expect(payee.toJSON()._deleted).toBe(true);
  });

  describe("set", () => {
    it("name", () => {
      let payee = new Payee({
        name: "My payee",
      });

      expect(payee.toJSON().name).toBe("My payee");

      payee.name = "My custom name";

      expect(payee.toJSON().name).toBe("My custom name");
    });

    it("autosuggest", () => {
      let payee = new Payee({
        autosuggest: true,
      });

      expect(payee.toJSON().autosuggest).toBe(true);

      payee.autosuggest = false;

      expect(payee.toJSON().autosuggest).toBe(false);
    });
  });

  describe("pub/sub", () => {
    it("name", () => {
      const foo = {
        change: () => {},
      };

      jest.spyOn(foo, "change");

      let payee = new Payee({
        name: "My payee",
      });

      payee.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      payee.name = "My custom name";

      expect(foo.change).toHaveBeenCalledWith(payee);
    });

    it("autosuggest", () => {
      const foo = {
        change: () => {},
      };

      jest.spyOn(foo, "change");

      let payee = new Payee({
        autosuggest: true,
      });

      payee.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      payee.autosuggest = false;

      expect(foo.change).toHaveBeenCalledWith(payee);
    });
  });
});
