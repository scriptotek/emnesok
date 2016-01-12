(function() {
	'use strict';

	angular
		.module('app.services.externals', ['app.services.config', 'ui.router'])
		.factory('Externals', ['$http', '$q', '$filter', ExternalsFactory]);

	function ExternalsFactory($http, $q, $filter) {

		function htmlToPlaintext(text) {
			return text ? String(text).replace(/<[^>]+>/gm, '') : '';
		}

		console.log('[Externals] Init');

		var service = {
			snl:snl,
			wp:wp,
			ps:ps
		};

		return service;

		function snl(term,lang) {

			console.log('[Externals] SNL lookup');

			var deferred = $q.defer();

			$http({
			  method: 'GET',
			  cache: true,
			  url: "https://services.biblionaut.net/api/snl.php",
			  params: {query: term}
			}).
			then(function(result){

				console.log('snl',result.data);

				result.data.name = "Store norske leksikon";
				if (result.data.type == "no result") {
					return deferred.resolve(null);
				}
				return deferred.resolve(result.data);

			},function(error){
				deferred.reject(error);
			});
			
			return deferred.promise;
		}

		function ps(term) {

			console.log('[Externals] PS lookup');

			var deferred = $q.defer();

			$http({
			  method: 'GET',
			  cache: true,
			  url: "https://services.biblionaut.net/api/ps.php",
			  params: {ele: term}
			}).
			then(function(result){

				result.data = result.data;
				result.data.name = "Periodesystemet";
				deferred.resolve(result.data);

				console.log('ps',result.data);

			},function(error){
				deferred.reject(error);
			});
			
			return deferred.promise;
		}


		function wp(term,lang,type,deferred) {
	
			if (type===undefined) type="exact";
			if (!type) type="exact";
	
			console.log('[Externals] Wikipedia lookup ('+type+')');		

			if (!deferred) {
				deferred = $q.defer();
			}

			if (type=="exact"){

				$http({
					method: 'jsonp',
					cache: true,
					url: "https://"+lang+".wikipedia.org/w/api.php",
					params: {
						action: "query",
						prop: "extracts|info",
						exintro:"",
						inprop: "url",
						redirects:"",
						titles:term,
						format: "json",
						callback: "JSON_CALLBACK"
					}
				}).
				then(function(result){

					var processed;

					for (var pageid in result.data.query.pages) {
			
						processed=result.data.query.pages[pageid];
						break;
					}

					if (processed.missing===undefined) {		

						var extract="";
						if (processed.extract) {
					
							var onlyFirstParagraph =  processed.extract.match(/<p>(.*?)<\/p>/g);
							extract = htmlToPlaintext(onlyFirstParagraph[0]);
						}
						
						result.data = {
							name: "Wikipedia",
							url: processed.canonicalurl,
							extract: extract,
							type: type
						};
						deferred.resolve(result.data);	
					}
					
					else {
						wp(term,lang,"search", deferred);
					}
						
					console.log('wiki exact',result.data);

				},function(error){
					deferred.reject(error);
				});
			}

			if (type=="search") {

				$http({
					method: 'jsonp',
					cache: true,
					url: "https://"+lang+".wikipedia.org/w/api.php",
					params :{
						action: "query",
						list: "search",
						srsearch:term,
						srinfo:"totalhits",
						redirects:"",
						format: "json",
						callback: "JSON_CALLBACK"
					}
				}).
				then(function(result){

					var data = null;
				
					if (result.data.query.searchinfo.totalhits) {
							
						data = {
							name: "Wikipedia",
							url: "https://"+lang+".wikipedia.org/w/index.php?search="+term,
							extract: "",
							type: type
						};
					}

					deferred.resolve(data);	

					console.log('wiki search',data);

				},function(error){
					deferred.reject(error);
				});
			}	

			return deferred.promise;
		}
	}
})();