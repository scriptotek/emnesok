import angular from 'angular';

import {headerComponentName, headerComponent} from './header';
import {mainComponentName, mainComponent} from './main';
import {titleDirectiveName, titleDirective} from './title.directive';

const moduleName = 'app.layout';

angular
    .module(moduleName, [])
    .component(headerComponentName, headerComponent)
    .component(mainComponentName, mainComponent)
    .directive(titleDirectiveName, titleDirective);

export default moduleName;
