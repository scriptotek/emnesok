(function() {
    'use strict';

	angular
		.module('app.services.config', [])
		.factory('Config', Config);

	function Config() {
		console.log('[Config] Init');
		var factory = {
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
					defaultLanguage: 'nb',
					uriPattern: 'http://data.ub.uio.no/realfagstermer/{id}'
				},
				humord: {
					name: 'Humord',
					languages: ['nb'],
					defaultLanguage: 'nb',
					uriPattern: 'http://data.ub.uio.no/humord/{id}'
				},
				tekord: {
					name: 'Tekord',
					languages: ['nb'],
					defaultLanguage: 'nb',
					uriPattern: 'http://data.ub.uio.no/tekord/{id}'
				},
				mrtermer: {
					name: 'Human Rights Terms?',
					languages: ['en'],
					defaultLanguage: 'en',
					uriPattern: 'http://data.ub.uio.no/mrtermer/{id}'
				}
			},
			skosmos: {
				dataUrl: 'https://skosmos.biblionaut.net/rest/v1/data?uri={uri}',
				searchUrl: 'https://skosmos.biblionaut.net/rest/v1/search'
			}
		};
		return factory;
	}

})();
