angular.module('app.services.subject', ['app.services.config']).
factory('SubjectService', function SubjectService($http, $stateParams, $filter, $q, Config) {
	console.log('[SubjectService] Init');

	var service = {
		search: search,
		get: get,
	};

	return service;

	////////////

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

	// Returns a normalized representation of a JSON LD resource for easier processing
	function processResource(resources, uri) {
		return {
			prefLabel: indexByLanguage(arrayify(resources[uri].prefLabel), false),
			altLabel: indexByLanguage(arrayify(resources[uri].altLabel), true),
			related: arrayify(resources[uri].related),
			definition: indexByLanguage(arrayify(resources[uri]['skos:definition']))
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

		console.log(processedResources);

		var out = processedResources[uri];
		out.related = out.related.map(function(res) {
			return processedResources[res.uri];
		});
		return out;
	}

	function get(uri) {
		var deferred = $q.defer();

		$http({
		  method: 'GET',
		  cache: true,
		  url: Config.skosmos.dataUrl.replace('{uri}', uri)
		}).
		then(function(data){
			deferred.resolve(processSubject(uri, data.data));
		}, function(error){
			deferred.reject(error);
		});

		return deferred.promise;
	}

	function search(q) {
		// @TODO
	}

});
