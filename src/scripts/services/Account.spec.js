describe('account', function() {
  let account, Account;

  beforeEach(module('financier'));

  beforeEach(inject(_account_ => {
    account = _account_;

    Account = account('111-111-111-111');
  }));

  describe('new Account()', () => {
    describe('static methods', () => {
      it('startKey', () => {
        expect(Account.startKey).toBe('b_111-111-111-111_account_');
      });
      it('startKey', () => {
        expect(Account.endKey).toBe('b_111-111-111-111_account_\uffff');
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
      expect(acc.name).toBe('New account');
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
});
