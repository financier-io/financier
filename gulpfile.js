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
    lr = require('tiny-lr'),
    http = require('http'),
    st = require('st'),
    server = lr(),
    sassLint = require('gulp-sass-lint'),
    Server = require('karma').Server;

gulp.task('styles', function() {
  return gulp.src('src/styles/app.scss')
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: require('node-bourbon').includePaths.concat([
        'bower_components/normalize-css/',
        'bower_components/lato/css/'
      ])
    }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano())
    .pipe(livereload(server))
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('scripts', function() {
  return gulp.src(['src/scripts/**/*.js', '!src/scripts/**/*.spec.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(livereload(server))
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('html', function() {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist/'));
});

gulp.task('clean', function() {
  return gulp.src(['dist/'], {read: false})
    .pipe(clean());
});

gulp.task('server', function(done) {
  http.createServer(
    st({ path: __dirname + '/dist', index: 'index.html', cache: false })
  ).listen(8080, done);
  console.log('running on ', 8080);
});

gulp.task('default', ['clean'], function() {
    gulp.run('styles', 'scripts', 'html', 'server');
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

  // Listen on port 35729
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err)
    };

    // Watch .scss files
    gulp.watch('src/**/*.scss', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
      gulp.run('styles');
    });

    // Watch .html files
    gulp.watch('src/**/*.html', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
      gulp.run('html');
    });

    // Watch .js files
    gulp.watch(['src/**/*.js', '!src/scripts/**/*.spec.js'], function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
      gulp.run('scripts', 'test');
    });

    // Watch .test.js files
    gulp.watch(['src/**/*.js', '!src/scripts/**/*.spec.js'], function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
      gulp.run('test');
    });

  });

});