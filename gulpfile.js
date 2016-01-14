/* Dependencies
------------------------------------- */
var gulp = require('gulp-help')(require('gulp'));
var gutil = require('gulp-util');
var gettext = require('gulp-angular-gettext');
var browsersync = require('browser-sync').create();
var replace = require('gulp-replace');
var notify = require('gulp-notify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del'); // rm -rf
var argv = require('yargs').argv;
// var size = require('gulp-size');
var changed = require('gulp-changed');
var historyApiFallback = require('connect-history-api-fallback');
var templateCache = require('gulp-angular-templatecache');
var minifyHtml = require('gulp-minify-html');
var minifycss = require('gulp-minify-css');
require('dotenv').load();

var transifex = require('gulp-transifex').createClient({
    user: process.env.TRANSIFEX_USERNAME,  // From .env
    password: process.env.TRANSIFEX_PASSWORD,  // From .env
    project: 'subject-search',
    local_path: 'po'
});

/* Variables and paths
------------------------------------- */

var ENV = (argv.env == 'prod') ? 'prod' : 'dev';
var ENVOPTIONS = {'env=prod': 'Environment, set to "dev" or "prod"'};

var paths = {
  build: 'build/',
  index: 'src/index.html',
  scripts: ['src/js/**/*.js'],
  styles: ['src/css/**/*.css'],
  imgs: ['src/img/**/*.png'],
  templates: ['src/templates/**/*.html'],
  vendor: {
    scripts: [
      'lib/angular/angular.js',
      'lib/angular-touch/angular-touch.js',
      'lib/angular-sanitize/angular-sanitize.js',
      'lib/angular-animate/angular-animate.js',
      'lib/angucomplete-alt/angucomplete-alt.js',
      'lib/angular-ui-router/release/angular-ui-router.js',
      'lib/angular-bootstrap/ui-bootstrap-tpls.js',
      'lib/angular-gettext/dist/angular-gettext.js',
      'lib/ngToast/dist/ngToast.js',
      'lib/lodash/dist/lodash.compat.js',
      'lib/restangular/dist/restangular.js',
      'lib/jsonld/js/jsonld.js',
      'lib/angular-loading-bar/build/loading-bar.js',
      'lib/angulartics/src/angulartics.js',
      'lib/angulartics-google-analytics/lib/angulartics-google-analytics.js',
      //'lib/angular-jsonld/dist/angular-jsonld.js',
    ],
    styles: [
      'lib/bootstrap/dist/css/bootstrap.min.css',
      'lib/angucomplete-alt/angucomplete-alt.css',
      'lib/ngToast/dist/ngToast.min.css',
      'lib/ngToast/dist/ngToast-animations.min.css',
      'lib/angular-loading-bar/build/loading-bar.css',
    ],
    fonts: [
      'lib/bootstrap/fonts/*',
    ]
  }
};

/* Rewriting
------------------------------------- */

gulp.task('inject-env', 'Inject environment into index.html', [], function () {
  var baseHref = (ENV == 'prod') ? '/ub/emnesok/' : '/';
  var gaUrl = (ENV == 'prod') ? '//vrtx.uio.no/js/analytics/v2/analytics.js' : '//www.google-analytics.com/analytics.js';
  var gaIpp = (ENV == 'prod') ? 'useIppProxy();' : '';
  var gaId = (ENV == 'prod') ? 'UA-72054416-3' : 'UA-72054416-4';
  return gulp.src(paths.index)
    .pipe(replace('<%BASE_HREF%>', baseHref))
    .pipe(replace('<%GA_URL%>', gaUrl))
    .pipe(replace('<%GA_IPP%>', gaIpp))
    .pipe(replace('<%GA_ID%>', gaId))
    .pipe(minifyHtml({
      conditionals: true,
      spare:true
    }))
    .pipe(gulp.dest('build'));
});

/* Linting
------------------------------------- */

gulp.task('jslint', 'Lints all javascript files', [], function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(notify(function (file) {
      if (file.jshint.success) {
        // Don't show something if success
        return false;
      }

      var errors = file.jshint.results.map(function (data) {
        if (data.error) {
          return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
        }
      }).join("\n");
      return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
    }));
});

