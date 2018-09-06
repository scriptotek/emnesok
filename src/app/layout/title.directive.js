(function() {
    'use strict';

    /**
     * @desc title directive used to update the page title
     * @example <title>Subject Search</title>
     */
    angular
        .module('app.layout')
        .directive('title', TitleDirective);

    /* @ngInject */
    function TitleDirective($rootScope, $state, $timeout, gettext, gettextCatalog) {
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

})();
