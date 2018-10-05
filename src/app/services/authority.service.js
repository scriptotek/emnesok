import angular from 'angular';
import configModule from './config.service';
import {get} from 'lodash/object';
import * as log from 'loglevel';

const moduleName = 'app.services.authority';

angular
    .module(moduleName, [
        configModule,
    ])
    .factory('AuthorityService', AuthorityService);

export default moduleName;

/////

function preferredRdfType(types) {
    if (types.indexOf('http://data.ub.uio.no/onto#Place') !== -1) {
        return 'Geographic';
    }
    if (types.indexOf('http://data.ub.uio.no/onto#Time') !== -1) {
        return 'Temporal';
    }
    if (types.indexOf('http://data.ub.uio.no/onto#GenreForm') !== -1) {
        return 'GenreForm';
    }
    if (types.indexOf('http://data.ub.uio.no/onto#KnuteTerm') !== -1) {
        return 'KnuteTerm';
    }

    return 'Topic'; //     gettext('Topic');
}

class Subject {

    constructor(Config, langService, data) {
        this.Config = Config;
        this.langService = langService;

        Object.keys(data).forEach((key) => {
            this[key] = data[key];
        });

        this.type = preferredRdfType(data.type);

        ['_components', 'broader', 'narrower', 'related'].forEach((prop) => {
            if (data[prop] !== undefined) {
                this[prop] = (get(data, prop) || []).map((res) => new Subject(Config, langService, res));
            }
        });

        this.notation = get(data, 'notation.0');

        let vocabularyMap = [
            { pattern: 'http://data.ub.uio.no/humord/', name: 'humord', label: 'Humord'},
            { pattern: 'http://data.ub.uio.no/realfagstermer/', name: 'realfagstermer', label: 'Realfagstermer'},
            { pattern: 'http://data.ub.uio.no/tekord/', name: 'tekord', label: 'Tekord'},
            { pattern: 'http://dewey.info/', name: 'ddc', label: 'DDC23/NO'},
        ];

        this['mappings'] = (get(data, 'mappings') || []).map((m) => {
            console.log('MAPP', m);
            let ret = {
                from: get(m, 'from.memberSet.0', {}),
                to: get(m, 'to.memberSet.0', {}),
                type: get(m, 'type.0'),
            };
            ret.typeLabel = {
                'skos:exactMatch': 'Tilsvarer',
                'skos:closeMatch': 'Tilsvarer omtrent',
                'skos:broadMatch': 'Overordnet',
                'skos:relatedMatch': 'Se også',
            }[ret.type];
            vocabularyMap.forEach((x) => {
                if (ret.to.uri.match(x.pattern)) {
                    ret.to.vocabulary = x.name;
                    ret.to.vocabularyLabel = x.label;
                }
            });
            ret.to.getPrefLabel = () => {
                let labels = get(ret.to, 'prefLabel', {});
                return labels[langService.language]
                    || labels[langService.defaultLanguage]
                    || labels['en']
                    || Object.values(labels)[0];
            };

            ret.to.scheme = get(m, 'toScheme', {});
            return ret;
        });

        // Sort mappings by type
        let typeOrder = ['skos:exactMatch', 'skos:closeMatch', 'skos:broadMatch', 'skos:relatedMatch'];
        this['mappings'].sort(x => typeOrder.indexOf(x.type));

        // Extract Wikidata mapping
        let wikidata = this.mappings.filter(mapping => mapping.to.uri.match('http://www.wikidata.org'));
        this.wikidata = wikidata.length && wikidata[0] || null;
        this['mappings'] = this['mappings'].filter(x => x.to.vocabulary !== undefined);

        function getShortVocabularyCode(uri) {
            var shortCodes = Object.keys(Config.vocabularies);
            for (var i = 0; i < shortCodes.length; i++) {
                if (Config.vocabularies[shortCodes[i]].scheme == uri) {
                    return shortCodes[i];
                }
            }
        }

        this.vocab = getShortVocabularyCode(get(data, 'inScheme.0.uri'));

        // this.data = data;
    }

    get(key, def = null) {
        return get(this, key) || def;
    }

