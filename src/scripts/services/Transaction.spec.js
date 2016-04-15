describe('transaction', function() {
  let transaction;

  beforeEach(module('financier'));

  beforeEach(inject(_transaction_ => {
    transaction = _transaction_;
  }));

  it('is a function', () => {
    expect(typeof transaction).toBe('function');
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
      const d = new Date('12/12/12');

      tran.date = d;

      expect(tran.date).toBe(d);
      expect(tran.data.date).toBe('2012-12-12T06:00:00.000Z');
    });

    it('can be set from record', () => {
      const tran = new Transaction({
        date: '2012-12-12T06:00:00.000Z'
      });

      expect(angular.isDate(tran.date)).toBe(true);
      expect(tran.date.toISOString()).toBe('2012-12-12T06:00:00.000Z');
      expect(tran.data.date).toBe('2012-12-12T06:00:00.000Z');
    });
  });

  it('can be removed', () => {
      const Transaction = transaction('111-111-111-111');

      const foo = {
        change: () => {},
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

  describe('pub/sub', () => {
    let Transaction;

    beforeEach(() => {
      Transaction = transaction('111-111-111-111');
    });

    it('value', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.toJSON().value).toBe(null);

      tran.value = 1233;

      expect(tran.toJSON().value).toBe(1233);
      expect(foo.change).toHaveBeenCalledWith(tran);
    });

    it('account', () => {
      const foo = {
        change: () => {},
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

    it('payee', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.toJSON().payee).toBe(null);

      tran.payee = 'payee_id';

      expect(tran.toJSON().payee).toBe('payee_id');
      expect(foo.change).toHaveBeenCalledWith(tran);
    });

    it('memo', () => {
      const foo = {
        change: () => {},
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
        change: () => {},
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.toJSON().cleared).toBe(false);

      tran.cleared = true;

      expect(tran.toJSON().cleared).toBe(true);
      expect(foo.change).toHaveBeenCalledWith(tran);
    });

    it('flag', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let tran = new Transaction();
      tran.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      expect(tran.toJSON().flag).toBe(false);

      tran.flag = true;

      expect(tran.toJSON().flag).toBe(true);
      expect(foo.change).toHaveBeenCalledWith(tran);
    });


    it('cannot set _id', () => {
      let tran = new Transaction({
        _id: 'foobar'
      });

      expect(() => tran._id = 123).toThrow();
    });
  });
});
