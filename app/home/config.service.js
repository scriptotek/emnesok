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
			institutions: [
	            {id: 'UBO', label: 'UiO', libraries: [
		            {id: 'ubo1030310', label: 'Realfagsbiblioteket VB'},
		            {id: 'ubo1030317', label: 'Informatikkbiblioteket'},
		            {id: 'ubo1030500', label: 'NHM'},
		            {id: 'ubo1030300,1030303', label: 'Humsam-biblioteket + Sophus Bugge'}
		        ]},
	            {id: 'UBB', label: 'UiB'},
	            {id: 'NTNU_UB', label: 'NTNU'},
	            {id: 'UBTO', label: 'UiT'},
	            {id: 'NMBU', label: 'NMBU'}
	        ],
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
			},
			catalogue: {
				searchUrl: 'https://scs.biblionaut.net/primo/search',
				groupUrl: 'https://scs.biblionaut.net/primo/groups/{id}'
			}
		};
		return factory;
	}

})();
