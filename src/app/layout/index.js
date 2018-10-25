import angular from 'angular';

import {headerComponentName, headerComponent} from './header';
import {mainComponentName, mainComponent} from './main';
import {titleDirectiveName, titleDirective} from './title.directive';
import {encodeURIComponentFilterName, encodeURIComponentFilter} from './encodeURIComponent.filter';

const moduleName = 'app.layout';

angular
    .module(moduleName, [])
    .component(headerComponentName, headerComponent)
    .component(mainComponentName, mainComponent)
    .directive(titleDirectiveName, titleDirective)
    .filter(encodeURIComponentFilterName, encodeURIComponentFilter);

export default moduleName;
