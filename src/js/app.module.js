(function() {
	'use strict';

	angular
		.module('app', [
			'ngTouch',
			'ngSanitize',
			'angucomplete-alt',
			'restangular',
			'ui.router',
			'ui.bootstrap',
			'gettext',
			'ngToast',
			'ngAnimate',
			'app.modules.header',
			'app.modules.search',
			'app.modules.subject',
			'app.modules.catalogue',
			'app.modules.error',
			'app.modules.home',
			'app.modules.about',
			'app.modules.title',
			'app.modules.vocabulary',
			'templates'
		])
		.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$provide', 'ngToastProvider', configure])
		.run(['$rootScope', '$state', 'Lang', 'SubjectService', 'TitleService', run]);

	function configure($stateProvider, $urlRouterProvider, $locationProvider, $provide, ngToastProvider) {


    // Fix sourcemaps
    // @url https://github.com/angular/angular.js/issues/5217#issuecomment-50993513
    $provide.decorator('$exceptionHandler', function($delegate) {
      return function(exception, cause) {
        $delegate(exception, cause);
        setTimeout(function() {
          throw exception;
        });
      };
    });


        $locationProvider.html5Mode(true);

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
			data : { pageTitle: '' },
			views: {
				'header': {
					template: '<div mod-header></div>'
				},
				'main': {
					templateUrl: 'app/home.html',
					controller: 'HomeController',
					controllerAs: 'vm'
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
					templateUrl: 'app/error.html',
					controller: 'ErrorController',
					controllerAs: 'vm'
				}
			}
		})
		.state('about', {
			url: '/about?lang',
			data : { pageTitle: 'About' },
			views: {
				'header': {
					template: '<div mod-header></div>'
				},
				'main': {
					templateUrl: 'app/about.html',
					controller: 'AboutController',
					controllerAs: 'vm'
				}
			}
		})
		.state('subject', {
			url: '/:vocab?lang',
			abstract:true,
			views: {
				'header': {
					template: '<div mod-header></div>'
				},
				'main': {
					template: [
						'<div class="container-fluid">',
						'<div class="row">',
						'	<div id="left" class="col-sm-5">',
						'		<div mod-search></div>',
						'	</div>',
						'	<div id="right" class="col-sm-7">',
						'		<div ui-view="catalogue"></div>',
						'	</div>',
						'</div>',
						'</div>'
					].join('')
				}
			}
		})
		.state('subject.vocab', {
			url: '/',
			views: {
				'catalogue': {
					templateUrl: function(stateParams) {
						return 'app/vocabs/' + stateParams.vocab + '.html';
					},
					controller: 'VocabularyController',
					controllerAs: 'vm'
				}
			},
			resolve: {
				vocabulary: ['SubjectService', '$stateParams', function(SubjectService, $stateParams){
					return SubjectService.getVocabulary($stateParams.vocab);
				}]
			}
		})
		.state('subject.search', {
			url: '/search?term&id&broad&library',
			views: {
				'catalogue': {
					templateUrl: 'app/catalogue.html',
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

	function run($rootScope, $state, Lang, SubjectService, TitleService) {

		$rootScope.$on('$stateChangeSuccess', function listener(event, toState) {
			if (toState.data && toState.data.pageTitle !== undefined) {
				TitleService.set(toState.data.pageTitle);
			}
		});

		$rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams, error) {
			if (!toParams.id && !toParams.term) {
				SubjectService.clearSearchHistory();
			}
		});

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
