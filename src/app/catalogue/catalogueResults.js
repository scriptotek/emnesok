import angular from 'angular';
import {get} from 'lodash/object';
import template from './catalogueResults.html';
export const catalogueResultsComponentName = 'appCatalogueResults';

export const catalogueResultsComponent = {
    template,
    controller: CatalogueResultsController,
    controllerAs: 'vm',
    bindings: {
        subject: '<',
    },
};

/////

/* @ngInject */
function CatalogueResultsController($stateParams, $state, $scope, $window, $timeout, $transitions, gettext, gettextCatalog, $analytics, langService, Catalogue, Config, Session, TitleService) {
    /*jshint validthis: true */
    var vm = this;
    var defaultLang = langService.defaultLanguage;

    vm.vocab = '';
    vm.start = 0;
    vm.last = 0;
    vm.next = 1;
    vm.busy = true;
    vm.error = null;
    vm.total_results = 0;
    vm.results = [];
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


    this.$onInit = function() {
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

        if (!vm.subject) {
            vm.busy = false;
            vm.error = gettextCatalog.getString(
                gettext('The subject was not found. It might have been deleted.')
            );
            return;
        }

        if (vm.subject.data.isReplacedBy.length) {
            var replacement = vm.msgsubject.data.isReplacedBy[0];
            vm.busy = false;
            var replacementTitle = replacement.prefLabel[lang] ? replacement.prefLabel[lang] : replacement.prefLabel[defaultLang];
            vm.error = gettextCatalog.getString(
                gettext('This concept has been replaced by {{subject}}'),
                {
                    subject: `<a ui-sref="subject.search({id: '${replacement.id}', term: null})">${replacementTitle}</a>`
                }
            );
            return;
        } else if (vm.subject.data.deprecated) {
            vm.busy = false;
            vm.error = gettextCatalog.getString(
                gettext('This concept has been deprecated')
            );
            return;
        }

        vm.vocab = vm.subject.vocab;
        vm.indexTerm = vm.subject.data.prefLabel[defaultLang];
        vm.stringSearch = (vm.subject.data._components.length > 0);
        searchFromStart();

        angular.element($window).bind('scroll', onScroll);
        $scope.$on('$destroy', function () {
            angular.element($window).off('scroll', onScroll);
        });

        var lang = langService.language;
        var pageTitle = vm.subject.data.prefLabel[lang] ? vm.subject.data.prefLabel[lang] : vm.subject.data.prefLabel[defaultLang];
        TitleService.set(pageTitle);

        //Flag that indicates if the state is changing
        vm.stateChanging = false;

        //Call some code when a state change starts
        $transitions.onStart({}, function() {
            vm.stateChanging = true;
        });
    };


    ////////////

    function onScroll() {
        if (vm.error) {
            return;
        }
        $scope.$apply(checkScrollPos);
    }

    function checkScrollPos() {
        var scrollPosition = window.pageYOffset;
        var windowHeight = window.innerHeight;
        var body = document.body,
            html = document.documentElement;
        var height = Math.max(body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight);

        vm.distanceFromBottom = height - scrollPosition - windowHeight;

        if (vm.distanceFromBottom < 500) {
            getMoreRecords();
        }
    }

    function filterSubjects(record) {
        if (record.subjects) {

            if (record.subjects.subject) {
                record.subjects.subject = record.subjects.subject.filter(function (s) {
                    return s != 'Electronic books';
                });
            }

            if (record.subjects.genre) {
                record.subjects.genre = record.subjects.genre.filter(function (s) {
                    return s != 'Electronic books';
                });
            }

            // Genres are unfortunately duplicated as subjects. Remove those.
            var genres = get(record, 'subjects.genre', []);
            Object.keys(record.subjects).forEach(function (vocab) {
                if (vocab == 'genre') return;
                record.subjects[vocab] = record.subjects[vocab].filter(function (s) {
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

        response.results.forEach(function (record) {
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

        if (vm.subject.data._components.length) {
            places = vm.subject.data._components.filter(function (component) {
                return component.type == 'Geographic';
            });
            genres = vm.subject.data._components.filter(function (component) {
                return component.type == 'GenreForm';
            });
            topics = vm.subject.data._components.filter(function (component) {
                return component.type == 'Topic';
            });
            topics.sort(function (a, b) {
                var alab = a.prefLabel[defaultLang], blab = b.prefLabel[defaultLang],
                    tlab = vm.subject.data.prefLabel[defaultLang].split(' : ');
                return tlab.indexOf(alab) - tlab.indexOf(blab);
            });
        } else {
            if (vm.subject.data.type == 'Geographic') {
                places = [vm.subject.data];
            } else if (vm.subject.data.type == 'GenreForm') {
                genres = [vm.subject.data];
            } else {
                topics = [vm.subject.data];
            }
        }

        var q = {};
        if (places.length) {
            q.place = places.map(function (subject) {
                return getPrefLabels(subject, places.length == 1);
            }).join(' AND ');
        }
        if (genres.length) {
            q.genre = genres.map(function (genre) {
                return getPrefLabels(genre, genres.length == 1);
            }).join(' AND ');
        }
        if (topics.length) {
            q.subject = topics.map(function (subject) {
                return getPrefLabels(subject, topics.length == 1);
            }).join(vm.broadSearch ? ' AND ' : ' : ');
        }
        if (!vm.broadSearch) {
            q.vocab = vm.vocab;
        }
        if (vm.subject.data.notation.length) {
            q.subject = vm.subject.data.notation[0];
        }

        vm.busy = true;
        vm.searchQuery = q;

        Catalogue.search(q, vm.next, inst, lib, vm.broadSearch).then(
            gotResults,
            function () {
                vm.error = gettextCatalog.getString(
                    gettext('Uh oh, some kind of server error occured.')
                );
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
