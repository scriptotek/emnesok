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
			'app.modules.header',
			'app.modules.search',
			'app.modules.subject',
			'app.modules.catalogue'
		])
		.config(['$stateProvider', '$urlRouterProvider', configure]);

	function configure($stateProvider, $urlRouterProvider) {

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
			url: '/search?subjects',
			views: {
				'catalogue': {
					templateUrl: './templates/catalogue.html',
					controller: 'CatalogueController',
					controllerAs: 'vm'
				}
			},
			resolve: {
				subject: ['SubjectService', '$stateParams', function(SubjectService, $stateParams){
					var subjectParts = $stateParams.subjects.split(':');
					if (subjectParts.length == 2) {
						return SubjectService.get(subjectParts[0], subjectParts[1]);
					}
				}]
			}
		});
	}

})();
