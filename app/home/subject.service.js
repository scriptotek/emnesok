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

		/* Checks for periodic elements and sets acronym to be chemical element
		//////////////////////////////////

		function isPeriodicalElement(subject,akronym) {
			if (akronym===undefined) return false;
			if (akronym[0]!==undefined && typeof akronym === "object") return false;

			for (var i=0; i<grunnstoff.length; i++){

				if (subject.toLocaleLowerCase()==grunnstoff[i].name && akronym.toLocaleLowerCase()==grunnstoff[i].symbol) {
					return true;
				}
			}
			return false;
		}

		//Chemical element test///////////// MUST BE FIXED

		if (data.graph[1].altLabel!==undefined) {

			if (that.subject=="Kopper") that.subject = "Kobber";

			if (data.graph[1].altLabel[0]!==undefined && typeof data.graph[1].altLabel === "object" ) {
				console.log('array!',data.graph[1].altLabel);
				var akronym = data.graph[1].altLabel[0];
			}

			else {
				console.log('variable!',data.graph[1].altLabel);
				var akronym = data.graph[1].altLabel;
			}

			console.log("akronym",akronym);

			if (isPeriodicalElement(that.subject,akronym)) {

				that.chem = akronym;
			}
		}
		//////////////////////////////////
		*/

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
			//gettext('Topic');
			//return 'Topic';
		}
		
		// Returns a normalized representation of a JSON LD resource for easier processing
		function processResource(resources, uri) {

			console.log("_______>",resources, uri);
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