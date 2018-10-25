import angular from 'angular';
import {uniqBy} from 'lodash/array';
import template from './authorityResults.html';

export const authorityResultsComponentName = 'appAuthorityResults';

export const authorityResultsComponent = {
    template,
    controller: AuthorityResultsController,
    bindings: {
        'data': '<',
    },
};

/////

/* @ngInject */
function AuthorityResultsController($scope, $state, $stateParams, $timeout, $rootScope, $q, $http, $filter, gettext, gettextCatalog, Config, langService, AuthorityService) {

    console.log('YO');
    this.stateParams = $stateParams;
}
