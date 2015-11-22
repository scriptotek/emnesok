
angular.module('app.services.lang', ['app.services.config', 'ui.router', 'gettext'])
.factory('Lang', ['$state', '$stateParams', '$rootScope', 'gettextCatalog', 'Config', function Lang($state, $stateParams, $rootScope, gettextCatalog, Config) {

	var language = null;
	var languages = Config.languages;
	var service = {
		language: language,
		languages: languages,
		setLanguage: setLanguage
	};

	activate();

	return service;

	////////////

	function activate() {
		setLanguageFromState($stateParams);

		// Highlight untranslated strings
		// gettextCatalog.debug = true;

		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
			if (toParams.vocab) {
				// A new vocabulary might mean a new default language.
				// E.g. when switching from Realfagstermer to Mrtermer, the default language
				// should change from 'nb' to 'en'.
				setLanguageFromState(toParams);
			}
		});
	}

	function setLanguage(code) {
		if (this.languages.indexOf(code) === -1) {
			console.error('Invalid language code: ' + code);
			return;
		}
		console.log('[Lang] Changing language to: ' + code);
		this.language = code;
		gettextCatalog.setCurrentLanguage(code);
		$state.go($state.current.name, {lang: code});
	}

	function setLanguageFromState(state) {
		var vocab = state.vocab,
			defaultLanguage = Config.vocabularies[vocab] && Config.vocabularies[vocab].defaultLanguage || Config.defaultLanguage,
			lang = state.lang || defaultLanguage;

		service.defaultLanguage = defaultLanguage;

	  	if (lang != service.language) {
			console.log('[Lang] Changing language from ' + service.language + ' to ' + lang);
			service.language = lang;
			gettextCatalog.setCurrentLanguage(service.language);
	  	}
	}

}]);
