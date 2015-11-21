
angular.module('app.services.lang', ['app.services.config', 'ui.router', 'gettext'])
.factory('Lang', ['$state', '$stateParams', 'gettextCatalog', 'Config', function Lang($state, $stateParams, gettextCatalog, Config) {

	var lang = $stateParams.lang || Config.defaultLanguage;
	console.log('[Lang] Init. Current lang is ' + lang);
	gettextCatalog.setCurrentLanguage(lang);

	// Highlight untranslated strings
	// gettextCatalog.debug = true;

	return {
		language: lang,
		languages: Config.languages,
		setLanguage: function(code) {
			if (this.languages.indexOf(code) === -1) {
				console.error('Invalid language code: ' + code);
				return;
			}
			console.log('[Lang] Changing language to: ' + code);
			this.language = code;
			gettextCatalog.setCurrentLanguage(code);
			$state.go($state.current.name, {lang: code});
		}
	};
}]);
