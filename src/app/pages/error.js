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

    var msg = gettext('An unknown error occured');
    var translated = gettextCatalog.getString(msg);

    if ($state.get('error').message) {
        vm.message = translated + ': ' + $state.get('error').message;
    } else {
        vm.message = translated + '.';
    }
}
