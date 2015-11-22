(function() {
    'use strict';

    angular
        .module('app.modules.catalogue', [])
        .directive('appCatalogue', CatalogueModule);

    function CatalogueModule() {
    	console.log('[Catalogue] Init');

    	var directive = {
            restrict: 'A',
            templateUrl: './templates/catalogue.html?' + Math.random(),
            replace: true,
            scope: {},
            controllerAs: 'vm',
            controller: ['$http', '$stateParams', '$rootScope', controller]
        };

        return directive;
    }

    function controller($http, $stateParams, $rootScope) {
        /*jshint validthis: true */
        // @TODO
    }

})();
