(function() {
    'use strict';

    angular
        .module('app.modules.catalogue', ['app.services.catalogue', 'app.services.subject', 'app.services.lang', 'app.services.config', 'app.services.session'])
        .controller('CatalogueController', controller)
        .directive('modCatalogueResult', CatalogueResultDirective)
        ;

    /* ------------------------------------------------------------------------------- */

    function CatalogueResultDirective() {

        var directive = {
            restrict: 'EA',
            templateUrl: 'app/catalogue-result.html',
            replace: false,
            scope: {
                record: '=',
                vocab: '=',
                indexTerm: '='
            },
            controllerAs: 'vm',
            controller: resultController,
            bindToController: true // because the scope is isolated
        };

        return directive;
    }

    resultController.$inject = ['Lang', 'Catalogue', 'Config', 'SubjectService', '$state', 'ngToast', 'gettext', 'gettextCatalog', '$analytics'];

    function resultController(Lang, Catalogue, Config, SubjectService, $state, ngToast, gettext, gettextCatalog, $analytics) {
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

            console.log(subject);
            $analytics.eventTrack('ClickTag', {category: 'UncontrolledTag', label: subject});

            SubjectService.exists(subject, vm.vocab).then(function(response) {
                vm.busy = false;
                if (!response) {
                    $analytics.eventTrack('TagLookupFailed', {
                        category: 'UncontrolledTag',
                        label: subject,
                        nonInteraction: true
                    });

                    var msg = gettext('Sorry, the subject "{{subject}}" was not found in the current vocabulary.');
                    var translated = gettextCatalog.getString(msg, { subject: subject });
                    ngToast.danger(translated, 'danger');
                } else {
                    $analytics.eventTrack('TagLookupSuccess', {
                        category: 'UncontrolledTag',
                        label: subject,
                        nonInteraction: true
                    });
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

    controller.$inject = ['$stateParams', '$state', '$scope', '$window', '$timeout', 'ngToast', 'gettext', 'gettextCatalog', '$analytics', 'Lang', 'Catalogue', 'Config', 'Session', 'TitleService', 'Institutions', 'subject'];

    function controller($stateParams, $state, $scope, $window, $timeout, ngToast, gettext, gettextCatalog, $analytics, Lang, Catalogue, Config, Session, TitleService, Institutions, subject) {
        /*jshint validthis: true */
        var vm = this;
        var defaultLang = Lang.defaultLanguage;

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
        vm.stringSearch = false;

        vm.selectInstitution = selectInstitution;
        vm.selectLibrary = selectLibrary;

        vm.institutions = Config.institutions;
        vm.selectedInstitution = null;
        vm.selectedLibrary = null;

        vm.broadSearch = false;
        vm.searchType = '';
        vm.searchQuery = '';

        vm.updateControlledSearch = updateControlledSearch;

        activate();

        ////////////

        function activate() {
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

            if (!subject) {
                vm.busy = false;
                var msg = gettext('The subject was not found. It might have been deleted.');
                vm.error = gettextCatalog.getString(msg);
                return;
            }
            vm.vocab = subject.vocab;
            vm.subject = subject;
            vm.indexTerm = subject.data.prefLabel[defaultLang];
            vm.stringSearch = (subject.data.components.length > 0);
            searchFromStart();

            angular.element($window).bind('scroll', onScroll);
            $scope.$on('$destroy', function() {
                angular.element($window).off('scroll', onScroll);
            });

            var lang = Lang.language;
            var pageTitle = subject.data.prefLabel[lang] ? subject.data.prefLabel[lang] : subject.data.prefLabel[defaultLang];
            TitleService.set(pageTitle);

            //Flag that indicates if the state is changing
            vm.stateChanging = false;

            //Call some code when a state change starts
            $scope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                vm.stateChanging = true;
                // console.info('STATE CHANGE');
            });
        }

        function simplifyAvailability(subject) {
            var availability = '';
            // @TODO: Show libraries if vm.selectedInstitution

            subject.availability = {};

            var myInstitution = vm.selectedInstitution || 'UBO';  // @TODO: Default based on IP address

            // Print availability
            var printInstitutions = [];
            var electronic = [];
            subject.components.forEach(function(component) {
                if (component.holdings) {
                    component.holdings.forEach(function(holding) {
                        var library = holding.library.replace(/[0-9]+/, '');
                        if (printInstitutions.indexOf(library) === -1 && library) {
                            printInstitutions.push(library);
                        }
                    });
                    component.holdings = null;
                }
            });

            if (printInstitutions.length > 0) {
                var printInstitutionsStr = '';
                if (printInstitutions.indexOf(myInstitution) != -1) {
                    if (printInstitutions.length > 1) {
                        // MyLibrary and n other libraries
                        printInstitutionsStr = gettextCatalog.getPlural(printInstitutions.length - 1,
                            'Print copy at {{library}} and one other library.',
                            'Print copy at {{library}} and {{$count}} other libraries.',
                            {library: Institutions.getName(myInstitution)}
                        );
                    } else {
                        // MyLibrary
                        printInstitutionsStr = gettextCatalog.getString('Print copy at {{library}}.', {
                            library: Institutions.getName(myInstitution)
                        });
                    }
                } else if (printInstitutions.length == 1) {
                    // Lib1
                    printInstitutionsStr = gettextCatalog.getString('Print copy at {{library}}.', {
                        library: Institutions.getName(printInstitutions[0])
                    });
                } else if (printInstitutions.length <= 4) {
                    // Lib1, Lib2, Lib3 and lib 4
                    var last = printInstitutions.pop();
                    printInstitutionsStr = gettextCatalog.getString('Print copy at {{institutions}} and {{lastInstitution}}.', {
                        institutions: printInstitutions.map(function(k) { return Institutions.getName(k); }).join(', '),
                        lastInstitution: Institutions.getName(last)
                    });
                } else {
                    // Lib1, Lib2, Lib3 and n. more libraries (where n >= 2)
                    printInstitutionsStr = gettextCatalog.getString('Print copy at {{institutions}} and {{count}} more libraries.', {
                        institutions: printInstitutions.slice(0, 4).map(function(k) { return Institutions.getName(k); }).join(', '),
                        count: printInstitutions.length - 3
                    });
                }
                subject.availability.print = printInstitutionsStr;
            }

            // Electronic availability
            if (subject.urls.length > 0) {
                gettext('Available online');
                subject.availability.electronic = {
                    url: subject.urls[0].url,
                    description: gettextCatalog.getString(subject.urls[0].description)
                };
            }
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

        function filterSubjects(res) {
            if (res.subjects && res.subjects.subject) {
                res.subjects.subject = res.subjects.subject.filter(function(s) {
                    return s != 'Electronic books';
                });
            }
            if (res.subjects && res.subjects.genre) {
                res.subjects.genre = res.subjects.genre.filter(function(s) {
                    return s != 'Electronic books';
                });
            }
        }

        function gotResults(response) {
            vm.total_results = response.total_results;
            vm.start = response.first;
            vm.next = response.next;
            vm.last = vm.next ? vm.next - 1 : vm.total_results;
            response.results.forEach(function(res) {
                simplifyAvailability(res);
                filterSubjects(res);
                console.log(res);
                if (res.thumbnails.bibsys) {
                    res.thumbnails.bibsys = res.thumbnails.bibsys.replace('http:', 'https:');
                }
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

        function getPrefLabels(subject, includeEnglish) {
            var prefLabels = subject.prefLabel[defaultLang];
            if (includeEnglish && subject.prefLabel.en !== undefined && subject.prefLabel.en !== subject.prefLabel[defaultLang]) {
                prefLabels = prefLabels + ' OR ' + subject.prefLabel.en;
            }
            return prefLabels;
        }

        function search() {
            var inst = vm.selectedInstitution ? vm.selectedInstitution : null;
            var lib = vm.selectedLibrary ? vm.selectedInstitution + vm.selectedLibrary : null;
            var topics = [], places = [], genres = [];

            if (subject.data.components.length) {
                places = subject.data.components.filter(function(component) {
                    return component.type == 'Geographic';
                });
                genres = subject.data.components.filter(function(component) {
                    return component.type == 'GenreForm';
                });
                topics = subject.data.components.filter(function(component) {
                    return component.type == 'Topic';
                });
            } else {
                if (subject.data.type == 'Geographic') {
                    places = [subject.data];
                } else if (subject.data.type == 'GenreForm') {
                    genres = [subject.data];
                } else {
                    topics = [subject.data];
                }
            }

            var q = {};
            if (places.length) {
                q.place = places.map(function(subject) {
                    return getPrefLabels(subject, places.length == 1);
                }).join(' AND ');
            }
            if (genres.length) {
                q.genre = genres.map(function(genre) {
                    return getPrefLabels(genre, genres.length == 1);
                }).join(' AND ');
            }
            if (topics.length) {
                q.subject = topics.map(function(subject) {
                    return getPrefLabels(subject, topics.length == 1);
                }).join(vm.broadSearch ? ' AND ' : ' : ');
            }
            if (!vm.broadSearch) {
                q.vocab = vm.vocab;
            }

            vm.busy = true;
            vm.searchQuery = q;

            Catalogue.search(q, vm.next, inst, lib).then(
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
            $analytics.eventTrack('SetInstitution', {category: 'RefineSearch', label: institution});
            $state.go('subject.search', {library: institution});
        }

        function selectLibrary(library) {
            $analytics.eventTrack('SetLibrary', {category: 'RefineSearch', label: library});
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
