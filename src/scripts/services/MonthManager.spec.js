/* eslint-disable vitest/no-commented-out-tests */

describe("category", function () {
  let monthManager, MonthManager, month, Month;

  beforeEach(angular.mock.module("financier"));

  beforeEach(inject((_monthManager_, _month_) => {
    monthManager = _monthManager_;
    month = _month_;
  }));

  it("is a function", () => {
    expect(typeof monthManager).toBe("function");
  });

  describe("MonthManager class", () => {
    beforeEach(() => {
      MonthManager = monthManager("111-111-111-111");
      Month = month("111-111-111-111");
    });

    describe("static properties", () => {
      describe("_diff", () => {
        it("0 for same date", () => {
          const date = new Date("1/1/16");

          expect(MonthManager._diff(date, date)).toBe(0);
        });

        it("1 for next month", () => {
          const first = new Date("1/1/16");
          const second = new Date("2/1/16");

          expect(MonthManager._diff(first, second)).toBe(1);
        });

        it("-1 for previous month", () => {
          const first = new Date("2/1/16");
          const second = new Date("1/1/16");

          expect(MonthManager._diff(first, second)).toBe(-1);
        });

        it("1 for 2/29 => 3/1", () => {
          const first = new Date("2/29/16");
          const second = new Date("3/1/16");

          expect(MonthManager._diff(first, second)).toBe(1);
        });

        it("26 for multiple years", () => {
          const first = new Date("1/1/16");
          const second = new Date("3/1/18");

          expect(MonthManager._diff(first, second)).toBe(26);
        });
      });

      describe("_dateIDToDate", () => {
        it("converts ID to date", () => {
          const date = MonthManager._dateIDToDate("2016-06-07");

          expect(date.getFullYear()).toBe(2016);
          expect(date.getMonth()).toBe(5); // June
          expect(date.getDate()).toBe(1);
        });
      });

      describe("_nextDateID", () => {
        it("Jul => Aug", () => {
          expect(MonthManager._nextDateID("2016-06-01")).toBe("2016-07-01");
        });

        it("Dec => Jan", () => {
          expect(MonthManager._nextDateID("2016-12-01")).toBe("2017-01-01");
        });
      });

      describe("_previousDateID", () => {
        it("Aug => Jul", () => {
          expect(MonthManager._previousDateID("2016-07-01")).toBe("2016-06-01");
        });

        it("Jan => Feb", () => {
          expect(MonthManager._previousDateID("2017-01-01")).toBe("2016-12-01");
        });
      });
    });

    describe("constructor", () => {
      it("adds one month if none provided", () => {
        const someFunction = () => {},
          mm = new MonthManager(undefined, someFunction);

        expect(mm.months.length).toBe(1);
        expect(mm.months[0].date).toBe(Month.createID(new Date()));
        expect(mm.saveFn).toBe(someFunction);
      });

      it("fills month gaps as needed", () => {
        vi.spyOn(MonthManager.prototype, "_fillMonthGaps");

        const mm = new MonthManager();

        expect(MonthManager.prototype._fillMonthGaps).toHaveBeenCalledWith(
          mm.months,
        );
      });

      it("links months properly", () => {
        const spy = vi.spyOn(MonthManager.prototype, "_linkMonths");

        const mm = new MonthManager([
          new Month("2016-05-01"),
          new Month("2016-07-01"),
        ]);

        expect(spy.mock.calls).toEqual([
          [mm.months[0], mm.months[1]],
          [mm.months[1], mm.months[2]],
        ]);
      });
    });

    describe("_fillMonthGaps", () => {
      it("Does not do anything with 0 items", () => {
        const mm = new MonthManager();

        expect(mm._fillMonthGaps([]).length).toBe(0);
      });

      it("Does not do anything with 1 item", () => {
        const mm = new MonthManager(),
          myMonth = new Month("2015-01-01");

        expect(mm._fillMonthGaps([myMonth])[0]).toBe(myMonth);
      });

      it("Throws if months are out of order", () => {
        const mm = new MonthManager();

        expect(() => {
          mm._fillMonthGaps([new Month("2015-02-01"), new Month("2015-01-01")]);
        }).toThrow();
      });

      it("Throws if months are duplicated", () => {
        const mm = new MonthManager();

        expect(() => {
          mm._fillMonthGaps([new Month("2015-02-01"), new Month("2015-02-01")]);
        }).toThrow();
      });

      describe("filling month gaps", () => {
        it("creates appropriate months", () => {
          const mm = new MonthManager();

          expect(
            mm
              ._fillMonthGaps([
                new Month("2016-05-01"),
                new Month("2016-07-01"),
                new Month("2016-08-01"),
                new Month("2017-07-01"),
              ])
              .map((m) => m.date),
          ).toEqual([
            "2016-05-01",
            "2016-06-01",
            "2016-07-01",
            "2016-08-01",
            "2016-09-01",
            "2016-10-01",
            "2016-11-01",
            "2016-12-01",
            "2017-01-01",
            "2017-02-01",
            "2017-03-01",
            "2017-04-01",
            "2017-05-01",
            "2017-06-01",
            "2017-07-01",
          ]);
        });

        it("sets up saveFn", () => {
          const myFn = () => {},
            mm = new MonthManager(undefined, myFn);

          expect(
            mm._fillMonthGaps([
              new Month("2016-05-01"),
              new Month("2016-07-01"),
            ])[1].saveFn,
          ).toBe(myFn);
        });
      });
    });

    describe("getMonth", () => {
      it("gets an existing month", () => {
        const mo = new Month("2016-07-01"),
          mm = new MonthManager([
            new Month("2016-05-01"),
            new Month("2016-06-01"),
            mo,
            new Month("2017-08-01"),
          ]);

        expect(mm.getMonth(new Date("2016-07-02"))).toBe(mo);
        expect(mm.getMonth(new Date("2016-07-02")).date).toEqual("2016-07-01");
      });

      describe("gets a future month", () => {
        it("adds months properly", () => {
          const mm = new MonthManager([new Month("2016-05-01")]);

          mm.getMonth(new Date("2016-07-02"));

          expect(mm.months.map((m) => m.date)).toEqual([
            "2016-05-01",
            "2016-06-01",
            "2016-07-01",
          ]);
        });

        it("returns proper month", () => {
          const mm = new MonthManager([new Month("2016-05-01")]);

          expect(mm.getMonth(new Date("2016-07-02")).date).toBe("2016-07-01");
          expect(mm.getMonth(new Date("2016-07-02"))).toBe(mm.months[2]);
        });

        it("links months", () => {
          const mm = new MonthManager([
            new Month("2016-05-01"),
            new Month("2016-06-01"),
          ]);

          const spy = vi.spyOn(mm, "_linkMonths");

          mm.getMonth(new Date("2016-09-02"));

          expect(spy.mock.calls).toEqual([
            [mm.months[1], mm.months[2]],
            [mm.months[2], mm.months[3]],
            [mm.months[3], mm.months[4]],
          ]);
        });

        it("propagates rolling to new months", () => {
          const mo = new Month("2016-06-01"),
            mm = new MonthManager([new Month("2016-05-01"), mo]);

          vi.spyOn(mm, "_propagateRollingFromMonth");

          mm.getMonth(new Date("2016-09-02"));

          expect(mm._propagateRollingFromMonth).toHaveBeenCalledWith(mo);
        });
      });

      describe("gets a past month", () => {
        it("adds months properly", () => {
          const mm = new MonthManager([new Month("2016-05-01")]);

          mm.getMonth(new Date("2016-03-02"));

          expect(mm.months.map((m) => m.date)).toEqual([
            "2016-03-01",
            "2016-04-01",
            "2016-05-01",
          ]);
        });

        it("returns proper month", () => {
          const mm = new MonthManager([new Month("2016-05-01")]);

          expect(mm.getMonth(new Date("2016-03-02")).date).toBe("2016-03-01");
          expect(mm.getMonth(new Date("2016-03-02"))).toBe(mm.months[0]);
        });

        it("links months", () => {
          const mm = new MonthManager([
            new Month("2016-05-01"),
            new Month("2016-06-01"),
          ]);

          const spy = vi.spyOn(mm, "_linkMonths");

          mm.getMonth(new Date("2016-03-02"));

          expect(spy.mock.calls).toEqual([
            [mm.months[1], mm.months[2]], // 04 => 05
            [mm.months[0], mm.months[1]], // 03 => 04
          ]);
        });

        it("propagates rolling to new months", () => {
          const mo = new Month("2016-06-01"),
            mm = new MonthManager([new Month("2016-05-01"), mo]);

          vi.spyOn(mm, "_propagateRollingFromMonth");

          mm.getMonth(new Date("2016-09-02"));

          expect(mm._propagateRollingFromMonth).toHaveBeenCalledWith(mo);
        });
      });

      it("gets a past month", () => {
        const mm = new MonthManager([new Month("2016-05-01")]);

        vi.spyOn(mm, "_linkMonths");

        expect(mm.getMonth(new Date("2016-02-02"))).toBe(mm.months[0]);
        expect(mm.months.map((m) => m.date)).toEqual([
          "2016-02-01",
          "2016-03-01",
          "2016-04-01",
          "2016-05-01",
        ]);

        expect(mm._linkMonths).toHaveBeenCalledWith(mm.months[0], mm.months[1]);
      });
    });
  });
});

