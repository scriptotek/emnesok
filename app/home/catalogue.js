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

    resultController.$inject = ['Lang', 'Catalogue', 'Config', 'SubjectService', '$state', 'ngToast', 'gettext', 'gettextCatalog'];

    function resultController(Lang, Catalogue, Config, SubjectService, $state, ngToast, gettext, gettextCatalog) {
        /*jshint validthis: true */
        var vm = this;

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
                    var msg = gettext('Sorry, the subject "{{subject}}" was not found in the current vocabulary.');
                    var translated = gettextCatalog.getString(msg, { subject: subject });
                    ngToast.danger(translated, 'danger');
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
                vm.busy = false;
                var msg = gettext('Failed to fetch list of editions.');
                var translated = gettextCatalog.getString(msg);
                ngToast.danger(translated, 'danger');
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

    controller.$inject = ['$stateParams', '$state', '$scope', '$window', '$timeout', 'ngToast', 'gettext', 'gettextCatalog', 'Lang', 'Catalogue', 'Config', 'Session', 'subject'];

    function controller($stateParams, $state, $scope, $window, $timeout, ngToast, gettext, gettextCatalog, Lang, Catalogue, Config, Session, subject) {
        /*jshint validthis: true */
        var vm = this;
        vm.vocab = '';
        vm.start = 0;
        vm.last = 0;
        vm.next = 1;
        vm.busy = true;
        vm.error = null;
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

        var bs = gettext('broad search');
        var ns = gettext('narrow search');
        vm.broadSearch = ($stateParams.broad === undefined) ? true : ($stateParams.broad == 'true');
        vm.searchType = vm.broadSearch ? gettextCatalog.getString(bs) : gettextCatalog.getString(ns);

        vm.updateControlledSearch = updateControlledSearch;

        activate();

        ////////////

        function activate() {
            if (!subject) {
                vm.busy = false;
                var msg = gettext('The subject was not found. It might have been deleted.');
                vm.error = gettextCatalog.getString(msg);
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

        function simplifyAvailability(subject) {
            var availability = '';
            // @TODO: Show libraries if vm.selectedInstitution

            var printInstitutions = [];
            console.log(subject);
            subject.components.forEach(function(component) {
                if (component.holdings) {
                    component.holdings.forEach(function(holding) {
                        var library = holding.library.replace(/[0-9]+/, '');
                        if (printInstitutions.indexOf(library) === -1 && library) {
                            printInstitutions.push(library);
                        }
                    });
                }
            });
            subject.availability = {};
            subject.availability.print = printInstitutions;
        }

        function onScroll () {
            if (vm.error) {
                return;
            }
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
            response.results.forEach(function(res) {
                simplifyAvailability(res);
            });
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
            var vocab = subject.data.type == 'Geographic' ? 'geo' : vm.broadSearch ? vm.vocab : '';
            var defaultLang = Lang.defaultLanguage;
            var query = subject.data.prefLabel[defaultLang];
            if (subject.data.prefLabel.en !== undefined && subject.data.prefLabel.en !== subject.data.prefLabel[defaultLang]) {
                query = query + ',' + subject.data.prefLabel.en;
            }
            vm.busy = true;
            Catalogue.search(vocab, query, vm.next, inst, lib).then(
                gotResults,
                function(error) {
                    var msg = gettext('Uh oh, some kind of server error occured.');
                    vm.error = gettextCatalog.getString(msg);
                    vm.busy = false;
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
            if (library) {
                $state.go('subject.search', {library: vm.selectedInstitution + ':' + library});
            } else {
                $state.go('subject.search', {library: vm.selectedInstitution});
            }
        }

        function updateControlledSearch() {
            $state.go('subject.search', {broad: vm.broadSearch});
        }

    }

})();
