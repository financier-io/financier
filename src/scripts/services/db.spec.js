describe('db', function() {
  let db, Month, Account;

  beforeEach(module('financier', dbProvider => {
    dbProvider.adapter = 'memory';
  }));

  beforeEach(inject((_db_, _Month_, _Account_) => {
    db = _db_;
    Month = _Month_;
    Account = _Account_;
  }));

  afterEach((done) => {
    db._pouch.destroy()
    .then(() => {
      done();
    });
  });


  it('should return an object', () => {
    expect(typeof db).toBe('object');
  });

});
