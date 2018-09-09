import angular from 'angular';
import * as log from 'loglevel';
import appBootstrap from './bootstrap';
import authorityModule from './authority';
import catalogueModule from './catalogue';

// CSS
import 'bootstrap/dist/css/bootstrap.css';
import 'angucomplete-alt/angucomplete-alt.css';
import 'angular-loading-bar/build/loading-bar.css';
import './layout/main.css';

log.enableAll();

angular.module('app', [
    appBootstrap,
    authorityModule,
    catalogueModule,
]);
