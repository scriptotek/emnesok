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
function CatalogueResultsController(
    $stateParams, $state, $scope, $window, $timeout, $transitions, gettext, gettextCatalog, $analytics, langService, Catalogue, Config, Session, TitleService, QueryBuilder
) {
    /*jshint validthis: true */
    var vm = this;
    var defaultLang = langService.defaultLanguage;

    vm.vocab = '';
    vm.start = 0;
    vm.offset = 0;
    vm.busy = true;
    vm.error = null;
    vm.total_results = -1;
    vm.results = [];
    vm.getMoreRecords = getMoreRecords;
    vm.stringSearch = false;

    vm.selectInstitution = selectInstitution;
    vm.selectLibrary = selectLibrary;
    vm.setMappingExpansion = setMappingExpansion;

    vm.institutions = Config.institutions;
    vm.selectedInstitution = null;
    vm.selectedLibrary = null;

    vm.broadSearch = false;
    vm.searchType = '';
    vm.query = null;

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

        if (vm.subject.isReplacedBy.length) {
            var replacement = vm.subject.isReplacedBy[0];
            vm.busy = false;
            var replacementTitle = replacement.prefLabel[lang] ? replacement.prefLabel[lang] : replacement.prefLabel[defaultLang];
            vm.error = gettextCatalog.getString(
                gettext('This concept has been replaced by {{subject}}'),
                {
                    subject: `<a ui-sref="subject.search({id: '${replacement.id}', term: null})">${replacementTitle}</a>`
                }
            );
            return;
        } else if (vm.subject.deprecated) {
            vm.busy = false;
            vm.error = gettextCatalog.getString(
                gettext('This concept has been deprecated')
            );
            return;
        }

        vm.vocab = vm.subject.vocab;
        vm.indexTerm = vm.subject.prefLabel[defaultLang];
        vm.stringSearch = (vm.subject._components.length > 0);
        searchFromStart();

        angular.element($window).bind('scroll', onScroll);
        $scope.$on('$destroy', function () {
            angular.element($window).off('scroll', onScroll);
        });

        var lang = langService.language;
        var pageTitle = vm.subject.prefLabel[lang] ? vm.subject.prefLabel[lang] : vm.subject.prefLabel[defaultLang];
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

    // function filterSubjects(record) {
    //     if (record.subjects) {

    //         if (record.subjects.subject) {
    //             record.subjects.subject = record.subjects.subject.filter(function (s) {
    //                 return s != 'Electronic books';
    //             });
    //         }

    //         if (record.subjects.genre) {
    //             record.subjects.genre = record.subjects.genre.filter(function (s) {
    //                 return s != 'Electronic books';
    //             });
    //         }

    //         // Genres are unfortunately duplicated as subjects. Remove those.
    //         var genres = get(record, 'subjects.genre', []);
    //         Object.keys(record.subjects).forEach(function (vocab) {
    //             if (vocab == 'genre') return;
    //             record.subjects[vocab] = record.subjects[vocab].filter(function (s) {
    //                 return genres.indexOf(s) === -1;
    //             });
    //         });
    //     }
    // }

    function gotResults(response) {
        console.log('Got results', response);
        
        vm.total_results = response.total_results;
        vm.start = response.first;
        vm.offset = response.last;
        // vm.offset = (vm.last != vm.total_results) ? vm.last + 1 : null;
        
        // response.records.forEach(function (record) {
        //     filterSubjects(record);
        // });

        vm.results = vm.results.concat(response.records);
        vm.busy = false;
        $timeout(checkScrollPos, 500);
    }

    function getMoreRecords() {
        if (vm.vocab && vm.offset != vm.total_results && !vm.busy) {
            search();
        }
    }

    function search() {
        var inst = vm.selectedInstitution ? vm.selectedInstitution : null;
        var lib = vm.selectedLibrary ? vm.selectedInstitution + vm.selectedLibrary : null;

        var query = (new QueryBuilder({}, vm.broadSearch, langService.defaultLanguage))
            .whereSubject(vm.subject);

        var mappingRelations = vm.broadSearch ? ['skos:exactMatch', 'skos:closeMatch'] : ['skos:exactMatch'];
        var mappingVocabularies = Object.keys(Config.vocabularies);

        var useMappingExpansion = (sessionStorage.getItem('emnesok_mappingExpansion', 'false') == 'true'); 
        console.log('Use mapping exp?', useMappingExpansion);
        vm.useMappingExpansion = useMappingExpansion;

        let mappings = vm.subject.mappings.filter(
            x => mappingVocabularies.indexOf(x.to.vocabulary) !== -1
            && mappingRelations.indexOf(x.type) !== -1
            && get(x, 'to.notation', '').indexOf('--') === -1  // Remove table numbers
        );
        vm.mappings = mappings;

        if (useMappingExpansion) {
            mappings.forEach(mapping => {
                var vocab = Config.vocabularies[mapping.to.vocabulary];
                console.log(vocab);
                let value = vocab.notationSearch ? mapping.to.notation : mapping.to.prefLabel[vocab.defaultLanguage];
                query.orWhere(vocab.primo_index, 'exact', value);
                // TODO: Make a repr() method on the model instead
                mapping.to.repr = `«${value}» i ${vocab.name}`;
            });   
        }
        
        query.where('facet_local4', inst)
            .where('facet_library', lib);

        console.log('QUERY:', query);

        vm.busy = true;
        vm.query = query;

        Catalogue.search(query.build(), vm.offset, inst, lib, vm.broadSearch).then(
            gotResults,
            function (err) {
                console.error(err);
                vm.error = gettextCatalog.getString(
                    gettext('Uh oh, some kind of server error occured.')
                ) + '<br>' + err;
                vm.busy = false;
                // @TODO Handle error
            }
        );
    }

    function setMappingExpansion(state) {
        sessionStorage.setItem('emnesok_mappingExpansion', state);
        searchFromStart();
    }

    function searchFromStart() {
        vm.results = [];
        vm.mappings = [];
        vm.start = 0;
        vm.offset = 0;
        vm.total_results = -1;
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
