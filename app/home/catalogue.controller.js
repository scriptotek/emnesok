angular.module('app.controllers.catalogue', []).controller('CatalogueController', ['$http', '$stateParams','$rootScope',
    function CatalogueController($http, $stateParams, $rootScope) {
		console.log('[CatalogueController] Init');

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
		*/


    }
]);
