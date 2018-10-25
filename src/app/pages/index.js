import angular from 'angular';

import {aboutComponentName, aboutComponent} from './about';
import {errorComponentName, errorComponent} from './error';
import {homeComponentName, homeComponent} from './home';
import {searchComponentName, searchComponent} from './search';
import {vocabularyInfoComponentName, vocabularyInfoComponent} from './vocabularyInfo';

const moduleName = 'app.pages';

angular
    .module(moduleName, [])
    .component(aboutComponentName, aboutComponent)
    .component(errorComponentName, errorComponent)
    .component(homeComponentName, homeComponent)
    .component(searchComponentName, searchComponent)
    .component(vocabularyInfoComponentName, vocabularyInfoComponent);

export default moduleName;
