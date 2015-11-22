
angular.module('app', ["ngTouch", "angucomplete-alt", "ui.router", "ui.bootstrap", "gettext",
	"app.modules.header",
	"app.modules.search",
	"app.modules.subject",
	"app.modules.catalogue"
]);
angular.module('app').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

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
			url: '/:vocab',
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
						'		<div ui-view="subject"></div>',
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
				'subject': {
					template: '<div mod-subject></div>'
				},
				'catalogue': {
					template: '<div mod-catalogue></div>'
				}
			}
		});
	}
]);