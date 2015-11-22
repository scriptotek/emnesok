angular.module('app.services.config', []).factory('Config', [function Config() {
	console.log('[Config] Init');
	return {
		languages: ['nb', 'nn', 'en'],
		languageLabels: {
			nb: 'Bokmål',
			nn: 'Nynorsk',
			en: 'English',
			la: 'Latin'
		},
		defaultLanguage: 'nb',
		vocabularies: {
			realfagstermer: {
				name: 'Realfagstermer',
				languages: ['nb', 'nn', 'en'],
				defaultLanguage: 'nb'
			},
			humord: {
				name: 'Humord',
				languages: ['nb'],
				defaultLanguage: 'nb'
			},
			mrtermer: {
				name: 'Human Rights Terms?',
				languages: ['en'],
				defaultLanguage: 'en'
			}
		},
		skosmos: {
			dataUrl: 'https://skosmos.biblionaut.net/rest/v1/data?uri={uri}',
			searchUrl: 'https://skosmos.biblionaut.net/rest/v1/search'
		}
	};
}]);
