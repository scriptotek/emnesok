(function() {
    'use strict';

    angular.module('app.core', [

        // Angular modules
        'ngTouch',
        'ngSanitize',
        'ngAnimate',

        // 3rd-party modules
        'ui.router',
        'ui.bootstrap',
        'gettext',
        'ngToast',
        'angulartics',
        'angulartics.google.analytics',

        'angucomplete-alt',
        'angular-loading-bar',
    ]);

})();