    getPrefLabel() {
        return get(this.prefLabel, this.langService.language);
        // fallback?
    }

    feedbackUri() {
        if (this.vocab == 'realfagstermer') {
            var uri_id = this.uri.split('/').pop();
            var ident = uri_id.replace('c', 'REAL');
            var emnesokUrl = 'https://app.uio.no/ub/emnesok/realfagstermer/search?id=' + encodeURIComponent(uri_id);
            var katapiUrl  = 'http://ub-viz01.uio.no/okapi2/#/search?q=' + encodeURIComponent('realfagstermer:"' + this.getPrefLabel() + '"');
            var soksedUrl = 'http://ub-soksed.uio.no/concepts/' + ident ;
            var issueTitle = this.getPrefLabel();
            var issueBody = encodeURIComponent('\n\n\n\n---\n*' + ident + ' (' + this.getPrefLabel() + ') i [Emnesøk](' + emnesokUrl + '), [Skosmos]('+ this.uri + '), [Okapi](' + katapiUrl + '), [Soksed](' + soksedUrl + ')*');
            return 'https://github.com/realfagstermer/realfagstermer/issues/new?title=' + issueTitle + '&body=' + issueBody;
        }
    }
}


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

    function activate() {
        gettext('Temporal');
        gettext('Geographic');
        gettext('GenreForm');
        gettext('KnuteTerm');
        gettext('Topic');
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
            return (curr.uri == subject.uri) ? idx : prev;
        }, -1);

        if (idx !== -1) {
            service.searchHistory.splice(idx, 1);
        }
        service.searchHistory.push(subject);
        $rootScope.$emit('subject-service-new-subject-event', subject);
    }

    // Make value an array if not already
    // function arrayify(arrayornot) {
    //     var arr = [];
    //     if (arrayornot === undefined) {
    //         // pass
    //     } else if (typeof arrayornot === 'object' && arrayornot[0] !== undefined) {
    //         arr = arrayornot;
    //     } else {
    //         arr.push(arrayornot);
    //     }
    //     if (arr.length == 1 && arr[0]['@list'] !== undefined) {
    //         arr = arr[0]['@list'];
    //     }
    //     return arr;
    //}

    // convert array on the form [{lang: 'nn', value: '...'}] to {nb: '...'}
    // function indexByLanguage(arr, multipleValues) {
    //     var out = {};
    //     arr.forEach(function(k) {
    //         if (multipleValues) {
    //             out[k.lang] = out[k.lang] ? out[k.lang].concat([k.value]) : [k.value];
    //         } else {
    //             out[k.lang] = k.value;
    //         }
    //     });
    //     return out;
    // }


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

    // function processSubject(uri, data) {
    //
    //
    //     // data.replacedBy = [];
    //     // data.elementSymbol = null;
    //     // data.components = [];
    //     // data.definition = {};
    //
    //     // Make a uri => data lookup object
    //     // var rawResources = {};
    //     // data.graph.forEach(function(graph) {
    //     //  rawResources[graph.uri] = graph;
    //     // });
    //
    //     // var processedResources = {};
    //     // data.graph.forEach(function(graph) {
    //     //  processedResources[graph.uri] = processResource(rawResources, graph.uri);
    //     // });
    //
    //     // function expandResource(res) {
    //     //  var x = processedResources[res.uri];
    //     //  x.uri = res.uri;
    //     //  x.id = x.uri.substr(x.uri.lastIndexOf('/') + 1);
    //     //  return x;
    //     // }
    //
    //     // var out = processedResources[uri];
    //     // out.related = _.get(out, 'related', []).map(expandResource);
    //     // out.broader = _.get(out, 'broader', []).map(expandResource);
    //     // out.narrower = _.get(out, 'narrower', []).map(expandResource);
    //     // out.components = _.get(out, 'components', []).map(expandResource);
    //     // out.replacedBy = _.get(out, 'replacedBy', []).map(expandResource);
    //
    //     return data;
    // }

    function search(q, vocab) {
        if (!Config.vocabularies[vocab]) {
            log.error('Unknown vocabulary ' + vocab + '!');
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
                var subject = new Subject(Config, langService, response.data);
                console.log(subject);
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
