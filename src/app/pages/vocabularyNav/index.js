import {find} from 'lodash/collection';
import {forOwn, result} from 'lodash/object';
import * as log from 'loglevel';
import humord from './humord_nav.html';

const templates = {
    humord,
};

export const vocabularyNavComponentName = 'appVocabularyNav';

export const vocabularyNavComponent = {
    template: /* @ngInject */ function ($stateParams) {
        let template = templates[$stateParams.vocab];
        return templates[$stateParams.vocab];
    },
};
