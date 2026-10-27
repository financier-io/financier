import template from "../../views/verifyEmail.html?raw";

describe("one-click email verification", () => {
  let scope;
  let element;
  let controller;
  let pending;
  let User;

  beforeEach(angular.mock.module("financier"));
  beforeEach(inject(($controller, $compile, $rootScope, $q) => {
    pending = $q.defer();
    User = { verifyEmail: vi.fn(() => pending.promise) };
    scope = $rootScope.$new();
    controller = $controller("verifyEmailCtrl", {
      User,
      $stateParams: { token: "mailbox-token" },
    });
    scope.verifyEmailCtrl = controller;
    element = $compile(template)(scope);
    scope.$digest();
  }));

  afterEach(() => {
    scope.$destroy();
    element.remove();
  });

  it("verifies the email without asking for another password", () => {
    expect(User.verifyEmail).toHaveBeenCalledTimes(1);
    expect(User.verifyEmail).toHaveBeenCalledWith("mailbox-token");
    expect(element[0].querySelector('input[type="password"]')).toBeNull();
    scope.$apply(() => pending.resolve({}));
    expect(controller.verified).toBe(true);
    expect(controller.loading).toBe(false);
    expect(element[0].querySelector("form")).toBeNull();
  });
});
