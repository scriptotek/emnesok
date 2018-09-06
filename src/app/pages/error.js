(function() {
    'use strict';

    angular
		.module('app.pages')
		.component('appError', {
            templateUrl: 'app/pages/error.html',
            controller: 'ErrorController',
            controllerAs: 'vm'
        });

    controller.$inject = ['$state', '$stateParams', 'gettext', 'gettextCatalog'];

    function controller($state, $stateParams, gettext, gettextCatalog) {
		/*jshint validthis: true */
        var vm = this;

        if ($state.get('error').error) {
            vm.message = $state.get('error').error.message;
        } else {
            var msg = gettext('An unknown error occured.');
            var translated = gettextCatalog.getString(msg);
            vm.message = translated;
        }

    }

})();
