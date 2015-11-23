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

		function search(vocab, term, start) {
			var deferred = $q.defer();

			if (!start) {
				start = 1;
			}

			$http({
			  method: 'GET',
			  cache: true,
			  url: Config.catalogue.searchUrl,
			  params: {
			  	vocab: vocab,
			  	subject: term,
			  	start: start
			  }
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