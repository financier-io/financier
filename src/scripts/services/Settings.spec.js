describe("Settings", function () {
  let Settings;

  beforeEach(angular.mock.module("financier"));

  beforeEach(inject((_Settings_) => {
    Settings = _Settings_;
  }));

  describe("new Settings()", () => {
    it("can take existing settings", () => {
      let sets = new Settings({
        hints: {
          outflow: false,
        },
      });

      expect(sets.constructor.name).toBe("Settings");
    });

    it("can take no constructor params", () => {
      let sets = new Settings();

      expect(sets.constructor.name).toBe("Settings");
    });

    it("exposes default settings", () => {
      let sets = new Settings();

      expect(sets._id).toBe("settings");
      expect(sets.hints.outflow).toBe(true);
    });
  });

  describe("set", () => {
    it("hints.outflow", () => {
      let sets = new Settings();

      sets.hints.outflow = false;

      expect(sets.toJSON().hints.outflow).toBe(false);
    });

    it("cannot set _id", () => {
      let sets = new Settings();

      expect(() => (sets._id = 123)).toThrow(TypeError);
    });
  });

  describe("pub/sub", () => {
    it("hints.outflow", () => {
      const foo = {
        change: () => {},
      };

      jest.spyOn(foo, "change");

      let sets = new Settings({
        hints: {
          outflow: false,
        },
      });

      sets.subscribe(foo.change);

      expect(foo.change).not.toHaveBeenCalled();

      sets.hints.outflow = true;

      expect(foo.change).toHaveBeenCalledWith(sets);
    });
  });
});
