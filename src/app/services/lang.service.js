(function() {
    'use strict';

    angular
        .module('app.services.lang', [
            'app.services.config',
        ])
        .factory('Lang', LangFactory);

    /* @ngInject */
    function LangFactory($state, $rootScope, $transitions, gettextCatalog, Config) {

        var service = {
            language: null,
            defaultLanguage: null,
            languages: Config.languages,
            setLanguage: setLanguage
        };

        activate();

        return service;

        ////////////

        function activate() {

            // Highlight untranslated strings
            // gettextCatalog.debug = true;

            $transitions.onStart({}, function(transition){
                var toParams = transition.params('to');
                // A new vocabulary might mean a new default language.
                // E.g. when switching from Realfagstermer to Mrtermer, the default language
                // should change from 'nb' to 'en'.
                setLanguageFromState(toParams);
            });
        }

        function setLanguage(code) {
            if (service.languages.indexOf(code) === -1) {
                console.error('Invalid language code: ' + code);
                return;
            }
            console.log('[Lang] Changing language to: ' + code);
            service.language = code;
            gettextCatalog.setCurrentLanguage(code);
            $state.go($state.current.name, {lang: code});
        }

        function setLanguageFromState(state) {
            var vocab = state.vocab,
                defaultLanguage = Config.vocabularies[vocab] && Config.vocabularies[vocab].defaultLanguage || Config.defaultLanguage,
                lang = state.lang || defaultLanguage;

            service.defaultLanguage = defaultLanguage;

            if (lang != service.language) {
                console.log('[Lang] Changing language from ' + service.language + ' to ' + lang);
                service.language = lang;
                gettextCatalog.setCurrentLanguage(service.language);
            }
        }
    }

})();
