describe("intCurrency filter", function () {
  let intCurrencyFilter;

  beforeEach(angular.mock.module("financier"));

  beforeEach(inject((_intCurrencyFilter_) => {
    intCurrencyFilter = _intCurrencyFilter_;
  }));

  it("is filter", () => {
    expect(typeof intCurrencyFilter).toBe("function");
  });

  it("divides by 100", () => {
    expect(intCurrencyFilter(250)).toBe("2.50");
  });

  it("changes number to fixed", () => {
    expect(intCurrencyFilter(12345)).toBe("123.45");
  });

  it("doesn't modify NaN", () => {
    expect(intCurrencyFilter(NaN)).toBeNaN();
  });

  it("doesn't modify other types", () => {
    expect(intCurrencyFilter("boom")).toBe("boom");
  });
});
