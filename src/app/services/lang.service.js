import angular from 'angular';
import configModule from './config.service';
import * as log from 'loglevel';
import translations from './translations.json';

const moduleName = 'app.services.lang';

angular
    .module(moduleName, [
        configModule,
    ])
    .service('langService', LangService);

export default moduleName;

/////

/* @ngInject */
function LangService($state, $rootScope, $transitions, gettextCatalog, Config) {
    this.language = null;
    this.defaultLanguage = null;
    this.languages = Config.languages;
    this.setLanguage = setLanguage.bind(this);

    gettextCatalog.setStrings('nb', translations.nb);
    gettextCatalog.setStrings('nn', translations.nn);

    $transitions.onStart({}, setLanguageFromState.bind(this));

    ////////////

    function setLanguage(code) {
        if (this.languages.indexOf(code) === -1) {
            log.error('Invalid language code: ' + code);
            return;
        }
        log.info('[Lang] Changing language to: ' + code);
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
            log.info('[Lang] Changing language from ' + this.language + ' to ' + lang);
            this.language = lang;
            gettextCatalog.setCurrentLanguage(lang);
        }
    }
}
