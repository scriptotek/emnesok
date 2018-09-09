import template from './error.html';

export const errorComponentName = 'appError';

export const errorComponent = {
    template,
    controller: ErrorController,
    controllerAs: 'vm',
};

/* @ngInject */
function ErrorController($state, $stateParams, gettext, gettextCatalog) {
    /*jshint validthis: true */
    var vm = this;

    if ($state.get('error').error) {
        vm.message = $state.get('error').error.message;
    } else {
        var msg = gettext('An unknown error occured.');
        var translated = gettextCatalog.getString(msg);
        vm.message = translated;
    }
}
