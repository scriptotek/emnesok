
angular.module('app.services.lang', ['app.services.config', 'ui.router'])
.factory('Lang', ['$state', '$stateParams', 'Config', function Lang($state, $stateParams, Config) {

	var lang = $stateParams.lang || Config.defaultLanguage;
	console.log('[Lang] Init. Current lang is ' + lang);

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
			$state.go($state.current.name, {lang: code});
		}
	};
}]);
