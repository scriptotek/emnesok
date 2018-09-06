(function() {
    'use strict';

    angular
        .module('app.services.lang', [
            'app.services.config',
        ])
        .service('langService', LangService);

    /* @ngInject */
    function LangService($state, $rootScope, $transitions, gettextCatalog, Config) {

        console.log('INIT langService');

        this.language = null;
        this.defaultLanguage = null;
        this.languages = Config.languages;
        this.setLanguage = setLanguage.bind(this);

        $transitions.onStart({}, setLanguageFromState.bind(this));

        ////////////

        function setLanguage(code) {
            if (this.languages.indexOf(code) === -1) {
                console.error('Invalid language code: ' + code);
                return;
            }
            console.log('[Lang] Changing language to: ' + code);
            this.language = code;
            gettextCatalog.setCurrentLanguage(code);
            $state.go($state.current.name, {lang: code});
        }

        function setLanguageFromState(transition) {
            var state = transition.params('to');

            var vocab = state.vocab,
                defaultLanguage = Config.vocabularies[vocab] && Config.vocabularies[vocab].defaultLanguage || Config.defaultLanguage,
                lang = this.languages.indexOf(state.lang) !== -1 ? state.lang : defaultLanguage;

            this.defaultLanguage = defaultLanguage;

            if (lang != this.language) {
                console.log('[Lang] Changing language from ' + this.language + ' to ' + lang);
                this.language = lang;
                gettextCatalog.setCurrentLanguage(lang);
            }
        }
    }

})();
