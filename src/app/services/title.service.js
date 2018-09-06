(function() {
    'use strict';

    angular
        .module('app.services.title', [])
        .factory('TitleService', TitleService);

    /* @ngInject */
    function TitleService($rootScope, $state, $timeout, gettext, gettextCatalog) {

        var service = {
            set: setTitle,
        };

        return service;

        ////////////

        function setTitle(title, track) {
            var msg = gettext('Subject Search');
            if (title) {
                title = title + ' - ';
            }
            title += gettextCatalog.getString(msg);
            $rootScope.$emit('pageTitleChanged', title);
        }
    }

})();
