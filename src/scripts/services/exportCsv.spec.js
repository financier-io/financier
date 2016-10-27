describe('exportCsv', function() {
  let exportCsv, transaction, Transaction;

  beforeEach(angular.mock.module('financier'));

  beforeEach(inject((_exportCsv_, _transaction_) => {
    exportCsv = _exportCsv_;
    transaction = _transaction_;
    Transaction = transaction('123-123-123-123');
  }));

  describe('getFlagColor', () => {
    it('works with unset', () => {
      expect(exportCsv._getFlagColor()).toBeUndefined();
    });

    it('works with red', () => {
      expect(exportCsv._getFlagColor('#ff0000')).toBe('Red');
    });
  });

  describe('_buildTransactionsCsv', () => {
    it('works with no transactions', () => {
      expect(exportCsv._buildTransactionsCsv({
        transactions: []
      })).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
,,,,,,,,,,`
      );
    });

    it('works with one transaction', () => {
      expect(exportCsv._buildTransactionsCsv({
        transactions: [
          new Transaction({
            value: 123
          })
        ]
      })).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
,,,,,,,,$0.00,$1.23,Uncleared`
      );
    });

    it('works with cleared transaction', () => {
      expect(exportCsv._buildTransactionsCsv({
        transactions: [
          new Transaction({
            value: 123,
            cleared: true
          })
        ]
      })).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
,,,,,,,,$0.00,$1.23,Cleared`
      );
    });

    it('works with reconciled transaction', () => {
      expect(exportCsv._buildTransactionsCsv({
        transactions: [
          new Transaction({
            value: 123,
            cleared: true,
            reconciled: true
          })
        ]
      })).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
,,,,,,,,$0.00,$1.23,Reconciled`
      );
    });

    it('formats numbers properly', () => {
      expect(exportCsv._buildTransactionsCsv({
        transactions: [
          new Transaction({
            value: 123,
            cleared: true,
            reconciled: true
          })
        ],
        currencySymbol: '#',
        currencyDigits: 1
      })).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
,,,,,,,,#0.0,#12.3,Reconciled`
      );
    });

    it('gets flag color', () => {
      expect(exportCsv._buildTransactionsCsv({
        transactions: [
          new Transaction({
            flag: '#ff0000'
          })
        ]
      })).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
,Red,,,,,,,$0.00,$0.00,Uncleared`
      );
    });

    it('looks up account name', () => {
      expect(exportCsv._buildTransactionsCsv({
        transactions: [
          new Transaction({
            account: '123'
          })
        ],
        accounts: [{
          id: '123',
          name: 'Test account'
        }]
      })).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
Test account,,,,,,,,$0.00,$0.00,Uncleared`
      );
    });

    it('formats date', () => {
      expect(exportCsv._buildTransactionsCsv({
        transactions: [
          new Transaction({
            date: new Date('12/12/12')
          })
        ]
      })).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
,,12/12/12,,,,,,$0.00,$0.00,Uncleared`
      );
    });

    it('formats payee', () => {
      expect(exportCsv._buildTransactionsCsv({
        transactions: [
          new Transaction({
            payee: '123'
          })
        ],
        payees: {
          123: {
            name: 'New payee'
          }
        }
      })).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
,,,New payee,,,,,$0.00,$0.00,Uncleared`
      );
    });

    it('sets memo', () => {
      expect(exportCsv._buildTransactionsCsv({
        transactions: [
          new Transaction({
            memo: 'My memo'
          })
        ]
      })).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
,,,,,,,My memo,$0.00,$0.00,Uncleared`
      );
    });

    it('sets memo', () => {
      expect(exportCsv._buildTransactionsCsv({
        transactions: [
          new Transaction({
            memo: 'My memo'
          })
        ]
      })).toEqual(
`Account,Flag,Date,Payee,Category Group/Category,Category Group,Category,Memo,Outflow,Inflow,Cleared\r
,,,,,,,My memo,$0.00,$0.00,Uncleared`
      );
    });
  });
});
