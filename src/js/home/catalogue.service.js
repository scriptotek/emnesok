(function() {
    'use strict';

    angular
        .module('app.services.catalogue', ['app.services.config'])
        .factory('Catalogue', ['$http', '$q', 'gettext', 'gettextCatalog', 'Institutions', 'Config', CatalogueService]);

    function CatalogueService($http, $q, gettext, gettextCatalog, Institutions, Config) {
        console.log('[CatalogueService] Init');

        var service = {
            search: search,
            expandGroup: expandGroup
        };

        return service;

        ////////////

        function search(query, start, institution, library, broadSearch) {
            var deferred = $q.defer();

            var params = {
                expand_groups: true,  // in order to filter we need this, since it's random which edition we get data for in frbr groups
                repr: 'full',
                sort: 'date',
                vocabulary: query.vocab,
                subject: query.subject,
                genre: query.genre,
                place: query.place
            };

            if (start) {
                params.start = start;
            }
            if (institution) {
                params.institution = institution;
                params.scope = institution;
            }
            if (library) {
                params.library = library;
            }

            $http({
              method: 'GET',
              cache: true,
              url: Config.catalogue.searchUrl,
              params: params
            }).
            then(function(response){
                response.data.results = postProcessRecords(response.data.results, institution, params, broadSearch);
                deferred.resolve(response.data);
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function expandGroup(id, institution) {
            var deferred = $q.defer();
            var params = {};

            if (institution) {
                params.institution = institution;
                params.scope = institution;
            }

            $http({
              method: 'GET',
              cache: true,
              url: Config.catalogue.groupUrl.replace('{id}', id),
              params: params,
            }).
            then(function(response){
                response.data.result.records = postProcessRecords(response.data.result.records, institution);
                deferred.resolve(response.data);
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        function postProcessRecords(records, selectedInstitution, queryParams, broadSearch) {
            records.forEach(function(record) {
                simplifyAvailability(record, selectedInstitution);
                record.pubEdYear = formatPubEdYearString(record);
                Object.keys(record.subjects).forEach(function(k) {
                    record.subjects[k] = record.subjects[k].filter(onlyUnique);
                });
            });

            function matchingRecord(rec) {
                if (broadSearch) {
                    return true;
                }
                if (queryParams && queryParams.vocabulary && queryParams.subject) {
                    var s = queryParams.subject.split(' OR ').shift();
                    if (rec.subjects[queryParams.vocabulary].indexOf(s) == -1) { return false; }
                }
                if (queryParams && queryParams.place) {
                    var s = queryParams.place.split(' OR ').shift();
                    if (rec.subjects.place.indexOf(s) == -1) { return false; }
                }
                if (queryParams && queryParams.genre) {
                    var s = queryParams.genre.split(' OR ').shift();
                    if (rec.subjects.genre.indexOf(s) == -1) { return false; }
                }
                return true;
            }

            // Since Oria doesn't support exact search, we must post-filter
            var nbefore = records.length;
            records = records.filter(function(rec) {
                if (rec.type == 'group') {
                    var matching = rec.records.map(matchingRecord);
                    if (matching.indexOf(true) != -1) { return true; }
                } else if (matchingRecord(rec)) {
                    return true;
                }
                return false;
            });

            return records;
        }

        function formatPubEdYearString(record) {
            var tmp = '';
            var ed = (record.edition && record.type == 'record') ? record.edition : '';
            if (record.publisher) {
                tmp += record.publisher;
                if (ed) {
                    tmp += ', ';
                }
            }
            tmp += ed;
            if (record.date) {
                if (tmp.length) {
                    tmp += ' ';
                }
                tmp += record.date;
            }
            return tmp;
        }

        function simplifyAvailability(record, selectedInstitution) {
            var availability = '';
            // @TODO: Show libraries if selectedInstitution

            record.availability = {};

            if (record.type == 'group') {
                return;
            }

            var myInstitution = selectedInstitution || 'UBO';  // @TODO: Default based on IP address

            // Print availability
            var printInstitutions = [];
            var electronic = [];
            record.components.forEach(function(component) {
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
                record.availability.print = printInstitutionsStr;
            }

            // Electronic availability
            if (record.urls.length > 0) {
                gettext('E-book');
                record.availability.electronic = {
                    url: record.urls[0].url,
                    description: gettextCatalog.getString(record.urls[0].description)
                };
            }
        }

    }

})();
