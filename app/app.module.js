(function() {
    'use strict';

	angular
		.module('app', [
			'ngTouch',
			'ngSanitize',
			'angucomplete-alt',
			'ui.router',
			'ui.bootstrap',
			'gettext',
			'app.modules.header',
			'app.modules.search',
			'app.modules.search-history',
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
						'		<div ui-view="search-history"></div>',
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
				'search-history': {
					template: '<div mod-search-history></div>'
				},
				'catalogue': {
					template: '<div mod-catalogue></div>'
				}
			}
		});
	}

})();
