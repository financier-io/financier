describe('distnace', function () {
  let distance;

  beforeEach(angular.mock.module('financier'));

  beforeEach(inject(_distance_ => {
    distance = _distance_;
  }));

  it('finds distance between two points', () => {
    expect(Math.round(distance(43.0581890, -89.5108794, 43.0579539, -89.5108150))).toBe(27);
  });
});
