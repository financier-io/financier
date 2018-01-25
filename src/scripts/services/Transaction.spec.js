describe('transaction', function () {
  let transaction, splitTransaction, account;

  beforeEach(angular.mock.module('financier'));

  beforeEach(inject((_transaction_, _splitTransaction_, _account_) => {
    transaction = _transaction_;
    splitTransaction = _splitTransaction_;
    account = _account_;
  }));

  it('is a function', () => {
    expect(typeof transaction).toBe('function');
  });

  describe('static methods', () => {
    let Transaction;

    beforeEach(() => {
      Transaction = transaction('123-123-123-123');
    });

    it('startKey', () => {
      expect(Transaction.startKey).toBe('b_123-123-123-123_transaction_');
    });

    it('startKey', () => {
      expect(Transaction.endKey).toBe('b_123-123-123-123_transaction_\uffff');
    });

    it('prefix', () => {
      expect(Transaction.prefix).toBe('b_123-123-123-123_transaction_');
    });

    describe('contains', () => {
      it('is true if _id is of budget and is Transaction', () => {
        const trans = new Transaction();

        expect(Transaction.contains(trans.data._id)).toBe(true);
      });

      it('is false if _id is of other budget and is Transaction', () => {
        const OtherBudgetTransaction = transaction('222-222-222-222'),
          trans = new OtherBudgetTransaction();

        expect(Transaction.contains(trans.data._id)).toBe(false);
      });

      it('is false if _id is of budget and is Transaction', () => {
        const Account = account('123-123-123-123'),
          acc = new Account();

        expect(Transaction.contains(acc.data._id)).toBe(false);
      });

      // Explicit coverage test
      it('is false if _id is greater than', () => {
        expect(Transaction.contains('aaa')).toBe(false);
      });

      // Explicit coverage test
      it('is false if _id is less than', () => {
        expect(Transaction.contains('zzz')).toBe(false);
      });
    });
  });

  it('takes a budgetId and returns Transaction', () => {
    const Transaction = transaction('123-123-123-123');
    const tran = new Transaction({
      value: 0
    });

    expect(tran.constructor.name).toBe('Transaction');
  });

  describe('new transaction()', () => {
    let Transaction;

    beforeEach(() => {
      Transaction = transaction('111-111-111-111');
    });

    it('can take an existing database document', () => {
      let tran = new Transaction({
        value: 123,
        _id: 'b_123-123-123-123_transaction_321-321-321-321'
      });

      expect(tran.constructor.name).toBe('Transaction');
    });

    it('can create default id', () => {
      let tran = new Transaction({
        value: 0
      });

      expect(tran._id.indexOf('b_111-111-111-111_transaction_')).toBe(0);
    });

    it('uses existing _id if exists', () => {
      let tran = new Transaction({
        _id: 'b_123-123-123-123_transaction_321-321-321-321'
      });

      expect(tran._id).toBe('b_123-123-123-123_transaction_321-321-321-321');
    });
  });

  describe('date', () => {
    let Transaction;

    beforeEach(() => {
      Transaction = transaction('111-111-111-111');
    });

    it('can be set', () => {
      const tran = new Transaction();
      const d = new Date('2012-12-12T06:00:00.000Z');

      tran.date = d;

      expect(tran.date).toBe(d);
      expect(tran.data.date).toBe('2012-12-12');
    });

    it('zeroes out timezone', () => {
      // for backward compatibility when dates were toUTCString()'d instead of 'yyyy-mm-dd'
      const tran = new Transaction({
        date: '2012-12-12T06:00:00.000Z'
      });

      expect(tran.date.toISOString().indexOf('2012-12-12')).toBe(0);
    });

    it('can be set from record', () => {
      const tran = new Transaction({
        date: '2012-12-12T12:00:00.000Z'
      });

      expect(angular.isDate(tran.date)).toBe(true);
      expect(tran.date.toISOString().indexOf('2012-12-12')).toBe(0);
      expect(tran.data.date.indexOf('2012-12-12')).toBe(0);
    });
  });

  describe('inflow', () => {
    let Transaction;

    beforeEach(() => {
      Transaction = transaction('111-111-111-111');
    });

    it('sets value', () => {
      const tran = new Transaction();

      tran.inflow = 123;

      expect(tran.inflow).toBe(123);
      expect(tran.value).toBe(123);
      expect(tran.data.value).toBe(123);
    });

    it('is undefined with negative value', () => {
      const tran = new Transaction();

      tran.value = -123;

      expect(tran.inflow).toBeUndefined();
      expect(tran.data.inflow).toBeUndefined();
    });

    it('calls subscriber', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      const tran = new Transaction();

      tran.subscribeValueChange(foo.change);

      tran.inflow = 123;

      expect(foo.change).toHaveBeenCalledWith(123);
    });
  });

  describe('outflow', () => {
    let Transaction;

    beforeEach(() => {
      Transaction = transaction('111-111-111-111');
    });

    it('sets value', () => {
      const tran = new Transaction();

      tran.outflow = 123;

      expect(tran.outflow).toBe(123);
      expect(tran.value).toBe(-123);
      expect(tran.data.value).toBe(-123);
    });

    it('is undefined with postive value', () => {
      const tran = new Transaction();

      tran.value = 123;

      expect(tran.outflow).toBeUndefined();
      expect(tran.data.outflow).toBeUndefined();
    });

    it('calls subscriber', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      const tran = new Transaction();

      tran.subscribeValueChange(foo.change);

      tran.outflow = 123;

      expect(foo.change).toHaveBeenCalledWith(-123);
    });
  });

  it('can be removed', () => {
      const Transaction = transaction('111-111-111-111');

      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction({
        _id: 'foo'
      });

      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();
      expect(tran.toJSON()._deleted).not.toBeDefined();

      tran.remove();

      expect(foo.change).toHaveBeenCalledWith(tran);
      expect(tran.toJSON()._deleted).toBe(true);
  });

  describe('_emitValueChange', () => {
    let Transaction;

    beforeEach(() => {
      Transaction = transaction('111-111-111-111');
    });

    it('send a value to the value subscriber', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribeValueChange(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      tran._emitValueChange(1313);

      expect(foo.change).toHaveBeenCalledWith(1313);
    });
  });

  describe('pub/sub value', () => {
    let Transaction;

    beforeEach(() => {
      Transaction = transaction('111-111-111-111');
    });

    it('value', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribeValueChange(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      tran.value = 1233;

      expect(foo.change).toHaveBeenCalledWith(1233);

      tran.value = 1000;

      expect(foo.change).toHaveBeenCalledWith(-233);
    });
  });

  describe('subscribeClearedValueChange subscription', () => {
    let Transaction;

    beforeEach(() => {
      Transaction = transaction('111-111-111-111');
    });

    it('emits when transaction is cleared and value changes', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.cleared = true;

      tran.subscribeClearedValueChange(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      tran.value = 123;

      expect(foo.change).toHaveBeenCalledWith(123);
    });

    it('emits when transaction changes cleared to uncleared', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.cleared = true;
      tran.value = 123;
      tran.subscribeClearedValueChange(foo.change);

      tran.cleared = false;

      expect(foo.change).toHaveBeenCalledWith(-123);
    });

    it('emits when transaction changes uncleared to cleared', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.cleared = false;
      tran.value = 123;
      tran.subscribeClearedValueChange(foo.change);

      tran.cleared = true;

      expect(foo.change).toHaveBeenCalledWith(123);
    });

    it('does not emit when transaction is uncleared and value changes', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.cleared = false;

      tran.subscribeClearedValueChange(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      tran.value = 123;

      expect(foo.change).not.toHaveBeenCalled();
    });

    it('emits to multiple subscribers', () => {
      const foo = {
        change1: () => {},
        change2: () => {}
      };

      spyOn(foo, 'change1');
      spyOn(foo, 'change2');

      let tran = new Transaction();
      tran.cleared = true;

      tran.subscribeClearedValueChange(foo.change1);
      tran.subscribeClearedValueChange(foo.change2);

      expect(foo.change1).not.toHaveBeenCalled();
      expect(foo.change2).not.toHaveBeenCalled();

      tran.value = 123;

      expect(foo.change1).toHaveBeenCalledWith(123);
      expect(foo.change2).toHaveBeenCalledWith(123);
    });

    it('can unsubscribe', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.cleared = true;

      tran.subscribeClearedValueChange(foo.change);
      tran.unsubscribeClearedValueChange(foo.change);

      tran.value = 123;

      expect(foo.change).not.toHaveBeenCalled();
    });

    it('throws if unsubscriber does not exist', () => {
      let tran = new Transaction();

      expect(() => {
        tran.unsubscribeClearedValueChange(angular.noop);
      }).toThrow();
    });
  });

  describe('subscribeUnclearedValueChange subscription', () => {
    let Transaction;

    beforeEach(() => {
      Transaction = transaction('111-111-111-111');
    });

    it('emits when transaction is uncleared and value changes', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.cleared = false;

      tran.subscribeUnclearedValueChange(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      tran.value = 123;

      expect(foo.change).toHaveBeenCalledWith(123);
    });

    it('emits when transaction changes cleared to uncleared', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.cleared = true;
      tran.value = 123;
      tran.subscribeUnclearedValueChange(foo.change);

      tran.cleared = false;

      expect(foo.change).toHaveBeenCalledWith(123);
    });

    it('emits when transaction changes uncleared to cleared', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.cleared = false;
      tran.value = 123;
      tran.subscribeUnclearedValueChange(foo.change);

      tran.cleared = true;

      expect(foo.change).toHaveBeenCalledWith(-123);
    });

    it('does not emit when transaction is cleared and value changes', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.cleared = true;

      tran.subscribeUnclearedValueChange(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      tran.value = 123;

      expect(foo.change).not.toHaveBeenCalled();
    });

    it('emits to multiple subscribers', () => {
      const foo = {
        change1: () => {},
        change2: () => {}
      };

      spyOn(foo, 'change1');
      spyOn(foo, 'change2');

      let tran = new Transaction();
      tran.cleared = false;

      tran.subscribeUnclearedValueChange(foo.change1);
      tran.subscribeUnclearedValueChange(foo.change2);

      expect(foo.change1).not.toHaveBeenCalled();
      expect(foo.change2).not.toHaveBeenCalled();

      tran.value = 123;

      expect(foo.change1).toHaveBeenCalledWith(123);
      expect(foo.change2).toHaveBeenCalledWith(123);
    });

    it('can unsubscribe', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.cleared = false;

      tran.subscribeUnclearedValueChange(foo.change);
      tran.unsubscribeUnclearedValueChange(foo.change);

      tran.value = 123;

      expect(foo.change).not.toHaveBeenCalled();
    });

    it('throws if unsubscriber does not exist', () => {
      let tran = new Transaction();

      expect(() => {
        tran.unsubscribeUnclearedValueChange(angular.noop);
      }).toThrow();
    });
  });

  describe('pub/sub', () => {
    let Transaction;

    beforeEach(() => {
      Transaction = transaction('111-111-111-111');
    });

    it('value', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.toJSON().value).toBe(0);

      tran.value = 1233;

      expect(tran.toJSON().value).toBe(1233);
      expect(foo.change).toHaveBeenCalledWith(tran);
    });

    it('account', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.toJSON().account).toBe(null);

      tran.account = 'my_account_id';

      expect(tran.toJSON().account).toBe('my_account_id');
      expect(foo.change).toHaveBeenCalledWith(tran);
    });

    it('memo', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.toJSON().memo).toBe(null);

      tran.memo = 'my_memo';

      expect(tran.toJSON().memo).toBe('my_memo');
      expect(foo.change).toHaveBeenCalledWith(tran);
    });

    it('cleared', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.toJSON().cleared).toBe(false);

      tran.cleared = false;

      expect(foo.change).not.toHaveBeenCalled();

      tran.cleared = true;

      expect(tran.toJSON().cleared).toBe(true);
      expect(foo.change).toHaveBeenCalledWith(tran);
    });

    it('flag', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.toJSON().flag).toBe(null);

      tran.flag = '#ff0000';

      expect(tran.toJSON().flag).toBe('#ff0000');
      expect(tran.flag).toBe('#ff0000');
      expect(foo.change).toHaveBeenCalledWith(tran);
    });

    it('category', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.category).toBe(null);
      expect(tran.toJSON().category).toBe(null);

      tran.category = '123-123-123-123';

      expect(tran.toJSON().category).toBe('123-123-123-123');
      expect(tran.category).toBe('123-123-123-123');
      expect(foo.change).toHaveBeenCalledWith(tran);
    });

    it('account', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.account).toBe(null);
      expect(tran.toJSON().account).toBe(null);

      tran.account = '123-123-123-123';

      expect(tran.toJSON().account).toBe('123-123-123-123');
      expect(tran.account).toBe('123-123-123-123');
      expect(foo.change).toHaveBeenCalledWith(tran);
    });

    it('memo', () => {
      const foo = {
        change: () => {}
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.memo).toBe(null);
      expect(tran.toJSON().memo).toBe(null);

      tran.memo = '123-123-123-123';

      expect(tran.toJSON().memo).toBe('123-123-123-123');
      expect(tran.memo).toBe('123-123-123-123');
      expect(foo.change).toHaveBeenCalledWith(tran);
    });

    it('cannot set _id', () => {
      let tran = new Transaction({
        _id: 'foobar'
      });

      tran._id = 123;
      expect(tran._id).not.toBe(123);
    });
  });

  
  describe('split transactions', () => {
    let Transaction;
    let SplitTransaction;

    beforeEach(() => {
      Transaction = transaction('111-111-111-111');
      SplitTransaction = splitTransaction('111-111-111-111');
    });

    it('can have splits', () => {
      const trans = new Transaction({
        value: 123,
        _id: 'b_123-123-123-123_transaction_321-321-321-321',
        splits: [{
          id: 'a',
          category: 'income'
        }]
      });

      expect(trans.splits.length).toBe(1);
      expect(trans.splits[0].constructor.name).toBe('SplitTransaction');

      expect(trans.splits[0].transaction).toBe(trans);
    });

    it('splits should have reference to parent transaction', () => {
      const trans = new Transaction({
        value: 123,
        _id: 'b_123-123-123-123_transaction_321-321-321-321',
        splits: [{
          id: 'a',
          category: 'income'
        }]
      });

      expect(trans.splits[0].transaction).toBe(trans);
    });

    it('can add splits', () => {
      const trans = new Transaction({
        value: 123,
        _id: 'b_123-123-123-123_transaction_321-321-321-321',
        splits: [{
          id: 'a',
          category: 'income'
        }]
      });

      const split = new SplitTransaction(trans);

      trans.splits = [split];

      expect(trans.splits[0].transaction).toBe(trans);
    });

    it('can update splits', () => {
      const trans = new Transaction({
        value: 123,
        _id: 'b_123-123-123-123_transaction_321-321-321-321',
        splits: [{
          id: 'a',
          category: 'income'
        }]
      });

      const split = new SplitTransaction(trans);
      const split1id = split.id;

      spyOn(split, '_emitValueChange');

      const split1dupe = new SplitTransaction(trans, {
        id: split1id,
        value: 123
      });

      trans.splits = [split];

      expect(split._emitValueChange).not.toHaveBeenCalled();
      
      trans.splits = [split1dupe, new SplitTransaction(trans)];

      expect(split._emitValueChange).toHaveBeenCalled();

      expect(split1id).toEqual(split.id);
    });

    it('should serialize splits properly', () => {
      const trans = new Transaction({
        value: 123,
        _id: 'b_123-123-123-123_transaction_321-321-321-321'
      });

      const split = new SplitTransaction(trans, {
        id: 'testid'
      });

      split.memo = 'test 123';

      trans.splits = [split];

      expect(trans.toJSON().splits).toEqual([{
        id: 'testid',
        value: 0,
        category: null,
        memo: 'test 123',
        payee: null,
        transfer: null
      }]);
    });
  });
});
