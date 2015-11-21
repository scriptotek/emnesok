var gulp = require('gulp');
var gettext = require('gulp-angular-gettext');

gulp.task('pot', function () {
    return gulp.src(['templates/**/*.html', 'app/**/*.js'])
        .pipe(gettext.extract('template.pot', {
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
