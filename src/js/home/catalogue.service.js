(function() {
    'use strict';

	angular
		.module('app.services.catalogue', ['app.services.config'])
		.factory('Catalogue', ['$http', '$q', 'Config', CatalogueService]);

	function CatalogueService($http, $q, Config) {
		console.log('[CatalogueService] Init');

		var service = {
			search: search,
			expandGroup: expandGroup
		};

		return service;

		////////////

		function search(query, start, institution, library) {
			var deferred = $q.defer();

			var params = {
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
			then(function(data){
				deferred.resolve(data.data);
			}, function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		}

		function expandGroup(id) {
			var deferred = $q.defer();

			$http({
			  method: 'GET',
			  cache: true,
			  url: Config.catalogue.groupUrl.replace('{id}', id)
			}).
			then(function(data){
				deferred.resolve(data.data);
			}, function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		}

	}

})();