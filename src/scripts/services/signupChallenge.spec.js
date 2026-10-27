import { solveSignupChallenge, submitSignup } from "./signupChallenge.js";

describe("signup proof worker", () => {
  let worker;
  const challenge = {
    algorithm: "SHA-256",
    challenge: "challenge",
    salt: "salt",
    signature: "server-signature",
    maxnumber: 100000,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "Worker",
      class {
        constructor() {
          worker = this;
          this.postMessage = vi.fn();
          this.terminate = vi.fn();
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("submits the server's signed challenge with the worker's solution", async () => {
    const result = solveSignupChallenge(challenge);
    worker.onmessage({ data: { number: 123, took: 10, worker: true } });
    expect(JSON.parse(atob(await result))).toEqual({
      algorithm: challenge.algorithm,
      challenge: challenge.challenge,
      salt: challenge.salt,
      signature: challenge.signature,
      number: 123,
    });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it("rejects failed solutions rather than submitting an unchecked signup", async () => {
    const result = solveSignupChallenge(challenge);
    worker.onmessage({ data: null });
    await expect(result).rejects.toThrow("verification failed");
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it("terminates a stalled worker and lets the form recover", async () => {
    const result = solveSignupChallenge(challenge);
    const rejection = result.catch((error) => error);
    await vi.advanceTimersByTimeAsync(60000);
    expect((await rejection).message).toContain("timed out");
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});

describe("signup API rollout", () => {
  const challenge = {
    algorithm: "SHA-256",
    challenge: "challenge",
    salt: "salt",
    signature: "server-signature",
    maxnumber: 100000,
  };
  let solution;
  let workerCreated;

  beforeEach(() => {
    solution = { number: 123 };
    workerCreated = vi.fn();
    vi.stubGlobal(
      "Worker",
      class {
        constructor() {
          workerCreated();
        }
        postMessage() {
          Promise.resolve().then(() => this.onmessage({ data: solution }));
        }
        terminate() {}
      },
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("sends a solved proof to a manager that supports challenges", async () => {
    const $http = {
      post: vi
        .fn()
        .mockResolvedValueOnce({ data: challenge })
        .mockResolvedValueOnce({ data: "OK" }),
    };
    await expect(
      submitSignup($http, " New@Example.com ", "password"),
    ).resolves.toBe("OK");
    expect($http.post).toHaveBeenNthCalledWith(
      1,
      "/manage/users/signup-challenge",
      { email: "new@example.com" },
    );
    const [path, body] = $http.post.mock.calls[1];
    expect(path).toBe("/manage/users");
    expect(body.email).toBe("new@example.com");
    expect(body.password).toBe("password");
    expect(JSON.parse(atob(body.altcha))).toMatchObject({
      signature: challenge.signature,
      number: 123,
    });
  });

  it("works with the previous manager so the frontend can be released first", async () => {
    const $http = {
      post: vi
        .fn()
        .mockRejectedValueOnce({ status: 404 })
        .mockResolvedValueOnce({ data: "OK" }),
    };
    await expect(
      submitSignup($http, "new@example.com", "password"),
    ).resolves.toBe("OK");
    expect($http.post).toHaveBeenLastCalledWith("/manage/users", {
      email: "new@example.com",
      password: "password",
    });
    expect(workerCreated).not.toHaveBeenCalled();
  });

  it("does not submit a signup when the challenge API fails or rate limits it", async () => {
    for (const status of [400, 429, 500]) {
      const $http = { post: vi.fn().mockRejectedValue({ status }) };
      await expect(
        submitSignup($http, "new@example.com", "password"),
      ).rejects.toMatchObject({ status });
      expect($http.post).toHaveBeenCalledTimes(1);
    }
    expect(workerCreated).not.toHaveBeenCalled();
  });

  it("does not submit a signup when the worker fails", async () => {
    solution = null;
    const $http = { post: vi.fn().mockResolvedValue({ data: challenge }) };
    await expect(
      submitSignup($http, "new@example.com", "password"),
    ).rejects.toThrow("verification failed");
    expect($http.post).toHaveBeenCalledTimes(1);
  });

  it("does not retry a rejected proof without protection", async () => {
    const $http = {
      post: vi
        .fn()
        .mockResolvedValueOnce({ data: challenge })
        .mockRejectedValueOnce({ status: 400 }),
    };
    await expect(
      submitSignup($http, "new@example.com", "password"),
    ).rejects.toMatchObject({ status: 400 });
    expect($http.post).toHaveBeenCalledTimes(2);
  });
});
