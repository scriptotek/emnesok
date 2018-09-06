(function() {
    'use strict';

    angular
        .module('app.services.authority', [
            'app.services.config',
        ])
        .factory('AuthorityService', AuthorityService);

    /* @ngInject */
    function AuthorityService($http, $stateParams, $filter, $q, $rootScope, gettext, Config, langService) {

        var service = {
            search: search,
            getById: getById,
            getByUri: getByUri,
            getByTerm: getByTerm,
            getVocabulary: getVocabulary,
            exists: exists,
            onSubject: onSubject,
            searchHistory: [],
            clearSearchHistory: clearSearchHistory
        };

        activate();

        return service;

        ////////////

        function preferredRdfType(types) {
            if (types.indexOf('http://data.ub.uio.no/onto#Place') !== -1) {
                gettext('Geographic');
                return 'Geographic';
            }
            if (types.indexOf('http://data.ub.uio.no/onto#Time') !== -1) {
                gettext('Temporal');
                return 'Temporal';
            }
            if (types.indexOf('http://data.ub.uio.no/onto#GenreForm') !== -1) {
                gettext('GenreForm');
                return 'GenreForm';
            }
            if (types.indexOf('http://data.ub.uio.no/onto#KnuteTerm') !== -1) {
                gettext('KnuteTerm');
                return 'KnuteTerm';
            }

            gettext('Topic');
            return 'Topic';
        }

        function getShortVocabularyCode(uri) {
            var shortCodes = Object.keys(Config.vocabularies);
            for (var i = 0; i < shortCodes.length; i++) {
                if (Config.vocabularies[shortCodes[i]].scheme == uri) {
                    return shortCodes[i];
                }
            }
        }

        function Subject(data) {

            data.type = preferredRdfType(data.type);

            ['_components', 'broader', 'narrower', 'related'].forEach(function (prop) {
                data[prop].map(function (res) {
                    res.type = preferredRdfType(res.type);
                });
            });

            this.vocab = getShortVocabularyCode(_.get(data, 'inScheme.0.uri'));

            this.data = data;
        }

        function activate() {
        }

        function clearSearchHistory() {
            service.searchHistory = [];
        }

        function onSubject(scope, callback) {
            var handler = $rootScope.$on('subject-service-new-subject-event', callback);
            scope.$on('$destroy', handler);
        }

        function notify(subject) {
            var idx = service.searchHistory.reduce(function(prev, curr, idx) {
                return (curr.data.uri == subject.data.uri) ? idx : prev;
            }, -1);

            if (idx !== -1) {
                service.searchHistory.splice(idx, 1);
            }
            service.searchHistory.push(subject);
            $rootScope.$emit('subject-service-new-subject-event', subject);
        }

        // Make value an array if not already
        function arrayify(arrayornot) {
            var arr = [];
            if (arrayornot === undefined) {
                // pass
            } else if (typeof arrayornot === 'object' && arrayornot[0] !== undefined) {
                arr = arrayornot;
            } else {
                arr.push(arrayornot);
            }
            if (arr.length == 1 && arr[0]['@list'] !== undefined) {
                arr = arr[0]['@list'];
            }
            return arr;
        }

        // convert array on the form [{lang: 'nn', value: '...'}] to {nb: '...'}
        function indexByLanguage(arr, multipleValues) {
            var out = {};
            arr.forEach(function(k) {
                if (multipleValues) {
                    out[k.lang] = out[k.lang] ? out[k.lang].concat([k.value]) : [k.value];
                } else {
                    out[k.lang] = k.value;
                }
            });
            return out;
        }


        // Returns a normalized representation of a JSON LD resource for easier processing
        // function processResource(resources, uri) {

        //  return {
        //      prefLabel: indexByLanguage(arrayify(resources[uri].prefLabel), false),
        //      altLabel: indexByLanguage(arrayify(resources[uri].altLabel), true),
        //      notation: _.get(resources[uri], 'skos:notation'),
        //      // TODO: MSC
        //      related: arrayify(resources[uri].related),
        //      broader: arrayify(resources[uri].broader),
        //      narrower: arrayify(resources[uri].narrower),
        //      definition: indexByLanguage(arrayify(resources[uri]['skos:definition'] || resources[uri].definition)),
        //      type: preferredRdfType(arrayify(resources[uri].type)),
        //      deprecated: _.get(resources[uri], 'owl:deprecated', false),
        //      replacedBy: arrayify(resources[uri]['dct:isReplacedBy']),
        //      elementSymbol: resources[uri]['http://data.ub.uio.no/onto#elementSymbol'],
        //      components: arrayify(resources[uri]['http://data.ub.uio.no/onto#component']),
        //  };
        // }

        function processSubject(uri, data) {


            // data.replacedBy = [];
            // data.elementSymbol = null;
            // data.components = [];
            // data.definition = {};

            // Make a uri => data lookup object
            // var rawResources = {};
            // data.graph.forEach(function(graph) {
            //  rawResources[graph.uri] = graph;
            // });

            // var processedResources = {};
            // data.graph.forEach(function(graph) {
            //  processedResources[graph.uri] = processResource(rawResources, graph.uri);
            // });

            // function expandResource(res) {
            //  var x = processedResources[res.uri];
            //  x.uri = res.uri;
            //  x.id = x.uri.substr(x.uri.lastIndexOf('/') + 1);
            //  return x;
            // }

            // var out = processedResources[uri];
            // out.related = _.get(out, 'related', []).map(expandResource);
            // out.broader = _.get(out, 'broader', []).map(expandResource);
            // out.narrower = _.get(out, 'narrower', []).map(expandResource);
            // out.components = _.get(out, 'components', []).map(expandResource);
            // out.replacedBy = _.get(out, 'replacedBy', []).map(expandResource);

            return data;
        }

        function search(q, vocab) {
            if (!Config.vocabularies[vocab]) {
                console.error('Unknown vocabulary ' + vocab + '!');
                return;
            }
            var deferred = $q.defer();

            var query = {
                vocab: vocab,
                query: q.replace('--', ' : '),
                labellang: langService.language
            };

            $http({
                method: 'GET',
                cache: true,
                url: Config.skosmos.searchUrl,
                params: query
            }).
            then(function(response){
                deferred.resolve(response.data);
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function getByUri(uri) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                cache: true,
                url: Config.skosmos.jskosUrl.replace('{uri}', uri),
            }).
            then(function(response){
                var subject = new Subject(response.data);
                // {
                //     uri: uri,
                //     id: uri.split('/').pop(),
                //     data: processSubject(uri, response.data),
                // };
                notify(subject);

                deferred.resolve(subject);
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function getById(id, vocab) {
            var uri = Config.vocabularies[vocab].uriPattern.replace('{id}', id);
            return getByUri(uri);
        }

        function getByTerm(term, vocab) {
            var deferred = $q.defer();

            search(term, vocab).
            then(function(response) {
                if (!response.results.length) {
                    return deferred.reject();
                }
                getByUri(response.results[0].uri).
                then(function(subject) {
                    deferred.resolve(subject);
                });
            }, function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function exists(term, vocab) {
            var deferred = $q.defer();
            search(term, vocab).then(function(response) {
                if (!response.results.length) {
                    return deferred.resolve(null);
                }
                deferred.resolve(response.results[0]);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        function getVocabulary(vocab) {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                cache: true,
                url: Config.skosmos.vocabularyStatisticsUrl.replace('{vocab}', vocab)
            }).
            then(function(response){
                deferred.resolve(response.data);
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        }
    }

})();
