(function() {
	'use strict';

	angular
		.module('app.modules.search', ['app.services.config', 'app.services.subject'])
		.directive('modSearch', SearchModule);

	function SearchModule() {

		var directive = {
	        restrict: 'A',
	        templateUrl: 'app/search.html',
	        replace: false,
	        scope: {},
	        controllerAs: 'vm',
	        controller: ['$scope', '$state', '$stateParams', '$timeout', '$rootScope', '$q', '$http', '$filter', 'gettext', 'gettextCatalog', 'Config', 'Lang', 'SubjectService', controller]
	    };

		return directive;
	}

	function controller($scope, $state, $stateParams, $timeout, $rootScope, $q, $http, $filter, gettext, gettextCatalog, Config, Lang, SubjectService) {
		/*jshint validthis: true */
		var vm = this;

		// vm.searchUrl = Config.skosmos.searchUrl;
		vm.lang = Lang.language;
		vm.defaultLang = Lang.defaultLanguage;
		vm.vocab = ($stateParams.vocab && $stateParams.vocab != 'all') ? $stateParams.vocab : null;
		// vm.formatRequest = formatRequest;
		// vm.formatResult = formatResult;
		vm.selectSubject = selectSubject;
		vm.openSearcMenu = openSearcMenu;
		vm.searchTruncation = searchTruncation;
		vm.truncate = 0;
		vm.query="";
		vm.truncations = [gettext('Starting with'), gettext('Containing'), gettext('Ends with'), gettext('Exact match')];
		vm.search = search;
		vm.errorMsg = '';
		vm.searchHistory = [];

		activate();

		////////////

		function activate() {
			vm.searchHistory = SubjectService.searchHistory;
			SubjectService.onSubject($scope, function (subject) {
				vm.searchHistory = SubjectService.searchHistory;
			});
		}

		//Temporary solution until angucomplete gets a proper search-on-focus behaviour
		function openSearcMenu() {

			var query = document.getElementById('search_value');

			angular.element(query).triggerHandler('input');
			angular.element(query).triggerHandler('keyup');
		}

		function searchTruncation(truncate) {
			vm.truncate  = truncate;
			openSearcMenu();
		}
			
		function formatRequest(str) {
			var query;

			switch(vm.truncate) {
				case 0: //Starting
					query = str + '*';
					break;
				case 1: //Contains
					query = (str.length == 2) ? str : '*' + str + '*';
					break;
				case 2: //Ends
					query = '*' + str;
					break;
				case 3: //Exact match
					query = str;
					break;
			}

			return {
				query: query,
				labellang: vm.lang,
				vocab: vm.vocab
			};
		}

		function matchResult(str,query) {

			if (vm.truncate===0 && query == str.substr(0,query.length)) return "Starting with"; 
			if (vm.truncate===1 && str.indexOf(query)>-1) return "Containing"; 
			if (vm.truncate===2 && query == str.substr((str.length-query.length),query.length)) return "Ends with"; 
			if (vm.truncate===3 && query == str) return "Exact Match";

			return false;
			
		}

		function formatResult(response,query) {

			//console.log('Got response',response);
			var result = [];
	
			//Remove duplicates and add matchedPreflabel and some notation where there is a match
			response.results.forEach(function (value, key) {

				var searchListIcon=""; 
				// Add Geographics/Temporal/GenreForm to list
				for (var i=0; i<value.type.length; i++) {
					var str = value.type[i].split(":")[1];

					if (str=="Geographic") {
						searchListIcon ="<span><i class=\"glyphicon glyphicon-map-marker\"></i><em> "+gettextCatalog.getString(str)+"</em></span>";
						break;
					}
					else if (str=="Temporal") {
						searchListIcon ="<span><i class=\"glyphicon glyphicon-time\"></i><em> "+gettextCatalog.getString(str)+"</em></span>";
						break;	
					}
					else if (str=="GenreForm") {
						searchListIcon ="<span><i class=\"glyphicon glyphicon-list-alt\"></i><em> "+gettextCatalog.getString(str)+"</em></span>";
						break;
					}
				}
					
				if (value.prefLabel!==undefined) { 

					//Check if match is on prefLabel
					if (matchResult(value.prefLabel.toLocaleLowerCase(),query.toLocaleLowerCase())) {
					
						//PrefLabel might exist from before
						if (!$filter('filter')(result, {uri : value.uri}, true).length){
							result.push({searchListIcon:searchListIcon,prefLabel:value.prefLabel,uri:value.uri});
						}	
					}
					//Or on matchedPrefLabel or altLabel
					else {
		
						if (value.matchedPrefLabel){
							if (!$filter('filter')(result, {uri : value.uri}, true).length){
								result.push({searchListIcon:searchListIcon,prefLabel:value.prefLabel,uri:value.uri,description:"("+value.matchedPrefLabel+")"});
							}
						}
						else if (value.altLabel){
							if (!$filter('filter')(result, {uri : value.uri}, true).length){
								result.push({searchListIcon:searchListIcon,prefLabel:value.prefLabel,uri:value.uri,description:"("+value.altLabel+")"});

							}
						}
					}
				}
			});
			
			return result;
		}

		function search(query) {

			vm.query=query;

			var deferred = $q.defer();

			//console.log('Searching with...',query);

			vm.errorMsg = '';
			$http({
			  method: 'GET',
			  cache: true,
			  url: Config.skosmos.searchUrl,
			  params: formatRequest(query),
			  ignoreLoadingBar: true  // angular-loading-bar
			}).
			then(function(data){
				console.log("========",Config.skosmos.searchUrl,query);
				vm.searchResults = data.data;
				var processed = formatResult(vm.searchResults,query);
				deferred.resolve(processed);
				console.log("-------->",data.data);
			}, function(error, q){
				if (error.status == -1) {
					vm.errorMsg = gettext('No network connection');
				} else {
					vm.errorMsg = error.statusText;
				}
				deferred.resolve({results: []});
			});

			return deferred.promise;
		}

		function shortIdFromUri(uri) {
			var s = uri.split('/'),
				id = s.pop(),
				vocab = s.pop();
			return id;
		}

		function selectSubject(item) {
			//console.log('selectSubject');
			if (item) {
				// console.log(item.originalObject.uri);
				var subjectId = shortIdFromUri(item.originalObject.uri);
				console.log('[SearchController] Selecting subject: ' + subjectId);

				$state.go('subject.search', {
					id: subjectId,
					term: null
				});
			}
		}
	}

})();
