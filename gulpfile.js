// Load plugins
var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    http = require('http'),
    runSequence = require('run-sequence');

gulp.task('styles', function() {
  return gulp.src('src/styles/app.scss')
    .pipe(plugins.sassLint())
    .pipe(plugins.sassLint.format())
    .pipe(plugins.sass({
      outputStyle: 'expanded',
      includePaths: require('node-bourbon').includePaths.concat([
        'bower_components/normalize-css/',
        'bower_components/lato/scss/',
        'node_modules/font-awesome/scss/',
        'bower_components/tether-drop/dist/css',
        'bower_components/ng-dialog/css',
        'bower_components/angular-ladda-lw/dist'
      ])
    }).on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(plugins.cssnano())
    .pipe(plugins.livereload())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('scripts', function() {
  return gulp.src([
    'src/scripts/**/*.js',
    '!src/scripts/**/*.spec.js'
  ])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
    .pipe(plugins.babel({
      presets: ['es2015']
    }))
    .pipe(plugins.concat('app.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(plugins.uglify())
    .pipe(plugins.livereload())
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
    './bower_components/angular-messages/angular-messages.js',
    './bower_components/angular-ui-router/release/angular-ui-router.js',
    './bower_components/ng-resize/dist/ng-resize.js',
    './bower_components/Sortable/Sortable.js',
    './bower_components/Sortable/ng-sortable.js',
    './bower_components/pouchdb/dist/pouchdb.js',
    './bower_components/pouchdb/dist/pouchdb.memory.js',
    './bower_components/moment/min/moment-with-locales.js',
    './bower_components/mathjs/dist/math.js',
    './bower_components/lato/font/**',
    './node_modules/font-awesome/fonts/**',
    './bower_components/tether/dist/js/tether.js',
    './bower_components/tether-drop/dist/js/drop.js',
    './bower_components/ng-dialog/js/ngDialog.js',
    './node_modules/lie/dist/lie.polyfill.js',
    './bower_components/angular-ladda-lw/dist/angular-ladda-lw.js',
    './bower_components/node-uuid/uuid.js',
    './bower_components/angular-md5/angular-md5.js',
    './bower_components/angular-resizable/src/angular-resizable.js'
  ])
    .pipe(gulp.dest('dist/vendor'));
});

gulp.task('html', function() {
  return gulp.src('src/**/*.html')
    .pipe(plugins.livereload())
    .pipe(gulp.dest('dist/'));
});

gulp.task('clean', function() {
  return gulp.src(['dist/'], {read: false})
    .pipe(plugins.clean());
});

gulp.task('server', function(done) {
  require('./api/');
});

gulp.task('default', ['clean'], function() {
  runSequence('build', 'server');
});

gulp.task('build', function(done) {
  runSequence('styles', 'scripts', 'copy:assets', 'copy:vendor', 'html', 'generate-service-worker-dist', done);
});

gulp.task('test', function (done) {
  var Server = require('karma').Server;

  new Server({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, process.exit).start();
});

gulp.task('tdd', function () {
  var Server = require('karma').Server;

  new Server({
    configFile: __dirname + '/test/tdd.conf.js'
  }).start();
});

gulp.task('watch', ['default', 'tdd'], function() {
  plugins.livereload.listen();

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
    handleFetch: handleFetch,
    staticFileGlobs: [
      rootDir + '/**'
    ],
    stripPrefix: rootDir,

    navigateFallback: '/index.html',
    navigateFallbackWhitelist: [
      /^(?!\/docs|\/db).*$/, // whitelist `/docs*` and `/db*`
    ],

    // Font-Awesome scss being a jerk
    ignoreUrlParametersMatching: [/^v/],

    handleFetch: process.env.NODE_ENV === 'production'
  };

  swPrecache.write(path.join(rootDir, 'service-worker.js'), config, callback);
}

var DIST_DIR = 'dist';

gulp.task('generate-service-worker-dist', function(callback) {
  writeServiceWorkerFile(DIST_DIR, true, callback);
});
