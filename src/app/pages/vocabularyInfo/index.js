import {find} from 'lodash/collection';
import {forOwn, result} from 'lodash/object';
import * as log from 'loglevel';
import humord from './humord.html';
import mrtermer from './mrtermer.html';
import realfagstermer from './realfagstermer.html';
import tekord from './tekord.html';
import usvd from './usvd.html';
import mscUbo from './msc-ubo.html';
import acmCcsUbo from './acm-ccs-ubo.html';

const templates = {
    humord,
    mrtermer,
    realfagstermer,
    tekord,
    usvd,
    'msc-ubo': mscUbo,
    'acm-ccs-ubo': acmCcsUbo,
};

export const vocabularyInfoComponentName = 'appVocabularyInfo';

export const vocabularyInfoComponent = {
    template: /* @ngInject */ function ($stateParams) {
        let template = templates[$stateParams.vocab];
        if (template === undefined) {
            log.error('Unknown vocabulary: ', $stateParams.vocab);
        }
        return templates[$stateParams.vocab];
    },
    controller: VocabularyInfoController,
    controllerAs: 'vm',
};

/* @ngInject */
function VocabularyInfoController($stateParams, Config, TitleService, AuthorityService) {
    /*jshint validthis: true */
    var vm = this;
    var vocabName = Config.vocabularies[$stateParams.vocab].name;
    TitleService.set(vocabName);
    AuthorityService.clearCurrentSubject();
}
