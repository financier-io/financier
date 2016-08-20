describe('PayeeManager', () => {
  let PayeeManager;

  beforeEach(angular.mock.module('financier'));

  beforeEach(inject(_PayeeManager_ => {
    PayeeManager = _PayeeManager_;
  }));

  it('is a PayeeManager', () => {
    let payees = new PayeeManager();

    expect(payees.constructor.name).toBe('PayeeManager');
  });

  describe('add', () => {
    it('ignores non-strings', () => {
      let payees = new PayeeManager();

      expect(payees._payees).toEqual({});

      payees.add({});

      expect(payees._payees).toEqual({});
    });

    it('creates a new payee', () => {
      let payees = new PayeeManager();

      expect(payees._payees).toEqual({});

      payees.add('Payee 1');

      expect(payees._payees).toEqual({
        'Payee 1': 1
      });
    });

    it('increments a payee', () => {
      let payees = new PayeeManager();

      expect(payees._payees).toEqual({});

      payees.add('Payee 1');
      payees.add('Payee 1');

      expect(payees._payees).toEqual({
        'Payee 1': 2
      });
    });
  });

  describe('remove', () => {
    it('ignores non-strings', () => {
      let payees = new PayeeManager();

      expect(payees._payees).toEqual({});

      payees.remove({});

      expect(payees._payees).toEqual({});
    });

    it('decrements a payee', () => {
      let payees = new PayeeManager();

      payees.add('Payee 1');
      payees.add('Payee 1');

      payees.remove('Payee 1');

      expect(payees._payees).toEqual({
        'Payee 1': 1
      });
    });

    it('removes a payee when count <= 1', () => {
      let payees = new PayeeManager();

      payees.add('Payee 1');
      payees.add('Payee 1');

      payees.remove('Payee 1');
      payees.remove('Payee 1');

      expect(payees._payees).toEqual({});
    });

    it('throws if payee does not exist', () => {
      let payees = new PayeeManager();

      expect(() => {
        payees.remove('Payee 1');
      }).toThrow();
    });
  });

  describe('toArray', () => {
    it('returns empty with no payees', () => {
      let payees = new PayeeManager();

      expect(payees.toArray()).toEqual([]);
    });

    it('returns payees', () => {
      let payees = new PayeeManager();

      payees.add('Payee 1');
      payees.add('Payee 2');

      expect(payees.toArray()).toEqual(['Payee 1', 'Payee 2']);
    });

    // This test is not guaranteed not to be a false positive
    it('returns payees sorted', () => {
      let payees = new PayeeManager();

      payees.add('Payee 2');
      payees.add('Payee 1');

      expect(payees.toArray()).toEqual(['Payee 1', 'Payee 2']);
    });
  });
});