/* Concatenation & minification
------------------------------------- */

gulp.task('vendor-scripts', false, [], function() {
  return gulp.src(paths.vendor.scripts)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(paths.build + 'js'))
    .pipe(rename('vendor.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.build + 'js'))
    // .pipe(size({showFiles:true, gzip:true, title: 'vendor-scripts'}))
    ;
});

gulp.task('vendor-styles', false, [], function() {
  return gulp.src(paths.vendor.styles)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(paths.build + 'css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest(paths.build + 'css'));
});

gulp.task('vendor-fonts', false, [], function() {
  return gulp.src(paths.vendor.fonts)
    .pipe(gulp.dest(paths.build + 'fonts'));
});

gulp.task('scripts', false, ['jslint'], function() {
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(gulp.dest(paths.build + 'js'))
    .pipe(rename({ suffix: '.min'}))
    // .pipe(stripdebug())
    // .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.build + 'js'))
    // .pipe(size({showFiles:true, gzip:true, title: 'scripts'}))
    ;
});

gulp.task('styles', false, [], function() {
  return gulp.src(paths.styles)
    .pipe(concat('app.css'))
    .pipe(gulp.dest(paths.build + 'css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest(paths.build + 'css'))
    .pipe(browsersync.stream());
//    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('imgs', false, [], function() {
  return gulp.src(paths.imgs)
    .pipe(gulp.dest(paths.build + 'img'));
});

gulp.task('templates', false, [], function () {
	
	console.log('Waiting for templates');
	function ferdigVenta() {

	  var htmlOpts = {
		conditionals: true,
		spare: true
	  };

	  var tplOpts = {
		filename: 'templates.js',
		root: 'app',
		standalone: true
	  };

	  gulp.src(paths.templates)
		.pipe(minifyHtml(htmlOpts))
		.pipe(templateCache(tplOpts))
		.pipe(gulp.dest(paths.build + 'js'));

		console.log('Finished waiting for templates');
	}

	setTimeout(ferdigVenta, 2000);

});

/* Translation (gettext)
------------------------------------- */

gulp.task('pot', 'Extracts translatable strings into emnesok.pot', [], function () {
  return gulp.src(paths.templates.concat(paths.scripts))
    .pipe(gettext.extract('emnesok.pot', {
      // options to pass to angular-gettext-tools...
    }))
    .pipe(gulp.dest('po/'));
});

gulp.task('translations', 'Builds javascript translation files from .po files', ['transifex-pull'], function () {
  return gulp.src('po/**/*.po')
    .pipe(gettext.compile({
      // options to pass to angular-gettext-tools...
      format: 'javascript'
    }))
    .pipe(concat('translations.js'))
    .pipe(gulp.dest(paths.build + 'js'))
    // .pipe(size({showFiles:true, gzip:true, title: 'vendor-scripts'}))
    ;
});


gulp.task('transifex-push', 'Pushes the pot file to Transifex', [], function(){
    return gulp.src('po/*.pot')
        .pipe(transifex.pushResource());
});

gulp.task('transifex-pull', 'Pulls po files from Transifex', [], function(){
    return gulp.src('po/*.pot')
        .pipe(transifex.pullResource());
});

/* Cleaning
------------------------------------- */

gulp.task('clean', 'Cleans the build directory', [], function() {
  return del([paths.build]);
});

/* Watch
------------------------------------- */

gulp.task('browsersync', false, [], function() {
  browsersync.init({
    server: paths.build,
    middleware: [ historyApiFallback() ],
    // xip: true,
    notify: false
  });
});

gulp.task('build', 'Builds the app', [
  'inject-env',
  'translations',
  'scripts',
  'styles',
  'imgs',
  'templates',
  'vendor-scripts',
  'vendor-styles',
  'vendor-fonts'], function() { }, { options: ENVOPTIONS }
);

gulp.task('serve', 'Starts development server', ['build', 'browsersync'], function () {
  //gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch(paths.templates, ['templates', browsersync.reload]);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.imgs, ['imgs']);
  gulp.watch(paths.scripts, ['scripts', browsersync.reload]);
  gulp.watch(paths.index, ['inject-env']);
}, { options: ENVOPTIONS });
