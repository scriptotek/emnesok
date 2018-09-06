(function() {
    'use strict';

    angular
        .module('app.services.session', [
            'app.services.config',
        ])
        .factory('Session', SessionService);

    function SessionService(Config) {

        var factory = {
            institutions: Config.institutions,
            selectedInstitution: null,
            selectedLibrary: null,
            selectInstitution: selectInstitution,
            selectLibrary: selectLibrary
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
