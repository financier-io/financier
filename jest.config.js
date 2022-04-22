module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "\\.[jt]sx?$": "babel-jest",
    "\\.(scss|woff)$": "./styleMock.js",
  },
  transformIgnorePatterns: ["/node_modules/(?!(lato-webfont)/)"],
  setupFilesAfterEnv: ["./jest.setup.js"],
};
