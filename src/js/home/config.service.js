(function() {
	'use strict';

	angular
		.module('app.services.config', [])
		.factory('Config', Config);

	function Config() {
		var factory = {
			languages: ['nb', 'nn', 'en'],
			languageLabels: {
				nb: 'Bokmål',
				nn: 'Nynorsk',
				en: 'English',
				la: 'Latin'
			},
			defaultLanguage: 'nb',
			institutions: {
				'UBO': {
					label: 'UiO',
					libraries: {
						'1030310': {label: 'Realfagsbiblioteket VB'},
						'1030317': {label: 'Informatikkbiblioteket'},
						'1030500': {label: 'Naturhistorisk museum'},
						'1030300,1030303': {label: 'Humsam-biblioteket + Sophus Bugge'},
						'1030010': {label: 'Etnografisk bibliotek'},
						'1030011': {label: 'Arkeologisk bibliotek'},
						'1030048': {label: 'Menneskerettighetsbiblioteket'}
					}
				},
				'UBB': {
					label: 'UiB',
					libraries: {
						'1120104': {label: 'Bibliotek for realfag'},
						'1120100': {label: 'Bibliotek for humaniora'},
						'1120108': {label: 'Bibliotek for samfunnsvitenskap'}
					}
				},
				'NTNU_UB': {
					label: 'NTNU',
					libraries: {
						'1160133': {label: 'DORA'},
						'1160103': {label: 'Realfagbiblioteket'},
						'1160101': {label: 'Teknologibiblioteket'}
					}
				},
				'UBTO': {label: 'UiT'},
				'NMBU': {label: 'NMBU'}
			},
			vocabularies: {
				realfagstermer: {
					name: 'Realfagstermer',
					languages: ['nb', 'nn', 'en'],
					defaultLanguage: 'nb',
					uriPattern: 'http://data.ub.uio.no/realfagstermer/{id}',
					show_vocabs: ['realfagstermer', 'ddc', 'ubo'],
				},
				humord: {
					name: 'Humord',
					languages: ['nb'],
					defaultLanguage: 'nb',
					uriPattern: 'http://data.ub.uio.no/humord/{id}',
					show_vocabs: ['humord', 'ddc', 'ubo'],
				},
				tekord: {
					name: 'Tekord',
					languages: ['nb'],
					defaultLanguage: 'nb',
					uriPattern: 'http://data.ub.uio.no/tekord/{id}',
					show_vocabs: ['tekord'],
				},
				mrtermer: {
					name: 'Human Rights Terms',
					languages: ['en'],
					defaultLanguage: 'en',
					uriPattern: 'http://data.ub.uio.no/mrtermer/{id}',
					show_vocabs: ['mrtermer'],
				},
				ddc: {
					name: 'DDC',
					languages: ['nb'],
					defaultLanguage: 'nb',
					uriPattern: 'http://dewey.info/{id}',
					show_vocabs: ['realfagstermer', 'humord', 'ddc'],
				}
			},
			skosmos: {
				vocabularyStatisticsUrl: 'https://data.ub.uio.no/skosmos/rest/v1/{vocab}/vocabularyStatistics',
				dataUrl: 'https://data.ub.uio.no/skosmos/rest/v1/data?uri={uri}',
				searchUrl: 'https://data.ub.uio.no/skosmos/rest/v1/search'
			},
			catalogue: {
				searchUrl: 'https://ub-lsm.uio.no/primo/search',
				groupUrl: 'https://ub-lsm.uio.no/primo/groups/{id}'
			}
		};
		return factory;
	}

})();
