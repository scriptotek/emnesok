(function() {
	'use strict';

	angular
		.module('app', [
			'ngTouch',
			'ngSanitize',
			'angucomplete-alt',
			'restangular',
            'angularJsonld',
			'ui.router',
			'ui.bootstrap',
			'gettext',
			'ngToast',
			'ngAnimate',
			'app.modules.header',
			'app.modules.search',
			'app.modules.subject',
			'app.modules.catalogue',
			'app.modules.error'
		])
		.config(['$stateProvider', '$urlRouterProvider', 'ngToastProvider', configure])
		.run(['$rootScope', '$state', 'Lang', run]);

	function configure($stateProvider, $urlRouterProvider, ngToastProvider) {

		ngToastProvider.configure({
			animation: 'slide'
		});

		// Redirect from old ULRs
		// <https://github.com/scriptotek/emnesok/issues/1>
		$urlRouterProvider.when('/?id', function($match, $stateParams) {
			var map = {
				'UREAL': '/realfagstermer',
				'UHS': '/humord',
				'TEK': '/tekord',
				'MR': '/mrtermer'
			};
			if (map[$match.id] !== undefined) {
				return map[$match.id];
			}
			return false;
		});

		$urlRouterProvider.otherwise('/');

		$stateProvider
		.state('home', {
			url: '/?lang',
			views: {
				'header': {
					template: '<div mod-header></div>'
				},
				'main': {
					templateUrl: './templates/home.html?' + Math.random()
				}
			}
		})
		.state('error', {
			url: '/error?lang',
			views: {
				'header': {
					template: '<div mod-header></div>'
				},
				'main': {
					templateUrl: './templates/error.html?' + Math.random(),
					controller: 'ErrorController',
					controllerAs: 'vm'
				}
			}
		})
		.state('subject', {
			url: '/:vocab?lang',
			views: {
				'header': {
					template: '<div mod-header></div>'
				},
				'main': {
					template: [
						'<div class="container-fluid">',
						'<div class="row">',
						'	<div id="left" class="col-md-5">',
						'		<div mod-search></div>',
						'	</div>',
						'	<div id="right" class="col-md-7">',
						'		<div ui-view="catalogue"></div>',
						'	</div>',
						'</div>',
						'</div>'
					].join('')
				},
			}
		})
		.state('subject.search', {
			url: '/search?term&id&narrow&library',
			views: {
				'catalogue': {
					templateUrl: './templates/catalogue.html',
					controller: 'CatalogueController',
					controllerAs: 'vm'
				}
			},
			resolve: {
				subject: ['SubjectService', '$stateParams', function(SubjectService, $stateParams){
					if ($stateParams.term) {
						return SubjectService.getByTerm($stateParams.term, $stateParams.vocab);
					} else if ($stateParams.id) {
						return SubjectService.getById($stateParams.id, $stateParams.vocab);
					} else {
						// Exception
					}
				}]
			}
		});
	}

	function run($rootScope, $state, Lang) {

		$rootScope.$on('$stateChangeError', function (evt, toState, toParams, fromState, fromParams, error) {
			if (angular.isObject(error) && angular.isString(error.code)) {
				switch (error.code) {
					case 'NOT_AUTHENTICATED':
						// go to the login page
						$state.go('login');
						break;
					default:
						// set the error object on the error state and go there
						$state.get('error').error = error;
						$state.go('error');
				}
			} else {
				// unexpected error
				$state.go('error');
			}
		});
	}

})();
