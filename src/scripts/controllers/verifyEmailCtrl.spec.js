import template from "../../views/verifyEmail.html?raw";

describe("account activation", () => {
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
      verifyEmail: vi.fn(() => {
        const request = $q.defer();
        pending.push(request);
        return request.promise;
      }),
    };
    scope = $rootScope.$new();
    controller = $controller("verifyEmailCtrl", {
      $scope: scope,
      User,
      $stateParams: { token: "mailbox-owner-token" },
    });
    scope.verifyEmailCtrl = controller;
    element = $compile(template)(scope);
    document.body.appendChild(element[0]);
    scope.$digest();
  }));

  afterEach(() => {
    scope.$destroy();
    element.remove();
  });

  function requirePassword() {
    scope.$apply(() =>
      pending[0].reject({
        status: 422,
        data: { errorMessage: "passwordRequired" },
      }),
    );
  }

  function enterPassword(password = "mailbox-owner-password") {
    const input = element[0].querySelector('input[name="password"]');
    input.value = password;
    angular.element(input).triggerHandler("input");
    scope.$digest();
  }

  function submit() {
    angular.element(element[0].querySelector("form")).triggerHandler("submit");
    scope.$digest();
  }

  it("asks the mailbox owner to set a password before activating", () => {
    expect(User.verifyEmail).toHaveBeenCalledWith(
      "mailbox-owner-token",
      undefined,
    );
    requirePassword();
    expect(controller.verified).not.toBe(true);
    expect(controller.error).not.toBe(true);
    expect(controller.requiresPassword).toBe(true);
    expect(element[0].querySelector("form button").disabled).toBe(true);

    enterPassword();
    expect(element[0].querySelector("form button").disabled).toBe(false);
    submit();
    expect(User.verifyEmail).toHaveBeenLastCalledWith(
      "mailbox-owner-token",
      "mailbox-owner-password",
    );
    expect(controller.verified).not.toBe(true);
    scope.$apply(() => pending[1].resolve({}));
    expect(controller.verified).toBe(true);
    expect(controller.password).toBeUndefined();
    expect(element[0].querySelector("form")).toBeNull();
  });

  it("still accepts an immediate activation from the previous manager", () => {
    scope.$apply(() => pending[0].resolve({}));
    expect(controller.verified).toBe(true);
    expect(element[0].querySelector("form")).toBeNull();
    expect(User.verifyEmail).toHaveBeenCalledTimes(1);
  });

  it("only opens the form for the exact password-required response", () => {
    scope.$apply(() =>
      pending[0].reject({
        status: 422,
        data: { errorMessage: "invalidPassword" },
      }),
    );
    expect(controller.error).toBe(true);
    expect(element[0].querySelector("form")).toBeNull();
  });

  it.each([
    [{ status: 503 }, "INTERNAL_ERROR"],
    [new Error("network failure"), "INTERNAL_ERROR"],
    [{ status: 429 }, "TOO_MANY_ACCOUNT_REQUESTS"],
    [
      { status: 422, data: { errorMessage: "invalidPassword" } },
      "PASSWORD_MINIMUM_LENGTH",
    ],
  ])("allows the same-password retry after %j", (failure, message) => {
    requirePassword();
    enterPassword();
    submit();
    scope.$apply(() => pending[1].reject(failure));
    expect(controller.loading).toBe(false);
    expect(controller.serverError).toBe(message);
    expect(controller.form.$valid).toBe(true);
    expect(element[0].querySelector("form button").disabled).toBe(false);

    submit();
    expect(User.verifyEmail).toHaveBeenCalledTimes(3);
    expect(User.verifyEmail).toHaveBeenLastCalledWith(
      "mailbox-owner-token",
      "mailbox-owner-password",
    );
    scope.$apply(() => pending[2].resolve({}));
    expect(controller.verified).toBe(true);
  });

  it("rejects a stale link without presenting an activation form", () => {
    scope.$apply(() => pending[0].reject({ status: 404 }));
    expect(controller.error).toBe(true);
    expect(controller.verified).not.toBe(true);
    expect(element[0].querySelector("form")).toBeNull();
    expect(
      element[0].querySelector('button[ng-click="verifyEmailCtrl.retry()"]'),
    ).toBeNull();
    controller.retry();
    expect(User.verifyEmail).toHaveBeenCalledTimes(1);
  });

  it.each([
    { status: 503 },
    new Error("network failure"),
    { status: 0 },
    { status: 409 },
    { status: 429 },
  ])(
    "retries an initial %j failure before asking for a password",
    (failure) => {
      scope.$apply(() => pending[0].reject(failure));
      const retry = element[0].querySelector(
        'button[ng-click="verifyEmailCtrl.retry()"]',
      );
      expect(retry).not.toBeNull();
      expect(retry.disabled).toBe(false);
      expect(controller.verified).not.toBe(true);
      expect(element[0].querySelector("form")).toBeNull();

      angular.element(retry).triggerHandler("click");
      scope.$digest();
      expect(User.verifyEmail).toHaveBeenCalledTimes(2);
      expect(User.verifyEmail).toHaveBeenLastCalledWith(
        "mailbox-owner-token",
        undefined,
      );
      controller.retry();
      expect(User.verifyEmail).toHaveBeenCalledTimes(2);

      scope.$apply(() =>
        pending[1].reject({
          status: 422,
          data: { errorMessage: "passwordRequired" },
        }),
      );
      expect(controller.error).toBe(false);
      expect(controller.requiresPassword).toBe(true);
      enterPassword();
      submit();
      expect(User.verifyEmail).toHaveBeenLastCalledWith(
        "mailbox-owner-token",
        "mailbox-owner-password",
      );
      scope.$apply(() => pending[2].resolve({}));
      expect(controller.verified).toBe(true);
    },
  );

  it("explains rate limiting on the initial verification request", () => {
    scope.$apply(() => pending[0].reject({ status: 429 }));
    expect(controller.error).toBe(true);
    expect(controller.serverError).toBe("TOO_MANY_ACCOUNT_REQUESTS");
    expect(element[0].querySelector('[role="alert"]')).not.toBeNull();
    expect(element[0].querySelector("form")).toBeNull();
  });

  it("removes the form if the link becomes stale before submission", () => {
    requirePassword();
    enterPassword();
    submit();
    scope.$apply(() => pending[1].reject({ status: 404 }));
    expect(controller.error).toBe(true);
    expect(controller.verified).not.toBe(true);
    expect(element[0].querySelector("form")).toBeNull();
  });
});
