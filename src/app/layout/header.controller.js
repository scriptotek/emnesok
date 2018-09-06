(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('HeaderController', HeaderController);

    /* @ngInject */
    function HeaderController($state, $stateParams, Lang, Config) {
        /*jshint validthis: true */
        var vm = this;

        vm.languageLabels = Config.languageLabels;
        vm.lang = Lang.language;
        vm.langState = $stateParams.lang;
        vm.languages = Lang.languages;
        vm.navCollapsed = true;
        vm.vocab = $stateParams.vocab ? Config.vocabularies[$stateParams.vocab] : null;

        vm.helloHidden = localStorage.getItem('hideHello1');

        vm.setLanguage = function (code) {
            Lang.setLanguage(code);
        };

        vm.hideHello = function () {
            localStorage.setItem('hideHello1', true);
            vm.helloHidden = true;
        };
    }

})();
