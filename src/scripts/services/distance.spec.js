describe("distnace", function () {
  let distance;

  beforeEach(angular.mock.module("financier"));

  beforeEach(inject((_distance_) => {
    distance = _distance_;
  }));

  it("finds distance between two points", () => {
    expect(
      Math.round(distance(43.058189, -89.5108794, 43.0579539, -89.510815)),
    ).toBe(27);
  });
});
