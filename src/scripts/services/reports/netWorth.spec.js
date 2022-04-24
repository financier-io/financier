describe("netWorth", function () {
  let netWorth, transaction, Transaction;

  beforeEach(angular.mock.module("financier"));

  beforeEach(inject((_netWorth_, _transaction_) => {
    netWorth = _netWorth_;
    transaction = _transaction_;

    Transaction = transaction("111-111-111-111");
  }));

  describe("function", () => {
    it("returns expected object schema", () => {
      const report = netWorth([]);

      expect(report).toEqual({
        assets: [],
        debt: [],
        netWorth: [],
        months: [],
      });
    });

    it("generates a report", () => {
      const report = netWorth([
        new Transaction({
          date: "2012-12-12T06:00:00.000Z",
          value: 12,
          account: "123",
        }),
        new Transaction({
          date: "2013-01-01T06:00:00.000Z",
          value: -500,
          account: "321",
        }),
        new Transaction({
          date: "2013-01-01T06:00:00.000Z",
          value: 100,
          account: "123",
        }),
        new Transaction({
          date: "2013-04-01T06:00:00.000Z",
          value: 150,
          account: "123",
        }),
      ]);

      expect(report.assets).toEqual([12, 112, 112, 112, 262]);
      expect(report.debt).toEqual([0, 500, 500, 500, 500]);
      expect(report.netWorth).toEqual([12, -388, -388, -388, -238]);
      expect(report.months.length).toEqual(5);
    });
  });
});
