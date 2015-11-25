(function() {
	'use strict';

	angular
		.module('app.modules.search', ['app.services.config'])
		.directive('modSearch', SearchModule);

	function SearchModule() {

		var directive = {
	        restrict: 'A',
	        templateUrl: './templates/search.html?' + Math.random(),
	        replace: false,
	        scope: {},
	        controllerAs: 'vm',
	        controller: ['$state', '$stateParams', '$timeout', '$rootScope', '$q', '$http', '$filter', 'gettext', 'Config', controller]
	    };

		return directive;
	}

	function controller($state, $stateParams, $timeout, $rootScope, $q, $http, $filter, gettext, Config) {
		/*jshint validthis: true */
		var vm = this;
		console.log(vm);

		// vm.searchUrl = Config.skosmos.searchUrl;
		vm.lang = $stateParams.lang || Config.defaultLanguage;
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

		searchTruncation

		console.log('[Search] Init');

		////////////
		
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
	
			if (vm.truncate==0 && query == str.substr(0,query.length)) return true; //Starting
			if (vm.truncate==1 && str.indexOf(query)>-1) return true; //Contains
			if (vm.truncate==2 && query == str.substr((str.length-query.length),query.length)) return true; //Ends
			if (vm.truncate==3 && query == str) return true; //Exact match

			return false;
			
		}

		function formatResult(response,query) {

			console.log('Got response',response);

			var result = [];
	
			//Remove duplicates and add matchedPreflabel where there is a match
			response.results.forEach(function (value, key) {
				
				//Check if match is on prefLabel
				if (matchResult(value.prefLabel.toLocaleLowerCase(),query.toLocaleLowerCase())) {
				
					//PrefLabel might exist from before
					if (!$filter('filter')(result, {uri : value.uri}, true).length){
						result.push({prefLabel:value.prefLabel,uri:value.uri});
					}	
				}
				//Or on matchedPrefLabel or altLabel
				else {

					if (value.matchedPrefLabel){
						if (!$filter('filter')(result, {uri : value.uri}, true).length){
							result.push({prefLabel:value.prefLabel+" <- "+value.matchedPrefLabel,uri:value.uri});
						}
					}
					else if (value.altLabel){
						if (!$filter('filter')(result, {uri : value.uri}, true).length){
							result.push({prefLabel:value.prefLabel+" <- "+value.altLabel,uri:value.uri});
						}
					}
				}
			});
			
			return result;
		}

		function search(query) {

			vm.query=query;

			var deferred = $q.defer();

			console.log('Searching with...',query);

			vm.errorMsg = '';
			$http({
			  method: 'GET',
			  cache: true,
			  url: Config.skosmos.searchUrl,
			  params: formatRequest(query)
			}).
			then(function(data){
				console.log('>> GOT DATA');
				var processed = formatResult(data.data,query);
				deferred.resolve(processed);
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
			return vocab + ':' + id;
		}

		function selectSubject(item) {
			console.log('selectSubject');
			if (item) {
				console.log(item.originalObject.uri);
				var subjects = shortIdFromUri(item.originalObject.uri);
				console.log('[SearchController] Selecting subject(s): ' + subjects);

				//Timeout required for reasons
				$timeout(function(){
					document.getElementById('search_value').value = vm.query;
				});

				$state.go('subject.search', {
					subjects:   subjects
				});
			}
		}
	}

})();

/*
$timeout(function() {
	console.log("Men nå da?");
			$scope.$broadcast('angucomplete-alt:changeInput', 'search', 'Hello!');
}, 0);*/

/*
		$rootScope.$on('$stateNotFound',
function(event, unfoundState, fromState, fromParams){
	console.log("state not found");
    console.log(unfoundState.to); // "lazy.state"
    console.log(unfoundState.toParams); // {a:1, b:2}
    console.log(unfoundState.options); // {inherit:false} + default options
});

$rootScope.$on('$stateChangeStart',
function(event, toState, toParams, fromState, fromParams){
  console.log('state change');
  console.log(toState);
    // transitionTo() promise will be rejected with
    // a 'transition prevented' error
});

$rootScope.$on('$stateChangeError',
function(event, toState, toParams, fromState, fromParams){
  console.log('state change error');
  console.log(toState);
    // transitionTo() promise will be rejected with
    // a 'transition prevented' error
});

$rootScope.$on('$stateChangeSuccess',
function(event, toState, toParams, fromState, fromParams){
  console.log('state change success');
  console.log(toState);
    // transitionTo() promise will be rejected with
    // a 'transition prevented' error
})

/*
http://data.ub.uio.no/yasqe/?query=PREFIX+skos%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0ASELECT+%3Flabel%0AFROM+%3Chttp%3A%2F%2Fdata.ub.uio.no%2Frt%3E%0AWHERE%0A%7B%0A++%3Fconcept+(skos%3AprefLabel%7Cskos%3AaltLabel)+%3Flabel+.%0A+++FILTER+langMatches(+lang(%3Flabel)%2C+%22nn%22+)%0A%7D

PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?label1 ?label2 ?label3
FROM <http://data.ub.uio.no/rt>
WHERE
{
  ?concept (skos:prefLabel) ?label1 , ?label2, ?label3
   FILTER langMatches( lang(?label1), "nn" )
   FILTER langMatches( lang(?label2), "nb" )
   FILTER langMatches( lang(?label3), "en" )
}

*/