/**
 * @desc title directive used to update the page title
 * @example <title>Subject Search</title>
 */

export const titleDirectiveName = 'title';

export const titleDirective = /* @ngInject */ function Title() {
    var directive = {
        link: link,
        restrict: 'E'
    };
    return directive;

    function link(scope, element) {
        scope.$on('pageTitleChanged', function listener(event, newTitle) {
            element.text(newTitle);
        });
    }
};
