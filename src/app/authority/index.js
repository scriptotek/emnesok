import angular from 'angular';
import {authorityRecordComponentName, authorityRecordComponent} from './authorityRecord.js';
import {authorityViewComponentName, authorityViewComponent} from './authorityView.js';
import {wikidataComponentName, wikidataComponent} from './wikidata.js';
import {topConceptsComponentName, topConceptsComponent} from './topConcepts';

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
    .component(authorityViewComponentName, authorityViewComponent)
    .component(wikidataComponentName, wikidataComponent)
    .component(topConceptsComponentName, topConceptsComponent);
