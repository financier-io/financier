// Karma configuration
// Generated on Sat Jan 23 2016 08:00:00 GMT-0600 (CST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: require('../src/vendor').concat([
      'node_modules/jasmine-promises/dist/jasmine-promises.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/scripts/**/*.js'
    ]),


    // list of files to exclude
    exclude: [
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage', 'coveralls'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    preprocessors: {
      'src/**/*.spec.js': ['babel'],
      'src/**/!(*spec|*mock).js': ['babel']
    },

    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        plugins: ['istanbul'],
        sourceMap: 'inline'
      }
    },


    phantomjsLauncher: {
      exitOnResourceError: true,
    },

    coverageReporter: {
      type: 'lcov', // lcov or lcovonly are required for generating lcov.info files
      dir: 'coverage/'
    },

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
