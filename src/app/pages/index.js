import angular from 'angular';

import {aboutComponentName, aboutComponent} from './about';
import {errorComponentName, errorComponent} from './error';
import {homeComponentName, homeComponent} from './home';
import {vocabularyInfoComponentName, vocabularyInfoComponent} from './vocabularyInfo';
import {vocabularyNavComponentName, vocabularyNavComponent} from './vocabularyNav';

const moduleName = 'app.pages';

angular
    .module(moduleName, [])
    .component(aboutComponentName, aboutComponent)
    .component(errorComponentName, errorComponent)
    .component(homeComponentName, homeComponent)
    .component(vocabularyInfoComponentName, vocabularyInfoComponent)
    .component(vocabularyNavComponentName, vocabularyNavComponent);

export default moduleName;