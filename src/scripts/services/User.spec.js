describe("User verification requests", () => {
  let User;
  let $httpBackend;

  beforeEach(angular.mock.module("financier"));
  beforeEach(inject((_User_, _$httpBackend_) => {
    User = _User_;
    $httpBackend = _$httpBackend_;
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it("omits a password on the initial compatibility request", () => {
    $httpBackend
      .expectPOST("/manage/users/verify", { token: "mailbox-token" })
      .respond(422, { errorMessage: "passwordRequired" });
    let error;
    User.verifyEmail("mailbox-token").catch((response) => {
      error = response;
    });
    $httpBackend.flush();
    expect(error.data.errorMessage).toBe("passwordRequired");
  });

  it("sends the mailbox owner's chosen password for account activation", () => {
    $httpBackend
      .expectPOST("/manage/users/verify", {
        token: "mailbox-token",
        password: "owner-password",
      })
      .respond(200, "OK");
    let result;
    User.verifyEmail("mailbox-token", "owner-password").then((response) => {
      result = response;
    });
    $httpBackend.flush();
    expect(result).toBe("OK");
  });
});
