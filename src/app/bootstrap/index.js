import angular from 'angular';
import ngSanitize from 'angular-sanitize';
import ngAnimate from 'angular-animate';
import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import gettext from 'angular-gettext';
import angulartics from 'angulartics';
import angularticsGoogleAnalytics from 'angulartics-google-analytics';
import angularLoadingBar from 'angular-loading-bar';
import 'angucomplete-alt';
import router from '../router';
import services from '../services';
import pages from '../pages';
import layout from '../layout';
import config from './config';
import {compileDirectiveName, compileDirective} from './compile.directive';
import {objectKeysFilterName, objectKeysFilter} from './objectKeys.filter';

const moduleName = 'app.bootstrap';

angular
    .module(moduleName, [

        // AngularJS modules
        ngSanitize,
        ngAnimate,

        // Third-party modules
        uiRouter,
        uiBootstrap,
        gettext,
        angulartics,
        angularticsGoogleAnalytics,
        angularLoadingBar,
        'angucomplete-alt',

        // Core app modules
        services,
        router,
        pages,
        layout,
    ])
    .config(config)
    .directive(compileDirectiveName, compileDirective)
    .filter(objectKeysFilterName, objectKeysFilter);

export default moduleName;
