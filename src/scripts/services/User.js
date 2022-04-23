angular.module("financier").factory("User", ($http) => {
  return {
    create: (email, password) => {
      return $http
        .post("/manage/users", {
          email: email.toLowerCase(),
          password,
        })
        .then((d) => d.data);
    },
    login: (email, password) => {
      return $http
        .post("/db/_session", {
          name: email.toLowerCase(),
          password,
        })
        .then((d) => d.data);
    },
    logout: () => {
      return $http.delete("/db/_session").then((d) => d.data);
    },
    session: () => {
      return $http.get("/db/_session").then((d) => d.data);
    },
    addSource: (token) => {
      return $http
        .post("/manage/billing/source", { token })
        .then((d) => d.data);
    },
    getSource: () => {
      return $http.get("/manage/billing/source").then((d) => d.data);
    },
    removeSource: () => {
      return $http.delete("/manage/billing/source").then((d) => d.data);
    },
    startSubscription: () => {
      return $http.post("/manage/billing/subscription").then((d) => d.data);
    },
    stopSubscription: () => {
      return $http.delete("/manage/billing/subscription").then((d) => d.data);
    },
    getSubscription: () => {
      return $http.get("/manage/billing/subscription").then((d) => d.data);
    },
    getStripePublishableKey: () => {
      return $http.get("/manage/billing/stripeKey").then((d) => d.data);
    },
    verifyEmail: (token) => {
      return $http.post("/manage/users/verify", { token }).then((d) => d.data);
    },
    requestResetPassword: (email) => {
      return $http
        .post("/manage/users/forgot", {
          email: email.toLowerCase(),
        })
        .then((d) => d.data);
    },
    resetPassword: (token, password) => {
      return $http
        .post("/manage/users/forgot/reset", { token, password })
        .then((d) => d.data);
    },
  };
});
