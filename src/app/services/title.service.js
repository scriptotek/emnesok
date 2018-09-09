import angular from 'angular';

const moduleName = 'app.services.title';

angular
    .module(moduleName, [])
    .factory('TitleService', TitleService);

export default moduleName;

/////

/* @ngInject */
function TitleService($rootScope, $state, $timeout, gettext, gettextCatalog) {

    var service = {
        set: setTitle,
    };

    return service;

    ////////////

    function setTitle(title) {
        var msg = gettext('Subject Search');
        if (title) {
            title = title + ' - ';
        }
        title += gettextCatalog.getString(msg);
        $rootScope.$emit('pageTitleChanged', title);
    }
}
