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

  it("verifies with the email token alone", () => {
    $httpBackend
      .expectPOST("/manage/users/verify", { token: "mailbox-token" })
      .respond(200, "OK");
    let result;
    User.verifyEmail("mailbox-token").then((response) => {
      result = response;
    });
    $httpBackend.flush();
    expect(result).toBe("OK");
  });
});
