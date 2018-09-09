import angular from 'angular';
import configService from './config.service';

const moduleName = 'app.services.session';

angular
    .module(moduleName, [
        configService,
    ])
    .factory('Session', SessionService);

export default moduleName;

/////

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
