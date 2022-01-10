import angular from 'angular';
import {uniqBy} from 'lodash/array';
import template from './searchBox.html';

export const searchBoxComponentName = 'appSearchBox';

export const searchBoxComponent = {
    template,
    controller: SearchBoxController,
    controllerAs: 'vm',
    bindings: {
        'data': '<',
    },
};

/////

/* @ngInject */
function SearchBoxController(
    $scope,
    $state,
    $stateParams,
    $timeout,
    $rootScope,
    $q,
    $http,
    $filter,
    $analytics,
    gettext,
    gettextCatalog,
    Config,
    langService,
    TitleService,
    AuthorityService
) {
    /*jshint validthis: true */
    var vm = this;

    vm.institutions = Config.institutions;
    vm.selectedInstitution = null;
    vm.selectedLibrary = null;
    vm.broadSearch = false;
    vm.currentSubject = AuthorityService.currentSubject;
    vm.selectInstitution = selectInstitution;
    vm.selectLibrary = selectLibrary;
    vm.updateControlledSearch = updateControlledSearch;

    // vm.searchUrl = Config.skosmos.searchUrl;
    vm.lang = langService.language;
    vm.defaultLang = langService.defaultLanguage;
    vm.vocab = ($stateParams.vocab && $stateParams.vocab != 'all') ? $stateParams.vocab : null;
    // vm.formatRequest = formatRequest;
    // vm.processResults = processResults;
    vm.selectSubject = selectSubject;
    vm.openSearcMenu = openSearcMenu;
    vm.searchTruncation = searchTruncation;
    vm.truncate = 0;
    vm.query = '';
    vm.truncations = [
        gettext('Starting with'),
        gettext('Containing'),
        gettext('Ends with'),
        gettext('Exact match'),
    ];
    vm.search = search;
    vm.errorMsg = '';

    var vocabulary = Config.vocabularies[vm.vocab] || null;

    this.$onInit = function() {
        console.log('[searchBox] onInit');

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

        if (AuthorityService.currentSubject) {
            vm.currentSubject = AuthorityService.currentSubject;
            let label = AuthorityService.currentSubject.getPrefLabel();
            vm.query = label;
            // In case the autocomplete box already loaded:
            $scope.$broadcast('angucomplete-alt:changeInput', 'searchbox', label);
        } else {
            console.log('Clear current subject');
            TitleService.set(vocabulary.name);
            AuthorityService.clearCurrentSubject();
        }
        AuthorityService.onSubject($scope, function (evt, newSubject) {
            vm.currentSubject = AuthorityService.currentSubject;
            if (!newSubject) {
                $scope.$broadcast('angucomplete-alt:clearInput', 'searchbox');
            } else {
                let label = AuthorityService.currentSubject.getPrefLabel();
                $scope.$broadcast('angucomplete-alt:changeInput', 'searchbox', label);
            }
        });

        angular.element(document).ready(function () {
            var sv = document.getElementById('searchbox_value');
            if (sv && !vm.query.length) {
                sv.focus();
            }
        });
    };

    ////////////

    function selectInstitution(institution) {
        $analytics.eventTrack('SetInstitution', {category: 'RefineSearch', label: institution});
        $state.go($state.current.name, {library: institution});
    }

    function selectLibrary(library) {
        $analytics.eventTrack('SetLibrary', {category: 'RefineSearch', label: library});
        if (library) {
            $state.go($state.current.name, {library: vm.selectedInstitution + ':' + library});
        } else {
            $state.go($state.current.name, {library: vm.selectedInstitution});
        }
    }

    function updateControlledSearch() {
        $state.go($state.current.name, {broad: vm.broadSearch});
    }


    //Temporary solution until angucomplete gets a proper search-on-focus behaviour
    function openSearcMenu() {

        var query = document.getElementById('searchbox_value');

        angular.element(query).triggerHandler('input');
        angular.element(query).triggerHandler('keyup');
    }

    function searchTruncation(truncate) {
        vm.truncate = truncate;
        openSearcMenu();
    }

    function formatRequest(str) {
        var query;

        switch (vm.truncate) {
        case 0: //Starting
            query = str + '*';
            break;
        case 1: //Contains
            query = (str.length == 2) ? str : '*' + str + '*';
            break;
        case 2: //Ends
            query = '*' + str;
            break;
        case 3: //Exact match
            query = str;
            break;
        }

        return {
            type: (vocabulary.concept_types || ['skos:Concept']).join(' '),  // to avoid skos:Collection and complex concepts
            query: query,
            labellang: vm.lang,
            vocab: vm.vocab,
        };
    }

    function matchResult(str, query) {
        if (!str || !query) return false;
        str = str.toLocaleLowerCase();
        query = query.toLocaleLowerCase();
        if (!str) return false;

        if (vm.truncate === 0 && query == str.substr(0, query.length)) return 'Starting with';
        if (vm.truncate === 1 && str.indexOf(query) > -1) return 'Containing';
        if (vm.truncate === 2 && query == str.substr((str.length - query.length), query.length)) return 'Ends with';
        if (vm.truncate === 3 && query == str) return 'Exact Match';

        return false;

    }

    function processResults(response, query) {

        //Remove duplicates and add matchedPreflabel and some notation where there is a match
        var results = uniqBy(response.results, function (x) {
            return x.uri;
        });

        // Ignore results without notation nor prefLabel
        results = results.filter(function (result) {
            return result.notation || result.prefLabel;
        });

        results.forEach(function (result) {
            let label = [];
            if (vocabulary.notationSearch && result.notation) label.push(result.notation);
            if (result.prefLabel) label.push(result.prefLabel);
            result.prefLabel = label.join(' ');
            result.description = ''
            if (!matchResult(result.prefLabel, query)) {
                // If we don't have a match on prefLabel in the current language,
                // we should show matchedPrefLabel or altLabel
                if (result.matchedPrefLabel) {
                    result.description = result.matchedPrefLabel;
                }
                if (result.altLabel) {
                    result.description = result.altLabel;
                }
            }

            // Add icon
            result.searchListIcon = getSearchListIcon(result);
        });

        // Re-sort
        results.sort(function(a, b) {
            let sa = a.description + a.prefLabel,
                sb = b.description + b.prefLabel;
            return sa.localeCompare(sb);
        })

        return results;
    }

    function getSearchListIcon(result) {
        // Add Geographics/Temporal/GenreForm to list
        for (let resultType of result.type) {
            resultType = resultType.split('#').pop();

            var icons = {
                'Geographic': 'glyphicon-map-marker',
                'Temporal': 'glyphicon-time',
                'GenreForm': 'glyphicon-list-alt',
                'LinkingTerm': 'glyphicon-link',
                'SplitNonPreferredTerm': 'glyphicon-link',
                'Collection': 'glyphicon-link',
            };

            if (icons[resultType]) {
                return '<span><i class="glyphicon ' + icons[resultType] + '"></i><em> ' + gettextCatalog.getString(resultType) + '</em></span>';
            }
        }
        return '';
    }

    function search(query) {

        vm.query = query;

        var deferred = $q.defer();

        vm.errorMsg = '';
        $http({
            method: 'GET',
            cache: true,
            url: Config.skosmos.searchUrl,
            params: formatRequest(query),
            ignoreLoadingBar: true  // angular-loading-bar
        }).then(function (data) {
            vm.searchResults = data.data;
            var processed = processResults(vm.searchResults, query);
            deferred.resolve(processed);

        }, function (error) {
            if (error.status == -1) {
                vm.errorMsg = gettext('No network connection');
            } else {
                vm.errorMsg = error.statusText;
            }
            deferred.resolve({results: []});
        });

        return deferred.promise;
    }

    function selectSubject(item) {
        if (item) {
            vm.currentSubject = true;
            $state.go('subject.search', {
                uri: item.originalObject.uri,
                id: null,
                term: null
            });
        }
    }
}
