(function() {
    'use strict';

    angular
        .module('app.modules.catalogue', ['app.services.catalogue', 'app.services.subject', 'app.services.lang', 'app.services.config', 'app.services.session'])
        .controller('CatalogueController', controller)
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
            controller: resultController,
            bindToController: true // because the scope is isolated
        };

        return directive;
    }

    resultController.$inject = ['Lang', 'Catalogue', 'Config', 'SubjectService', '$state'];

    function resultController(Lang, Catalogue, Config, SubjectService, $state) {
        /*jshint validthis: true */
        var vm = this;

        // @TODO
        vm.recordExpanded = false;
        vm.clickSubject = clickSubject;
        vm.expandGroup = expandGroup;
        vm.versions = [];
        vm.filterPrint = filterPrint;
        vm.filterElectronic = filterElectronic;
        vm.getStatus = getStatus;
        vm.busy = false;


        ////////////

        function clickSubject(subject) {
            if (vm.busy) {
                return;
            }
            vm.busy = true;
            SubjectService.exists(subject, vm.vocab).then(function(response) {
                vm.busy = false;
                console.log(response);
                if (!response) {
                    console.error('Emnet ble ikke funnet');
                } else {
                    $state.go('subject.search', {id: response.localname, term: null});
                }
            }, function(err) {

            });
        }

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

    controller.$inject = ['$stateParams', '$state', '$scope', '$window', '$timeout', 'Lang', 'Catalogue', 'Config', 'Session', 'subject'];

    function controller($stateParams, $state, $scope, $window, $timeout, Lang, Catalogue, Config, Session, subject) {
        /*jshint validthis: true */
        var vm = this;
        vm.vocab = '';
        vm.start = 0;
        vm.last = 0;
        vm.next = 1;
        vm.busy = true;
        vm.subjectNotFound = false;
        vm.total_results = 0;
        vm.results = [];
        vm.expandGroup = expandGroup;
        vm.getMoreRecords = getMoreRecords;

        vm.selectInstitution = selectInstitution;
        vm.selectLibrary = selectLibrary;

        vm.institutions = Config.institutions;
        if ($stateParams.library && $stateParams.library.indexOf(':') != -1) {
            vm.selectedInstitution = $stateParams.library.split(':')[0];
            vm.selectedLibrary = $stateParams.library.split(':')[1];
        } else {
            vm.selectedInstitution = $stateParams.library;
            vm.selectedLibrary = null;
        }

        vm.controlledSearch = ($stateParams.narrow == 'true');
        vm.updateControlledSearch = updateControlledSearch;

        activate();

        ////////////

        function activate() {
            if (!subject) {
                vm.busy = false;
                vm.subjectNotFound = true;
                return;
            }
            vm.vocab = subject.vocab;
            vm.subject = subject;
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
            if (vm.vocab && vm.next && !vm.busy) {
                search();
            }
        }

        function search() {
            var inst = vm.selectedInstitution ? vm.selectedInstitution : null;
            var lib = vm.selectedLibrary ? vm.selectedInstitution + vm.selectedLibrary : null;
            var vocab = subject.data.type == 'Geographic' ? 'geo' : vm.controlledSearch ? vm.vocab : '';
            var defaultLang = Lang.defaultLanguage;
            var query = subject.data.prefLabel[defaultLang];
            if (subject.data.prefLabel.en !== undefined && subject.data.prefLabel.en !== subject.data.prefLabel[defaultLang]) {
                query = query + ',' + subject.data.prefLabel.en;
            }
            vm.busy = true;
            Catalogue.search(vocab, query, vm.next, inst, lib).then(
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
            $state.go('subject.search', {library: institution});
        }

        function selectLibrary(library) {
            $state.go('subject.search', {library: vm.selectedInstitution + ':' + library});
        }

        function updateControlledSearch() {
            $state.go('subject.search', {narrow: vm.controlledSearch});
        }

    }

})();
