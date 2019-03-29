import angular from 'angular';
import {uniqBy} from 'lodash/array';
import template from './authoritySearch.html';

export const authoritySearchComponentName = 'appAuthoritySearch';

export const authoritySearchComponent = {
    template,
    controller: AuthoritySearchController,
    controllerAs: 'vm',
    bindings: {
        'data': '<',
    },
};

/////

/* @ngInject */
function AuthoritySearchController($scope, $state, $stateParams, $timeout, $rootScope, $q, $http, $filter, gettext, gettextCatalog, Config, langService, AuthorityService) {
    /*jshint validthis: true */
    var vm = this;

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
    vm.truncations = [gettext('Starting with'), gettext('Containing'), gettext('Ends with'), gettext('Exact match')];
    vm.search = search;
    vm.errorMsg = '';
    vm.searchHistory = [];

    activate();

    ////////////

    function activate() {
        vm.searchHistory = AuthorityService.searchHistory;
        AuthorityService.onSubject($scope, function () {
            vm.searchHistory = AuthorityService.searchHistory;
        });
        angular.element(document).ready(function () {
            var sv = document.getElementById('search_value');
            if (sv) {
                sv.focus();
            }
        });
    }

    //Temporary solution until angucomplete gets a proper search-on-focus behaviour
    function openSearcMenu() {

        var query = document.getElementById('search_value');

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
            type: 'skos:Concept', // to avoid skos:Collection
            query: query,
            labellang: vm.lang,
            vocab: vm.vocab,
            type: 'skos:Concept',
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

        // Ignore results without prefLabel
        results = results.filter(function (result) {
            return result.prefLabel;
        });

        results.forEach(function (result) {
            if (matchResult(result.prefLabel, query)) {
                // OK
            } else if (matchResult(result.notation, query)) {
                result.prefLabel = result.notation + ' ' + result.prefLabel;
            } else {
                // If we don't have a match on prefLabel in the current language,
                // we should show matchedPrefLabel or altLabel
                if (result.matchedPrefLabel) {
                    result.description = '(' + result.matchedPrefLabel + ')';
                }
                if (result.altLabel) {
                    result.description = '(' + result.altLabel + ')';
                }
            }

            // Add icon
            result.searchListIcon = getSearchListIcon(result);
        });

        return results;
    }

    function getSearchListIcon(result) {
        // Add Geographics/Temporal/GenreForm to list
        result.type.forEach(function (resultType) {
            resultType = resultType.split('#').pop();

            var icons = {
                'Place': 'glyphicon-map-marker',
                'Time': 'glyphicon-time',
                'GenreForm': 'glyphicon-list-alt',
            };

            if (icons[resultType]) {
                return '<span><i class="glyphicon ' + icons[resultType] + '"></i><em> ' + gettextCatalog.getString(resultType) + '</em></span>';
            }
        });
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
            $state.go('subject.search', {
                uri: item.originalObject.uri,
                id: null,
                term: null
            });
        }
    }
}
