(function() {
    'use strict';

	angular
		.module('app.services.catalogue', ['app.services.config'])
		.factory('Catalogue', ['$http', '$q', 'Config', CatalogueService]);

	function CatalogueService($http, $q, Config) {
		console.log('[CatalogueService] Init');

		var service = {
			search: search
		};

		return service;

		////////////

		function search(vocab, term) {
			var deferred = $q.defer();

			console.log('[CatalogueService] @TODO: Search for "' + term + '" in "' + vocab + '"');

			// $http({
			//   method: 'GET',
			//   cache: true,
			//   url: Config.skosmos.dataUrl.replace('{uri}', uri)
			// }).
			// then(function(data){
			// 	deferred.resolve(processSubject(uri, data.data));
			// }, function(error){
			// 	deferred.reject(error);
			// });

			return deferred.promise;
		}

	}

})();