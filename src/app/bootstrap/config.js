export default /* @ngInject */ function configure(
    $locationProvider,
    $provide,
    cfpLoadingBarProvider,
    $httpProvider
) {
    // Skip spinner from loading bar
    cfpLoadingBarProvider.includeSpinner = false;

    // Request application/json by default
    $httpProvider.defaults.headers.common = {'Accept': 'application/json'};

    // Fix sourcemaps
    // @url https://github.com/angular/angular.js/issues/5217#issuecomment-50993513
    $provide.decorator('$exceptionHandler', /* @ngInject */ function ($delegate) {
        return function (exception, cause) {
            $delegate(exception, cause);
            setTimeout(function () {
                throw exception;
            });
        };
    });

    // HTML5-mode navigation
    $locationProvider.html5Mode({
        enabled: true,
    });

    // Highlight untranslated strings
    // gettextCatalog.debug = true;
}
