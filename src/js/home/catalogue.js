(function() {
    'use strict';

    angular
        .module('app.modules.catalogue', ['app.services.catalogue', 'app.services.subject', 'app.services.lang', 'app.services.config', 'app.services.session'])
        .controller('CatalogueController', controller)
        .directive('modCatalogueResult', CatalogueResultDirective)
        .directive('modAvailability', AvailabilityDirective)
        ;

    /* ------------------------------------------------------------------------------- */

    function AvailabilityDirective() {

        var directive = {
            restrict: 'EA',
            templateUrl: 'app/availability.html',
            replace: false,
            scope: {
                record: '='
            },
            controllerAs: 'vm',
            controller: availabilityController,
            bindToController: true // because the scope is isolated
        };

        return directive;
    }

    availabilityController.$inject = [];

    function availabilityController() {
        /*jshint validthis: true */
        var vm = this;

        ////////////
    }

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

    resultController.$inject = ['Lang', 'Catalogue', 'Config', 'SubjectService', '$state', 'ngToast', 'gettext', 'gettextCatalog', '$analytics', '$stateParams'];

    function resultController(Lang, Catalogue, Config, SubjectService, $state, ngToast, gettext, gettextCatalog, $analytics, $stateParams) {
        /*jshint validthis: true */
        var vm = this;

        vm.recordExpanded = false;
        vm.clickSubject = clickSubject;
        vm.expandGroup = expandGroup;
        vm.versions = [];
        vm.filterPrint = filterPrint;
        vm.filterElectronic = filterElectronic;
        vm.getStatus = getStatus;
        vm.selectedInstitution = $stateParams.library ? $stateParams.library.split(':')[0] : null;
        vm.vocabularies = Config.vocabularies;
        vm.busy = false;


        ////////////

        function clickSubject(subject) {
            if (vm.busy) {
                return;
            }
            vm.busy = true;

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
            Catalogue.expandGroup(groupId, vm.selectedInstitution).then(function(response) {
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
            vm.broadSearch = ($stateParams.broad === undefined) ? false : ($stateParams.broad == 'true');
            vm.searchType = vm.broadSearch ? gettextCatalog.getString(bs) : gettextCatalog.getString(ns);

            if (!subject) {
                vm.busy = false;
                var msg = gettext('The subject was not found. It might have been deleted.');
                vm.error = gettextCatalog.getString(msg);
                return;
            }

            if (subject.data.isReplacedBy.length) {
                var replacement = subject.data.isReplacedBy[0];
                vm.busy = false;
                var msg = gettext('This concept has been replaced by {{subject}}');
                var replacementTitle = replacement.prefLabel[lang] ? replacement.prefLabel[lang] : replacement.prefLabel[defaultLang];
                vm.error = gettextCatalog.getString(msg, {
                    subject: '<a ui-sref="subject.search({id: \'' + replacement.id + '\', term: null})">' + replacementTitle + '</a>'
                });
                return;
            } else if (subject.data.deprecated) {
                vm.busy = false;
                var msg = gettext('This concept has been depreacted');
                vm.error = gettextCatalog.getString(msg);
                return;
            }

            vm.vocab = subject.vocab;
            vm.subject = subject;
            vm.indexTerm = subject.data.prefLabel[defaultLang];
            vm.stringSearch = (subject.data._components.length > 0);
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
            $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                vm.stateChanging = true;
            });
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

        function filterSubjects(record) {
            if (record.subjects) {
                console.log(record.subjects);


                if (record.subjects.subject) {
                    record.subjects.subject = record.subjects.subject.filter(function(s) {
                        return s != 'Electronic books';
                    });
                }

                if (record.subjects.genre) {
                    record.subjects.genre = record.subjects.genre.filter(function(s) {
                        return s != 'Electronic books';
                    });
                }

                // Genres are unfortunately duplicated as subjects. Remove those.
                var genres = _.get(record, 'subjects.genre', []);
                Object.keys(record.subjects).forEach(function (vocab) {
                    if (vocab == 'genre') return;
                    record.subjects[vocab] = record.subjects[vocab].filter(function(s) {
                        return genres.indexOf(s) === -1;
                    });
                });
            }
        }

        function gotResults(response) {
            vm.total_results = response.total_results;
            vm.start = response.first;
            vm.next = response.next;
            vm.last = vm.next ? vm.next - 1 : vm.total_results;

            response.results.forEach(function(record) {
                filterSubjects(record);
                if (record.thumbnails && record.thumbnails.bibsys) {
                    record.thumbnails.bibsys = record.thumbnails.bibsys.replace('http:', 'https:');
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

            if (subject.data._components.length) {
                places = subject.data._components.filter(function(component) {
                    return component.type == 'Geographic';
                });
                genres = subject.data._components.filter(function(component) {
                    return component.type == 'GenreForm';
                });
                topics = subject.data._components.filter(function(component) {
                    return component.type == 'Topic';
                });
                topics.sort(function(a, b) {
                    var alab = a.prefLabel[defaultLang], blab = b.prefLabel[defaultLang], tlab = subject.data.prefLabel[defaultLang].split(' : ');
                    return tlab.indexOf(alab) - tlab.indexOf(blab);
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
            if (subject.data.notation.length) {
                q.subject = subject.data.notation[0];
            }

            vm.busy = true;
            vm.searchQuery = q;

            Catalogue.search(q, vm.next, inst, lib, vm.broadSearch).then(
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
