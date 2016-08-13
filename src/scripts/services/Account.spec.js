describe('account', function() {
  let account, Account, transaction, Transaction;

  beforeEach(angular.mock.module('financier'));

  beforeEach(inject((_account_, _transaction_) => {
    account = _account_;
    transaction = _transaction_;

    Account = account('111-111-111-111');
    Transaction = transaction('111-111-111-111');
  }));

  describe('new Account()', () => {

    describe('static property', () => {
      it('startKey', () => {
        expect(Account.startKey).toBe('b_111-111-111-111_account_');
      });

      it('startKey', () => {
        expect(Account.endKey).toBe('b_111-111-111-111_account_\uffff');
      });

      it('prefix', () => {
        expect(Account.prefix).toBe('b_111-111-111-111_account_');
      });

      describe('contains', () => {
        it('is true if _id is of budget and is account', () => {
          const acc = new Account();

          expect(Account.contains(acc.data._id)).toBe(true);
        });

        it('is false if _id is of other budget and is account', () => {
          const OtherBudgetAccount = account('222-222-222-222'),
            acc = new OtherBudgetAccount();

          expect(Account.contains(acc.data._id)).toBe(false);
        });

        it('is false if _id is of budget and is account', () => {
          const trans = new Transaction();

          expect(Account.contains(trans.data._id)).toBe(false);
        });

        // Explicit coverage test
        it('is false if _id is greater than', () => {
          expect(Account.contains('aaa')).toBe(false);
        });

        // Explicit coverage test
        it('is false if _id is less than', () => {
          expect(Account.contains('zzz')).toBe(false);
        });
      });
    });

    it('can take an existing database document', () => {
      let acc = new Account({
        name: 'My account',
        type: 'CREDIT'
      });

      expect(acc.constructor.name).toBe('Account');
    });

    it('can take no constructor params', () => {
      let acc = new Account();

      expect(acc.constructor.name).toBe('Account');
    });

    it('exposes default name and type', () => {
      let acc = new Account();

      expect(acc.type).toBe('DEBIT');
      expect(acc.data._id).toBeDefined(); // randomly generated if not provided
      expect(acc.name).toBe(null);
    });

    it('generates _id if none exists', () => {
      let acc = new Account();

      expect(acc.data._id).toBeDefined();
    });

    it('uses existing _id if exists', () => {
      let acc = new Account({
        _id: 'myid'
      });

      expect(acc.data._id).toBe('myid');
    });

    it('prefixes _id properly', () => {
      let acc = new Account();

      expect(acc.data._id.indexOf('b_111-111-111-111_account_')).toEqual(0);
    });

    it('sets id properly', () => {
      let acc = new Account({
        _id: 'b_111-111-111-111_account_123-123-123-123'
      });

      expect(acc.id).toBe('123-123-123-123');
    });

    it('has 0 balance by default', () => {
      const acc = new Account();

      expect(acc.balance).toBe(0);
    });
  });

  it('can be removed', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let acc = new Account({
        type: 'CREDIT'
      });

      acc.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();
      expect(acc.toJSON()._deleted).not.toBeDefined();

      acc.remove();

      expect(foo.change).toHaveBeenCalledWith(acc);
      expect(acc.toJSON()._deleted).toBe(true);

  });

  describe('set', () => {
    it('name', () => {
      let acc = new Account({
        name: 'My account'
      });

      acc.name = 'My custom name';

      expect(acc.toJSON().name).toBe('My custom name');
    });

    it('type', () => {
      let acc = new Account({
        type: 'CREDIT'
      });

      acc.type = 'DEBIT';

      expect(acc.toJSON().type).toBe('DEBIT');
    });
  });

  describe('pub/sub', () => {

    it('name', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let acc = new Account({
        name: 'My account'
      });

      acc.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      acc.name = 'My custom name';

      expect(foo.change).toHaveBeenCalledWith(acc);
    });

    it('type', () => {
      const foo = {
        change: () => {},
      };

      spyOn(foo, 'change');

      let acc = new Account({
        type: 'CREDIT'
      });

      acc.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      acc.type = 'DEBIT';

      expect(foo.change).toHaveBeenCalledWith(acc);
    });
  });

  describe('_changeClearedBalance', () => {
    it('changes the cleared balance by a given amount', () => {
      const acc = new Account();

      acc._changeClearedBalance(20);

      expect(acc.cache.clearedBalance).toBe(20);

      acc._changeClearedBalance(-35);

      expect(acc.cache.clearedBalance).toBe(-15);
    });
  });

  describe('_changeUnclearedBalance', () => {
    it('changes the uncleared balance by a given amount', () => {
      const acc = new Account();

      acc._changeUnclearedBalance(20);

      expect(acc.cache.unclearedBalance).toBe(20);

      acc._changeUnclearedBalance(-35);

      expect(acc.cache.unclearedBalance).toBe(-15);
    });
  });

  describe('addTransaction', () => {
    it('changes the balance correctly when added', () => {
      const acc = new Account(),
        trans = new Transaction({
        value: 123
      });
      acc.addTransaction(trans);

      expect(acc.balance).toBe(123);
    });

    it('changes the balance correctly upon future changes', () => {
      const acc = new Account(),
        trans = new Transaction({
        value: 123
      });
      acc.addTransaction(trans);

      expect(acc.balance).toBe(123);

      trans.value = 400;

      expect(acc.balance).toBe(400);
    });
  });

  describe('removeTransaction', () => {
    it('changes the balance correctly when removed', () => {
      const acc = new Account(),
        trans = new Transaction({
        value: 123
      });

      acc.addTransaction(trans);
      acc.removeTransaction(trans);

      expect(acc.balance).toBe(0);
    });
  });
});
