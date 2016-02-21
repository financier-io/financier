describe('Account', function() {
  let Account;

  beforeEach(module('financier'));

  beforeEach(inject(_Account_ => {
    Account = _Account_;
  }));

  describe('new Account()', () => {
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

    it('prefixes _id in data with "account_"', () => {
      let acc = new Account();

      expect(acc.data._id.indexOf('account_')).toEqual(0);
    });
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