// OLD TESTS FROM BUDGETMANAGER BELOW FOR REFERENCE

// it('should provide Months until specified date', () => {
//   return db._pouch.bulkDocs([{
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('1/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('2/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('3/1/15'))
//   }]).then(res => {
//     return budget.budget.getFourMonthsFrom(new Date('6/1/15')).then(res => {
//       const expectedDates = [
//         '2015-01-01',
//         '2015-02-01',
//         '2015-03-01',
//         '2015-04-01',
//         '2015-05-01',
//         '2015-06-01',
//         '2015-07-01',
//         '2015-08-01',
//         '2015-09-01',
//         '2015-10-01',
//         '2015-11-01'
//       ];

//       expect(res.length).toBe(expectedDates.length);

//       for (var i = 0; i < res.length; i++) {
//         expect(res[i].data._id).toBe('b_555-555-555-555_month_' + expectedDates[i]);
//       }
//     });
//   });
// });

// it('should provide Months before specified date', () => {
//   return db._pouch.bulkDocs([{
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('4/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('5/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('6/1/15'))
//   }]).then(res => {
//     return budget.budget.getFourMonthsFrom(new Date('1/1/15')).then(res => {
//       const expectedDates = [
//         '2015-01-01',
//         '2015-02-01',
//         '2015-03-01',
//         '2015-04-01',
//         '2015-05-01',
//         '2015-06-01'
//       ];

