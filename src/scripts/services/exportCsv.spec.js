describe('exportCsv', function() {
  let exportCsv;

  beforeEach(angular.mock.module('financier'));

  beforeEach(inject(_exportCsv_ => {
    exportCsv = _exportCsv_;
  }));

  describe('_buildTransactionsCsv', () => {
    it('works with no transactions', () => {
      expect(exportCsv._buildTransactionsCsv([])).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
,,,,,,,,,,`
      );
    });
  });
});
