(function() {
    'use strict';

	angular
		.module('app.services.session', ['app.services.config'])
		.factory('Session', ['Config', Session]);

	function Session(Config) {
		console.log('[Session] Init');

		var factory = {
	        institutions: Config.institutions,
	        selectedInstitution: null,
	        selectedLibrary: null,
	        selectInstitution: selectInstitution,
	        selectLibrary: selectLibrary,
		};

		return factory;

		///////////

        function selectInstitution(institution) {
            factory.selectedInstitution = institution;
            factory.selectedLibrary = null;
        }

        function selectLibrary(library) {
            factory.selectedLibrary = library;
        }

	}

})();
