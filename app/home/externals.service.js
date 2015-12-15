(function() {
	'use strict';

	angular
		.module('app.services.externals', ['app.services.config', 'ui.router', 'gettext'])
		.factory('Externals', ['$http', '$q', '$filter', 'gettext', ExternalsFactory]);

	function ExternalsFactory($http, $q, $filter, gettext) {

		function htmlToPlaintext(text) {
			return text ? String(text).replace(/<[^>]+>/gm, '') : '';
		}

		console.log('[Externals] Init');

		var service = {
			data: {
				name: "",
				url: "",
				extract: "",
				type: "no result"
			},
			snl:snl,
			wp:wp,
			ps:ps
		}

		return service;

		function snl(term,lang) {

			console.log('[Externals] SNL lookup');

			var deferred = $q.defer();

			$http({
			  method: 'GET',
			  cache: true,
			  url: "http://services.biblionaut.net/api/snl.php",
			  params: {query: term}
			}).
			then(function(result){

				service.data = result.data;
				service.data.name = gettext("Store norske leksikon");
				deferred.resolve(service.data);

				console.log('snl',service.data);

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
			  url: "http://services.biblionaut.net/api/ps.php",
			  params: {ele: term}
			}).
			then(function(result){

				service.data = result.data;
				service.data.name = gettext("Periodesystemet");
				deferred.resolve(service.data);

				console.log('ps',service.data);

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
					url: "http://"+lang+".wikipedia.org/w/api.php",
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

					for (var pageid in result.data.query.pages) {
			
						var processed=result.data.query.pages[pageid];
						break;
					}

					if (processed.missing===undefined) {		

						var extract="";
						if (processed.extract) {
					
							var onlyFirstParagraph =  processed.extract.match(/<p>(.*?)<\/p>/g);
							extract = htmlToPlaintext(onlyFirstParagraph[0]);
						}
						
						service.data = {
							name: gettext("Wikipedia"),
							url: processed.canonicalurl,
							extract: extract,
							type: type
						};
						deferred.resolve(service.data);	
					}
					
					else {
						wp(term,lang,"search", deferred);
					}
						
					console.log('wiki exact',service.data);

				},function(error){
					deferred.reject(error);
				});
			}

			if (type=="search") {

				$http({
					method: 'jsonp',
					cache: true,
					url: "http://"+lang+".wikipedia.org/w/api.php",
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
				
					if (result.data.query.searchinfo.totalhits) {
							
						service.data = {
							name: gettext("Wikipedia"),
							url: "https://"+lang+".wikipedia.org/w/index.php?search="+term,
							extract: "",
							type: type
						};
					}

					deferred.resolve(service.data);	

					console.log('wiki search',service.data);

				},function(error){
					deferred.reject(error);
				});
			}	

			return deferred.promise;
		}
	}
})();