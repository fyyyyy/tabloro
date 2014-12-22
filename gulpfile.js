var gulp = require('gulp');
var uglify = require('gulp-uglify');
var del = require('del');
var changed = require('gulp-changed');
var concat = require('gulp-concat');

var DEST = 'build';

var paths = {
  scripts: {game: 'src/game/*.js', site: 'src/site/*.js'},
  images: '/img/**/*'
};



gulp.task('default', ['scripts']);
gulp.task('scripts', ['scripts:game', 'scripts:site']);


gulp.task('clean', function (cb) {
  del([DEST], cb);
});



gulp.task('scripts:game', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts.game)
    .pipe(changed(DEST + '/js'))
    .pipe(concat('compiled.js'))
    .pipe(uglify({
      mangle: true,
      toplevel: true,
      compress: {
        drop_console: true
      }
    }))
    .pipe(gulp.dest(DEST + '/js'));
});


gulp.task('scripts:site', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts.site)
    .pipe(changed(DEST + '/js'))
    .pipe(concat('site.js'))
    .pipe(uglify({
      compress: {
        drop_console: true
      }
    }))
    .pipe(gulp.dest(DEST + '/js'));
});
