import template from "../../views/signup.html?raw";

describe("signup form failure recovery", () => {
  let $controller;
  let $compile;
  let $rootScope;
  let $q;
  let scope;
  let element;
  let controller;
  let User;
  let pending;

  beforeEach(angular.mock.module("financier"));
  beforeEach(inject((_$controller_, _$compile_, _$rootScope_, _$q_) => {
    $controller = _$controller_;
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    pending = [];
    User = {
      create: vi.fn(() => {
        const request = $q.defer();
        pending.push(request);
        return request.promise;
      }),
    };
    scope = $rootScope.$new();
    controller = $controller("signupCtrl", { $scope: scope, User });
    scope.signupCtrl = controller;
    element = $compile(`<div>${template}</div>`)(scope);
    document.body.appendChild(element[0]);
    controller.email = "owner@example.com";
    controller.password = "owner-password";
    scope.$digest();
  }));

  afterEach(() => {
    scope.$destroy();
    element.remove();
  });

  function submit() {
    angular.element(element[0].querySelector("form")).triggerHandler("submit");
    scope.$digest();
  }

  it.each([
    [new Error("Signup verification timed out"), "INTERNAL_ERROR"],
    [new Error("Signup verification failed"), "INTERNAL_ERROR"],
    [{ status: 429 }, "TOO_MANY_ACCOUNT_REQUESTS"],
  ])("allows an unchanged-credentials retry after %j", (failure, message) => {
    submit();
    scope.$apply(() => pending[0].reject(failure));
    expect(controller.loading).toBe(false);
    expect(controller.serverError).toBe(message);
    expect(controller.form.$valid).toBe(true);
    expect(element[0].querySelector("form button").disabled).toBe(false);

    submit();
    expect(User.create).toHaveBeenCalledTimes(2);
    expect(User.create).toHaveBeenLastCalledWith(
      "owner@example.com",
      "owner-password",
    );
    scope.$apply(() => pending[1].resolve({}));
    expect(controller.success).toBe(true);
  });

  it("still requires an email change after a duplicate-address response", () => {
    submit();
    scope.$apply(() =>
      pending[0].reject({ data: { errorMessage: "existingEmail" } }),
    );
    expect(controller.form.email.$error.duplicate).toBe(true);
    expect(element[0].querySelector("form button").disabled).toBe(true);
    controller.email = "different@example.com";
    scope.$digest();
    expect(controller.form.$valid).toBe(true);
    expect(element[0].querySelector("form button").disabled).toBe(false);
  });
});
