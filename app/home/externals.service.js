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
			data: null,
			snl:snl,
			wp:wp
		}

		return service;

		function snl(term,lang) {

			console.log('[Externals] SNL lookup');

			//Defaults
			service.data = {
				url: "",
				extract: "",
				type: "no result"
			};
			
			var snl_deferred = $q.defer();

			$http({
			  method: 'GET',
			  cache: true,
			  url: "http://services.biblionaut.net/api/snl.php",
			  params: {query: term}
			}).
			then(function(result){

				service.data=result.data;
				snl_deferred.resolve(service.data);

			},function(error){
				snl_deferred.reject(error);
			});
			
			return snl_deferred.promise;
		}

		function wp(term,lang,type,deferred) {
	
			console.log('[Externals] Wikipedia lookup ('+type+')');		

			//Defaults
			service.data = {
				url: "",
				extract: "",
				type: "no result"
			};

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
							url: processed.canonicalurl,
							extract: extract,
							type: type
						}
						deferred.resolve(service.data);	
					}
					
					else {
			
						wp(term,lang,"search", deferred);

					}

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
							url: "https://"+lang+".wikipedia.org/w/index.php?search="+term,
							extract: "",
							type: type
						}
					}

					deferred.resolve(service.data);	

				},function(error){
					deferred.reject(error);
				});
			}	

			return deferred.promise;
		}
	}
})();