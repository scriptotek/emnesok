(function() {
	'use strict';

	angular
		.module('app.services.subject', ['app.services.config'])
		.factory('SubjectService', ['$http', '$stateParams', '$filter', '$q', '$rootScope', 'gettext', 'Config', 'Lang', 'Restangular','JsonldRest', SubjectService]);

	function SubjectService($http, $stateParams, $filter, $q, $rootScope, gettext, Config, Lang, Restangular, JsonldRest) {
		console.log('[SubjectService] Init');

		var service = {
			search: search,
			getById: getById,
			getByUri: getByUri,
			getByTerm: getByTerm,
			onSubject: onSubject,
			searchHistory: []
		};

		activate();

		return service;

		////////////

		function activate() {
			
			//This doesn't work...
			//JsonldRest.setBaseUrl('http://data.ub.uio.no');
			
			//But this does
			//Restangular.setBaseUrl('http://data.ub.uio.no');
			
			/*
			//A handler to a server collection of persons with a local context interpretation
			var people = JsonldRest.collection('realfagstermer').withContext({
				"skos": "http://www.w3.org/2004/02/skos/core#",
				"ubo": "http://data.ub.uio.no/onto#",
				"grunnstoff": "ubo:elementSymbol"
			});
			
			//We retrieve the person http://example.org/person/1
			people.one('c012171').get().then(function(res){
				console.log("Hello ", res.grunnstoff);
			});
			*/
	

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
		function arrayify(arrayornot) {
			var arr = [];
			if (arrayornot === undefined) {
				// pass
			} else if (typeof arrayornot === 'object' && arrayornot[0] !== undefined) {
				arr = arrayornot;
			} else {
				arr.push(arrayornot);
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

		function preferredRdfType(arr) {
			if (arr.indexOf('http://www.loc.gov/mads/rdf/v1#Geographic') !== -1) {
				gettext('Geographic');
				return 'Geographic';
			}
			if (arr.indexOf('http://www.loc.gov/mads/rdf/v1#Temporal') !== -1) {
				gettext('Temporal');
				return 'Temporal';
			}
			if (arr.indexOf('http://www.loc.gov/mads/rdf/v1#GenreForm') !== -1) {
				gettext('GenreForm');
				return 'GenreForm';
			}

			gettext('Topic');
			return 'Topic';
		}

		// Returns a normalized representation of a JSON LD resource for easier processing
		function processResource(resources, uri) {
			return {
				prefLabel: indexByLanguage(arrayify(resources[uri].prefLabel), false),
				altLabel: indexByLanguage(arrayify(resources[uri].altLabel), true),
				related: arrayify(resources[uri].related),
				definition: indexByLanguage(arrayify(resources[uri]['skos:definition'] || resources[uri].definition)),
				type: preferredRdfType(arrayify(resources[uri].type)),
				elementSymbol:resources[uri]["http://data.ub.uio.no/onto#elementSymbol"]
			};
		}

		function processSubject(uri, data) {

			// Make a uri => data lookup object
			var rawResources = {};
			data.graph.forEach(function(graph) {
				rawResources[graph.uri] = graph;
			});

			var processedResources = {};
			data.graph.forEach(function(graph) {
				processedResources[graph.uri] = processResource(rawResources, graph.uri);
			});

			var out = processedResources[uri];
			out.related = out.related.map(function(res) {
				var x = processedResources[res.uri];
				x.uri = res.uri;
				x.id = x.uri.substr(x.uri.lastIndexOf('/') + 1);
				return x;
			});

			return out;
		}

		function search(q, vocab) {
			if (!Config.vocabularies[vocab]) {
				console.error('Unknown vocabulary ' + vocab + '!');
				return;
			}
			var deferred = $q.defer();

			var query = {
				vocab: vocab,
				query: q,
				labellang: Lang.language
			};

			$http({
			  method: 'GET',
			  cache: false,
			  url: Config.skosmos.searchUrl,
			  params: query
			}).
			then(function(data){
				deferred.resolve(data.data);
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
			  url: Config.skosmos.dataUrl.replace('{uri}', uri)
			}).
			then(function(data){
				if (!data.data.graph) {
					return deferred.resolve(null);
				}
				var subject = {
					uri: uri,
					data: processSubject(uri, data.data)
				};
				notify(subject);
	
				deferred.resolve(subject);
			}, function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		}

		function getById(id, vocab) {
			if (!Config.vocabularies[vocab]) {
				console.error('Unknown vocabulary ' + vocab + '!');
				return;
			}
			var deferred = $q.defer();

			var uri = Config.vocabularies[vocab].uriPattern.replace('{id}', id);

			getByUri(uri).then(function(subject) {
				if (subject) {
					subject.id = id;
					subject.vocab = vocab;
				}
				deferred.resolve(subject);
			}, function(error) {
				deferred.reject(error);
			});

			return deferred.promise;
		}

		function getByTerm(term, vocab) {
			var deferred = $q.defer();
			search(term, vocab).then(function(response) {
				if (!response.results.length) {
					return deferred.reject();
				}
				var uri = response.results[0].uri;
				getByUri(uri).then(function(subject) {
					subject.vocab = vocab;
					deferred.resolve(subject);
				}, function(error) {
					deferred.reject(error);
				});
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		}
	}

})();