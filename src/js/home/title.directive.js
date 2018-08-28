(function() {
    'use strict';

    /**
     * @desc title directive used to update the page title
     * @example <title>Subject Search</title>
     */
    angular
        .module('app.modules.title', [])
        .directive('title', TitleDirective)
        .factory('TitleService', TitleService);

    /* ------------------------------------------------------------------------------- */

    function TitleDirective() {
        var directive = {
            link: link,
            restrict: 'E'
        };
        return directive;

        function link(scope, element, attrs) {
            scope.$on('pageTitleChanged', function listener(event, newTitle) {
                element.text(newTitle);
            });
        }
    }

    /* ------------------------------------------------------------------------------- */

    TitleService.$inject = ['$rootScope', '$state', '$timeout', 'gettext', 'gettextCatalog'];

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
