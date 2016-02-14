// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    eslint = require('gulp-eslint'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    http = require('http'),
    st = require('st'),
    sassLint = require('gulp-sass-lint'),
    Server = require('karma').Server,
    runSequence = require('run-sequence');

gulp.task('styles', function() {
  return gulp.src('src/styles/app.scss')
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: require('node-bourbon').includePaths.concat([
        'bower_components/normalize-css/',
        'bower_components/lato/scss/',
        'node_modules/font-awesome/scss/',
        'bower_components/angular-tooltips/dist'
      ])
    }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano())
    .pipe(livereload())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('scripts', function() {
  return gulp.src([
    'src/scripts/**/*.js',
    '!src/scripts/**/*.spec.js'
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(livereload())
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('copy:assets', function() {
  return gulp.src('src/styles/assets/**')
    .pipe(gulp.dest('dist/styles/assets'));
});

gulp.task('copy:vendor', function() {
  return gulp.src([
    './bower_components/angular/angular.js',
    './bower_components/angular-animate/angular-animate.js',
    './bower_components/angular-ui-router/release/angular-ui-router.js',
    './bower_components/ng-resize/dist/ng-resize.js',
    './bower_components/Sortable/Sortable.js',
    './bower_components/Sortable/ng-sortable.js',
    './bower_components/pouchdb/dist/pouchdb.js',
    './bower_components/pouchdb/dist/pouchdb.memory.js',
    './bower_components/moment/min/moment-with-locales.js',
    './bower_components/angular-tooltips/dist/angular-tooltips.js',
    './bower_components/lato/font/**',
    './node_modules/font-awesome/fonts/**'
  ])
    .pipe(gulp.dest('dist/vendor'));
});

gulp.task('html', function() {
  return gulp.src('src/**/*.html')
    .pipe(livereload())
    .pipe(gulp.dest('dist/'));
});

gulp.task('clean', function() {
  return gulp.src(['dist/'], {read: false})
    .pipe(clean());
});

gulp.task('server', function(done) {
  require('./api/');
});

gulp.task('default', ['clean'], function() {
    runSequence('styles', 'scripts', 'copy:assets', 'copy:vendor', 'html', 'generate-service-worker-dist', 'server');
});

gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, process.exit).start();
});

gulp.task('tdd', function () {
  new Server({
    configFile: __dirname + '/test/tdd.conf.js'
  }).start();
});

gulp.task('watch', ['default', 'tdd'], function() {
  livereload.listen();

  // Watch .scss files
  gulp.watch('src/**/*.scss', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.run('styles', 'generate-service-worker-dist');
  });

  // Watch .html files
  gulp.watch('src/**/*.html', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.run('html', 'generate-service-worker-dist');
  });

  // Watch .js files
  gulp.watch(['src/**/*.js', '!src/scripts/**/*.spec.js'], function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.run('scripts', 'generate-service-worker-dist');
  });

  // Watch assets
  gulp.watch(['src/styles/assets/**'], function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.run('copy:assets');
  });
});


var packageJson = require('./package.json');
var path = require('path');
var swPrecache = require('sw-precache');


function writeServiceWorkerFile(rootDir, handleFetch, callback) {
  var config = {
    cacheId: packageJson.name,
    dynamicUrlToDependencies: {
      // 'dynamic/page1': [
      //   path.join(rootDir, 'views', 'layout.jade'),
      //   path.join(rootDir, 'views', 'page1.jade')
      // ],
      // 'dynamic/page2': [
      //   path.join(rootDir, 'views', 'layout.jade'),
      //   path.join(rootDir, 'views', 'page2.jade')
      // ]
    },
    // If handleFetch is false (i.e. because this is called from generate-service-worker-dev), then
    // the service worker will precache resources but won't actually serve them.
    // This allows you to test precaching behavior without worry about the cache preventing your
    // local changes from being picked up during the development cycle.
    handleFetch: handleFetch,
    logger: console.log,
    runtimeCaching: [{
      // See https://github.com/GoogleChrome/sw-toolbox#methods
      urlPattern: /runtime-caching/,
      handler: 'cacheFirst',
      // See https://github.com/GoogleChrome/sw-toolbox#options
      options: {
        cache: {
          maxEntries: 1,
          name: 'runtime-cache'
        }
      }
    }],
    staticFileGlobs: [
      rootDir + '/**'
    ],
    stripPrefix: rootDir + '/',

    // Font-Awesome scss being a jerk
    ignoreUrlParametersMatching: [/^v/],

    // verbose defaults to false, but for the purposes of this demo, log more.
    // verbose: true
  };

  swPrecache.write(path.join(rootDir, 'service-worker.js'), config, callback);
}

var DIST_DIR = 'dist';
gulp.task('generate-service-worker-dist', function(callback) {
  writeServiceWorkerFile(DIST_DIR, true, callback);
});
