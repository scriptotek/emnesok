(function() {
	'use strict';

	angular
		.module('app.services.subject', ['app.services.config'])
		.factory('SubjectService', ['$http', '$stateParams', '$filter', '$q', '$rootScope', 'gettext', 'Config', SubjectService]);

	function SubjectService($http, $stateParams, $filter, $q, $rootScope, gettext, Config) {
		console.log('[SubjectService] Init');

		var service = {
			search: search,
			get: get,
			onSubject: onSubject,
			searchHistory: []
		};

		activate();

		return service;

		////////////

		function activate() {
			// $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

			// });
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
				type: preferredRdfType(arrayify(resources[uri].type))
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

		function get(vocab, id) {
			if (!Config.vocabularies[vocab]) {
				console.error('Unknown vocabulary ' + vocab + '!');
				return;
			}
			var deferred = $q.defer();

			var uri = Config.vocabularies[vocab].uriPattern.replace('{id}', id);

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
					vocab: vocab,
					id: id,
					data: processSubject(uri, data.data)
				};
				notify(subject);
				deferred.resolve(subject);
			}, function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		}

		function search(q) {
			// @TODO
		}
	}

})();