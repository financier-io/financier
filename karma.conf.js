// Karma configuration
module.exports = function(config) {
  config.set({
    frameworks: [
      // Reference: https://github.com/karma-runner/karma-jasmine
      // Set framework to jasmine
      'jasmine'
    ],

    browsers: [
      // Run tests using PhantomJS
      // 'PhantomJS'
    ],

    // ... normal karma configuration
    files: [
      // all files ending in "_test"
      'src/scripts/tests.webpack.js'
    ],

    preprocessors: {
      // add webpack as preprocessor
      'src/scripts/tests.webpack.js': ['webpack']
    },

    webpack: require('./webpack.config'),

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    }
  });
};
