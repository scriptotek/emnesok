(function() {
    'use strict';

    angular
        .module('app.modules.catalogue', ['app.services.catalogue', 'app.services.subject'])
        .directive('modCatalogue', CatalogueModule);

    function CatalogueModule() {
    	console.log('[Catalogue] Init');

    	var directive = {
            restrict: 'A',
            templateUrl: './templates/catalogue.html?' + Math.random(),
            replace: false,
            scope: {},
            controllerAs: 'vm',
            controller: ['$stateParams', '$scope', 'Lang', 'Catalogue', controller]
        };

        return directive;
    }

    function controller($stateParams, $scope, Lang, Catalogue) {
        /*jshint validthis: true */
        var vm = this;
        vm.uri = null;

        activate();

        ////////////

        function activate() {
            var defaultLang = Lang.defaultLanguage;
            $scope.$on('SubjectReady', function(evt, data) {
                console.log('Subject ready');
                console.log(data);
                vm.uri = data.uri;
                search(data.vocab, data.data.prefLabel[defaultLang]);
            });
        }

        function search(vocab, term) {
            vm.vocab = vocab;
            vm.term = term;
            Catalogue.search(vocab, term).then(function(response) {
                console.log('Got results from CatalogueService:');
                console.log(response);
            }, function(error) {
                // @TODO Handle error
            });
        }

    }

})();
