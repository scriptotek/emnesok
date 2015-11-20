angular.module('app.services.config', []).factory('Config', [function Config() {
	console.log('[Config] Init');
	return {
		defaultLanguage: 'nb',
		skosmos: {
			dataUrl: 'https://skosmos.biblionaut.net/rest/v1/data?uri={uri}',
			searchUrl: 'https://skosmos.biblionaut.net/rest/v1/search'
		}
	};
}]);
