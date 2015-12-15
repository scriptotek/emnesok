(function() {
    'use strict';

    angular
        .module('app.modules.catalogue', ['app.services.catalogue', 'app.services.subject', 'app.services.lang', 'app.services.config', 'app.services.session'])
        .controller('CatalogueController', ['$stateParams', '$state', '$scope', '$window', '$timeout', 'Lang', 'Catalogue', 'Config', 'Session', 'subject', controller])
        .directive('modCatalogueResult', CatalogueResultDirective)
        ;

    /* ------------------------------------------------------------------------------- */

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
            controllerAs: 'vm',
            controller: ['Lang', 'Catalogue', 'Config', resultController],
            bindToController: true // because the scope is isolated
        };

        return directive;
    }

    function resultController(Lang, Catalogue, Config) {
        /*jshint validthis: true */
        var vm = this;

        // @TODO
        vm.recordExpanded = false;
        vm.expandGroup = expandGroup;
        vm.versions = [];
        vm.filterPrint = filterPrint;
        vm.filterElectronic = filterElectronic;
        vm.getStatus = getStatus;

        ////////////

        function expandGroup() {
            var groupId = vm.record.id;
            vm.busy = true;
            Catalogue.expandGroup(groupId).then(function(response) {
                console.log('Got response:');
                console.log(response.result.records);
                vm.busy = false;
                vm.recordExpanded = true;
                vm.versions = response.result.records;
            }, function(error) {
                // @TODO: Handle error
                vm.busy = false;
            });
        }

        function filterPrint(component) {
            return component.category == 'Alma-P';
        }

        function filterElectronic(component) {
            return component.category !== undefined && component.category !== 'Alma-P';
        }

        function getStatus(status) {
            var statuses = {
                'check_holdings': 'might be available'
            };
            return statuses[status] || status;
        }
    }

    /* ------------------------------------------------------------------------------- */

    function controller($stateParams, $state, $scope, $window, $timeout, Lang, Catalogue, Config, Session, subject) {
        /*jshint validthis: true */
        var vm = this;
        vm.vocab = '';
        vm.term = '';
        vm.start = 0;
        vm.last = 0;
        vm.next = 1;
        vm.busy = true;
        vm.subjectNotFound = false;
        vm.total_results = 0;
        vm.results = [];
        vm.expandGroup = expandGroup;
        vm.getMoreRecords = getMoreRecords;

        vm.institutions = Config.institutions;
        vm.selectedInstitution = Session.selectedInstitution;
        vm.selectedLibrary = Session.selectedLibrary;
        vm.selectInstitution = selectInstitution;
        vm.selectLibrary = selectLibrary;

        vm.controlledSearch = ($stateParams.narrow == 'true');
        vm.updateControlledSearch = updateControlledSearch;

        activate();

        ////////////

        function activate() {
            var defaultLang = Lang.defaultLanguage;

            if (!subject) {
                vm.busy = false;
                vm.subjectNotFound = true;
                return;
            }
            vm.vocab = subject.vocab;
            vm.term = subject.data.prefLabel[defaultLang];
            searchFromStart();

            angular.element($window).bind('scroll', onScroll);
            $scope.$on('$destroy', function() {
                angular.element($window).off('scroll', onScroll);
            });
        }

        function onScroll () {
            $scope.$apply(checkScrollPos);
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
            $state.go('subject.search', {narrow: vm.controlledSearch});
        }

    }

})();
