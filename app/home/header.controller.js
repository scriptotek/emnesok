angular.module('app.controllers.header', ['app.services.lang']).controller('HeaderController', ['$state', 'Lang',
    function HeaderController($state, Lang) {
		console.log('[HeaderController] Init');

		this.langNames = {
			nb: 'Bokmål',
			nn: 'Nynorsk',
			en: 'English'
		};
		this.lang = Lang.language;
		this.languages = Lang.languages;

		this.setLanguage = function(code) {
			Lang.setLanguage(code);
		};
	}
]);