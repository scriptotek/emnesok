import angular from 'angular';
import {authorityRecordComponentName, authorityRecordComponent} from './authorityRecord.js';
import {authoritySearchComponentName, authoritySearchComponent} from './authoritySearch.js';
import {searchComponentName, searchComponent} from './search.js';

const moduleName = 'app.authority';

export default moduleName;

angular
    .module(moduleName,
        [
            'app.services.config',
            'app.services.lang',
            'app.services.authority',
            'app.services.externals',
        ]
    )
    .component(authorityRecordComponentName, authorityRecordComponent)
    .component(authoritySearchComponentName, authoritySearchComponent)
    .component(searchComponentName, searchComponent);
