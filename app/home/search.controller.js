angular.module('app.controllers.search', ['app.services.config']).controller('SearchController', ['$state', '$scope', '$rootScope', '$timeout', 'Config',
    function SearchController($state, $scope, $rootScope, $timeout, Config) {
		console.log('[SearchController] Init');
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

		this.searchUrl = Config.skosmos.searchUrl;

		this.formatRequest = function(str) {

			var lang = $state.params.lang || Config.defaultLanguage;

			var vocab = $state.params.vocab;

			var query = (str.length == 2) ? str : '*' + str + '*';

			return {
				query: query,
				labellang: lang,
				vocab: vocab
			};
		};

		this.formatResult = function(response) {

			return response.results.map(function(result) {
				result.description = result.matchedPrefLabel ? ' (' +result.matchedPrefLabel + ')' : '';
				return result;
			});

		};

		function shortIdFromUri(uri) {
			var s = uri.split('/'),
				id = s.pop(),
				vocab = s.pop();
			return vocab + ':' + id;
		}

		this.selectSubject = function(item) {
			if (item) {
				var subjects = shortIdFromUri(item.originalObject.uri);
				console.log('[SearchController] Selecting subject(s): ' + subjects);

				$state.go('home.subject', {
					lang:		item.originalObject.lang,
					subjects:   subjects
				});
			}
		};
    }
]);