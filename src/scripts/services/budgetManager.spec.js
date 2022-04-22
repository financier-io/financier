describe("budgetManager", function () {
  let db, budgetManager, month, account, Month, Account;

  // a random budget uuid to test with
  const UUID = "555-555-555-555";

  beforeEach(
    angular.mock.module("financier", (dbProvider) => {
      dbProvider.adapter = "memory";
    })
  );

  beforeEach(inject((_db_, _budgetManager_, _month_, _account_) => {
    db = _db_;
    budgetManager = _budgetManager_;
    month = _month_;
    account = _account_;

    Month = month(UUID);
    Account = account(UUID);
  }));

  afterEach(() => {
    return db._pouch.destroy();
  });

  it("should return a function", () => {
    expect(typeof budgetManager).toBe("function");
  });

  describe("budget", () => {
    let budget;

    beforeEach(() => {
      budget = budgetManager(db._pouch, UUID);
    });

    it("should return an object", () => {
      expect(typeof budget).toBe("object");
    });

    describe("all", () => {
      it("should return with Months", async () => {
        await db._pouch.bulkDocs([
          {
            _id:
              "b_555-555-555-555_month_" + Month.createID(new Date("1/1/15")),
          },
          {
            _id:
              "b_555-555-555-555_month_" + Month.createID(new Date("2/1/15")),
          },
          {
            _id:
              "b_555-555-555-555_month_" + Month.createID(new Date("3/1/15")),
          },
        ]);

        const monthManager = await budget.budget();

        expect(monthManager.months.length).toBe(3);

        expect(monthManager.months[0].constructor.name).toBe("Month");
        expect(monthManager.months[1].constructor.name).toBe("Month");
        expect(monthManager.months[2].constructor.name).toBe("Month");
      });

      it("should update database", () => {
        return db._pouch
          .bulkDocs([
            {
              _id:
                "b_555-555-555-555_month_" + Month.createID(new Date("1/1/15")),
            },
            {
              _id:
                "b_555-555-555-555_month_" + Month.createID(new Date("2/1/15")),
            },
            {
              _id:
                "b_555-555-555-555_month_" + Month.createID(new Date("3/1/15")),
            },
          ])
          .then(() => {
            return budget.budget().then((monthManager) => {
              monthManager.months[0].setBudget("123", 323);

              return db._pouch
                .get(`b_${UUID}_m_category_${monthManager.months[0].date}_123`)
                .then((item) => {
                  expect(item.budget).toBe(323);
                });
            });
          });
      });

      it("put", () => {
        return budget
          .put(
            new Account({
              name: "myNewAccount",
              type: "CREDIT",
            })
          )
          .then(() => {
            return budget.accounts.all().then((accounts) => {
              expect(accounts[0].name).toBe("myNewAccount");
              expect(accounts[0].type).toBe("CREDIT");
              expect(accounts[0].data._id).toBeDefined();
              expect(
                accounts[0].data._id.indexOf("b_555-555-555-555_account_")
              ).toBe(0);
            });
          });
      });
    });
  });

  describe("accounts", () => {
    let budget;

    beforeEach(() => {
      budget = budgetManager(db._pouch, UUID);
    });

    it("should get all that exist", () => {
      return db._pouch
        .bulkDocs([
          {
            _id: "b_555-555-555-555_account_foo",
            name: "foobar",
            type: "CREDIT",
          },
        ])
        .then(() => {
          return budget.accounts.all().then((accounts) => {
            expect(accounts.length).toBe(1);

            expect(accounts[0].constructor.name).toBe("Account");

            expect(accounts[0].data._id).toBe("b_555-555-555-555_account_foo");
            expect(accounts[0].name).toBe("foobar");
            expect(accounts[0].type).toBe("CREDIT");
          });
        });
    });

    it("should update database on name change", () => {
      db._pouch
        .bulkDocs([
          {
            _id: "b_555-555-555-555_account_foo",
            name: "foobar",
            type: "CREDIT",
          },
        ])
        .then(() => {
          return budget.accounts.all().then((accounts) => {
            accounts[0].name = "mynewname";

            return db._pouch.get("b_555-555-555-555_account_foo").then((r) => {
              expect(r.name).toBe("mynewname");
            });
          });
        });
    });
  });

  // describe('categories', () => {

  //   it('should get all that exist', (done) => {
  //     db._pouch.bulkDocs([{
  //       _id: 'category_foo',
  //       name: 'foobar',
  //       type: 'CREDIT'
  //     }]).then(res => {
  //       budget.accounts.all().then(accounts => {
  //         expect(accounts.length).toBe(1);

  //         expect(accounts[0].constructor.name).toBe('Account');

  //         expect(accounts[0].data._id).toBe('account_foo');
  //         expect(accounts[0].name).toBe('foobar');
  //         expect(accounts[0].type).toBe('CREDIT');

  //         done();
  //       });
  //     });
  //   });

  //   it('should update database on type change', (done) => {
  //     db._pouch.bulkDocs([{
  //       _id: 'account_foo',
  //       name: 'foobar',
  //       type: 'CREDIT'
  //     }]).then(res => {
  //       budget.accounts.all().then(accounts => {

  //         accounts[0].type = 'DEBIT';

  //         db._pouch.get('account_foo').then(r => {
  //           expect(r.type).toBe('DEBIT');

  //           done();
  //         });

  //       });
  //     });
  //   });

  //   it('should update database on name change', (done) => {
  //     db._pouch.bulkDocs([{
  //       _id: 'account_foo',
  //       name: 'foobar',
  //       type: 'CREDIT'
  //     }]).then(res => {
  //       budget.accounts.all().then(accounts => {

  //         accounts[0].name = 'mynewname';

  //         db._pouch.get('account_foo').then(r => {
  //           expect(r.name).toBe('mynewname');

  //           done();
  //         });

  //       });
  //     });
  //   });

  //   it('put', done => {
  //     budget.accounts.put(new Account({
  //       name: 'myNewAccount',
  //       type: 'CREDIT'
  //     })).then(() => {
  //       budget.accounts.all().then(accounts => {
  //         expect(accounts[0].name).toBe('myNewAccount');
  //         expect(accounts[0].type).toBe('CREDIT');
  //         expect(accounts[0].data._id).toBeDefined();
  //         expect(accounts[0].data._id.indexOf('account_')).toBe(0);

  //         done();
  //       });
  //     });
  //   });

  // });

  // it('propagateRolling should call startRolling on first Month', (done) => {
  //   budget.budget.getFourMonthsFrom(new Date('3/1/15')).then(months => {
  //     budgetManager.categories.then(categories => {
  //       spyOn(months[0], 'startRolling').and.callThrough();

  //       bdg.propagateRolling(categories, months[0]);

  //       for (var i = 0; i < categories.length; i++) {
  //         expect(months[0].startRolling).toHaveBeenCalledWith(categories[i]._id);
  //       }

  //       done();
  //     });
  //   });
  // });
});
