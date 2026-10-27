export function submitSignup($http, email, password) {
  email = email.trim().toLowerCase();
  return $http
    .post("/manage/users/signup-challenge", { email })
    .then(
      ({ data }) => solveSignupChallenge(data),
      (error) => {
        // Let the frontend ship through the normal release flow before the
        // manager adds this endpoint. A manager that supports challenges never
        // takes this path; all other errors and rejected proofs fail closed.
        if (error.status === 404) return undefined;
        throw error;
      },
    )
    .then((altcha) =>
      $http.post("/manage/users", {
        email,
        password,
        ...(altcha ? { altcha } : {}),
      }),
    )
    .then((response) => response.data);
}

// Solve away from the UI thread; no third-party service receives form data.
export function solveSignupChallenge(challenge) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./signupChallenge.worker.js", import.meta.url),
      { type: "module" },
    );
    const finish = (error, solution) => {
      clearTimeout(timeout);
      worker.terminate();
      if (error) reject(error);
      else {
        resolve(
          btoa(
            JSON.stringify({
              algorithm: challenge.algorithm,
              challenge: challenge.challenge,
              salt: challenge.salt,
              signature: challenge.signature,
              number: solution.number,
            }),
          ),
        );
      }
    };
    const timeout = setTimeout(
      () => finish(new Error("Signup verification timed out")),
      60000,
    );
    worker.onerror = () => finish(new Error("Signup verification failed"));
    worker.onmessage = ({ data }) => {
      if (!data || !Number.isInteger(data.number)) {
        finish(new Error("Signup verification failed"));
      } else {
        finish(null, data);
      }
    };
    worker.postMessage({
      type: "work",
      payload: {
        algorithm: challenge.algorithm,
        challenge: challenge.challenge,
        salt: challenge.salt,
        max: challenge.maxnumber,
        start: 0,
      },
    });
  });
}
