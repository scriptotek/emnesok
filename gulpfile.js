var gulp = require('gulp');
var gettext = require('gulp-angular-gettext');
var browserSync = require('browser-sync');

gulp.task('pot', function () {
    return gulp.src(['templates/**/*.html', 'app/**/*.js'])
        .pipe(gettext.extract('emnesok.pot', {
            // options to pass to angular-gettext-tools...
        }))
        .pipe(gulp.dest('po/'));
});

gulp.task('translations', function () {
    return gulp.src('po/**/*.po')
        .pipe(gettext.compile({
            // options to pass to angular-gettext-tools...
            format: 'javascript'
        }))
        .pipe(gulp.dest('dist/translations/'));
});

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: ''
    },
  });
});

gulp.task('watch', ['browserSync'], function (){
  //gulp.watch('app/scss/**/*.scss', ['sass']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('templates/*.html', browserSync.reload);
  gulp.watch('app/**/*.js', browserSync.reload);
});
