(function() {
    'use strict';

    angular
        .module('app.modules.catalogue', ['app.services.catalogue', 'app.services.subject', 'app.services.config'])
        .directive('modCatalogue', CatalogueDirective)
        .directive('modCatalogueResult', CatalogueResultDirective);

    function CatalogueResultDirective() {
        console.log('[CatalogueResultDirective] Init');

        var directive = {
            restrict: 'E',
            templateUrl: './templates/catalogue-result.html?' + Math.random(),
            replace: true,
            scope: {
                record: '='
            },
            controller: ['$scope', 'Lang', 'Catalogue', 'Config', resultController]
        };

        return directive;
    }

    function resultController($scope, Lang, Catalogue, Config) {
        // @TODO
        $scope.recordExpanded = false;
        $scope.expandGroup = expandGroup;
        $scope.versions = [];

        ////////////

        function expandGroup() {
            var groupId = $scope.record.id;
            $scope.busy = true;
            Catalogue.expandGroup(groupId).then(function(response) {
                console.log('Got response:');
                console.log(response.result.records);
                $scope.busy = false;
                $scope.recordExpanded = true;
                $scope.versions = response.result.records;
            }, function(error) {
                // @TODO: Handle error
                $scope.busy = false;
            });
        }
    }

    function CatalogueDirective() {
    	console.log('[Catalogue] Init');

    	var directive = {
            restrict: 'A',
            templateUrl: './templates/catalogue.html?' + Math.random(),
            replace: false,
            scope: {},
            controllerAs: 'vm',
            controller: ['$stateParams', '$scope', 'Lang', 'Catalogue', 'Config', controller]
        };

        return directive;
    }

    function controller($stateParams, $scope, Lang, Catalogue, Config) {
        /*jshint validthis: true */
        var vm = this;
        vm.uri = null;
        vm.first = 0;
        vm.last = 0;
        vm.next = 0;
        vm.total_results = 0;
        vm.results = [];
        vm.expandGroup = expandGroup;

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

        function expandGroup(id) {
            var url = Config.catalogue.groupUrl.replace('{id}', id);
            console.log(url);

        }

        function search(vocab, term) {
            vm.vocab = vocab;
            vm.term = term;
            Catalogue.search(vocab, term).then(function(response) {
                console.log('Got results from CatalogueService:');
                console.log(response);
                vm.total_results = response.total_results;
                vm.first = response.first;
                vm.next = response.next;
                vm.last = vm.next - 1;

                vm.results = response.results;
            }, function(error) {
                // @TODO Handle error
            });
        }

    }

})();