//       expect(res.length).toBe(expectedDates.length);

//       for (var i = 0; i < res.length; i++) {
//         expect(res[i].data._id).toBe('b_555-555-555-555_month_' + expectedDates[i]);
//       }

//     });
//   });
// });

// it('should provide existing if populating to that last month', () => {
//   return db._pouch.bulkDocs([{
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('1/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('2/1/15'))
//   }, {
//     _id: 'b_555-555-555-555_month_' + Month.createID(new Date('3/1/15'))
//   }]).then(res => {
//     return budget.budget.getFourMonthsFrom(new Date('3/1/15')).then(res => {
//       const expectedDates = [
//         '2015-01-01',
//         '2015-02-01',
//         '2015-03-01',
//         '2015-04-01',
//         '2015-05-01',
//         '2015-06-01',
//         '2015-07-01',
//         '2015-08-01'
//       ];

//       expect(res.length).toBe(expectedDates.length);

//       for (var i = 0; i < res.length; i++) {
//         expect(res[i].data._id).toBe('b_555-555-555-555_month_' + expectedDates[i]);
//       }
//     });
//   });
// });

// it('should add that date if none exists in database', () => {
//   return budget.budget.getFourMonthsFrom(new Date('3/1/15')).then(res => {
//     const expectedDates = [
//       '2015-03-01',
//       '2015-04-01',
//       '2015-05-01',
//       '2015-06-01',
//       '2015-07-01',
//     ];

//     expect(res.length).toBe(expectedDates.length);

//     for (var i = 0; i < res.length; i++) {
//       expect(res[i].data._id).toBe('b_555-555-555-555_month_' + expectedDates[i]);
//     }
//   });
// });
