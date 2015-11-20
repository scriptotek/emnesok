
angular.module('app', ["ngTouch", "angucomplete-alt", "ui.router", "ui.bootstrap",
	"app.controllers.search",
	"app.controllers.subject",
	"app.controllers.catalogue"
]);
angular.module('app').config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {
		
		$urlRouterProvider.otherwise('/');
		$stateProvider
		.state('home', {
			url: '/',
			views: {
				'header': { 
					templateUrl: './templates/header.html?' + Math.random()
				},
				'search': { 
					templateUrl: './templates/search.html?' + Math.random(),
					controller: 'SearchController',
					controllerAs: 'vm'
				}
			}
		})
		.state('home.subject', {
			url: ':vocab/:id/:subject/:lang',
			views: {
				'subject@': { 
					templateUrl: './templates/subject.html?' + Math.random(),
					controller: 'SubjectController',
					controllerAs: 'vm'
				},
				'catalogue@': { 
					templateUrl: './templates/catalogue.html?' + Math.random(),
					controller: 'CatalogueController',
					controllerAs: 'vm'
				}
			}
		});
	}
]);