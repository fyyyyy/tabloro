var gulp = require('gulp');
var uglify = require('gulp-uglify');
var del = require('del');
var changed = require('gulp-changed');

var DEST = 'build';

var paths = {
  scripts: ['src/game/*.js', 'src/site/*.js'],
  images: '/img/**/*'
};



gulp.task('default', ['scripts']);

gulp.task('clean', function (cb) {
  del([DEST], cb);
});

gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(changed(DEST + '/js'))
    .pipe(uglify({
      compress: {
        drop_console: true
      }
    }))
    .pipe(gulp.dest(DEST + '/js'));
});
