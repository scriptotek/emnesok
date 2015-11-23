(function() {
    'use strict';

    angular
        .module('app.modules.catalogue', ['app.services.subject'])
        .directive('modCatalogue', CatalogueModule);

    function CatalogueModule() {
    	console.log('[Catalogue] Init');

    	var directive = {
            restrict: 'A',
            templateUrl: './templates/catalogue.html?' + Math.random(),
            replace: false,
            scope: {},
            controllerAs: 'vm',
            controller: ['$stateParams', '$scope', controller]
        };

        return directive;
    }

    function controller($stateParams, $scope) {
        /*jshint validthis: true */
        var vm = this;
        vm.uri = null;

        activate();

        ////////////

        function activate() {
            $scope.$on('SubjectReady', function(evt, data) {
                console.log('Subject ready');
                vm.uri = data.uri;
            });
        }

    }

})();
