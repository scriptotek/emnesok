(function() {
    'use strict';

    angular
        .module('app.modules.catalogue', ['app.services.catalogue', 'app.services.subject', 'app.services.config', 'app.services.session'])
        .directive('modCatalogue', CatalogueDirective)
        .directive('modCatalogueResult', CatalogueResultDirective);

    function CatalogueResultDirective() {
        console.log('[CatalogueResultDirective] Init');

        var directive = {
            restrict: 'EA',
            templateUrl: './templates/catalogue-result.html?' + Math.random(),
            replace: false,
            scope: {
                record: '=',
                vocab: '='
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
            controller: ['$stateParams', '$scope', '$window', '$timeout', 'Lang', 'Catalogue', 'Config', 'Session', controller]
        };

        return directive;
    }

    function controller($stateParams, $scope, $window, $timeout, Lang, Catalogue, Config, Session) {
        /*jshint validthis: true */
        var vm = this;
        vm.vocab = '';
        vm.term = '';
        vm.start = 0;
        vm.last = 0;
        vm.next = 1;
        vm.busy = true;
        vm.total_results = 0;
        vm.results = [];
        vm.expandGroup = expandGroup;
        vm.getMoreRecords = getMoreRecords;

        vm.institutions = Config.institutions;
        vm.selectedInstitution = Session.selectedInstitution;
        vm.selectedLibrary = Session.selectedLibrary;
        vm.selectInstitution = selectInstitution;
        vm.selectLibrary = selectLibrary;

        vm.controlledSearch = Session.controlledSearch;
        vm.updateControlledSearch = updateControlledSearch;

        activate();

        ////////////

        function activate() {
            var defaultLang = Lang.defaultLanguage;
            $scope.$on('SubjectReady', function(evt, data) {
                vm.vocab = data.vocab;
                vm.term = data.data.prefLabel[defaultLang];
                searchFromStart();
            });

            // scope.$on('$destroy', function() {
            //     return target.off('scroll', handler);
            // });

            angular.element($window).bind('scroll', function() { $scope.$apply(checkScrollPos); });
        }

        function checkScrollPos() {
            var scrollPosition = window.pageYOffset;
            var windowHeight   = window.innerHeight;
            var bodyHeight     = document.body.offsetHeight;
            var body = document.body,
                html = document.documentElement;
            var height = Math.max( body.scrollHeight, body.offsetHeight,
                                   html.clientHeight, html.scrollHeight, html.offsetHeight );

            vm.distanceFromBottom = height - scrollPosition - windowHeight;

            if (vm.distanceFromBottom < 500) {
                getMoreRecords();
            }
        }

        function expandGroup(id) {
            var url = Config.catalogue.groupUrl.replace('{id}', id);
        }

        function gotResults(response) {
            vm.total_results = response.total_results;
            vm.start = response.first;
            vm.next = response.next;
            vm.last = vm.next ? vm.next - 1 : vm.total_results;
            vm.results = vm.results.concat(response.results);
            vm.busy = false;
            $timeout(checkScrollPos, 500);
        }

        function getMoreRecords() {
            if (vm.vocab && vm.term && vm.next && !vm.busy) {
                search();
            }
        }

        function search() {
            var inst = vm.selectedInstitution ? vm.selectedInstitution.id : null;
            var lib = vm.selectedLibrary ? vm.selectedLibrary.id : null;
            var vocab = vm.controlledSearch ? vm.vocab : '';
            vm.busy = true;
            Catalogue.search(vocab, vm.term, vm.next, inst, lib).then(
                gotResults,
                function(error) {
                    // @TODO Handle error
                }
            );
        }

        function searchFromStart() {
            vm.results = [];
            vm.start = 0;
            vm.next = 1;
            search();
        }

        function selectInstitution(institution) {
            Session.selectInstitution(institution);
            vm.selectedInstitution = institution;
            vm.selectedLibrary = null;
            searchFromStart();
        }

        function selectLibrary(library) {
            Session.selectLibrary(library);
            vm.selectedLibrary = library;
            searchFromStart();
        }

        function updateControlledSearch() {
            Session.controlledSearch = vm.controlledSearch;
            searchFromStart();
        }

    }

})();
