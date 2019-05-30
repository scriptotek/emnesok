import template from './header.html';
import * as log from 'loglevel';

export const headerComponentName = 'appHeader';

export const headerComponent = {
    template,
    controller: HeaderController,
    controllerAs: 'vm',
    bindings: {
        data: '<',
    },
};

/* @ngInject */
function HeaderController($transitions, langService, Config, $state) {
    /*jshint validthis: true */
    var vm = this;

    vm.languages = langService.languages;
    vm.languageLabels = Config.languageLabels;
    vm.navCollapsed = true;
    vm.lang = langService.language;

    $transitions.onStart({}, function(transition) {
        let params = transition.params();
        log.info('Transition to', params);
        vm.vocab = params.vocab ? Config.vocabularies[params.vocab] : null;
        vm.lang = vm.languages.indexOf(params.lang) !== -1 ? params.lang : langService.language;
    });

    vm.setLanguage = function (code) {
        langService.setLanguage(code);
    };

    vm.helloHidden = localStorage.getItem('hideHello1');

    vm.hideHello = function () {
        localStorage.setItem('hideHello1', true);
        vm.helloHidden = true;
    };
}
