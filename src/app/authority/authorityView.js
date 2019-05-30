import angular from 'angular';
import template from './authorityView.html';

export const authorityViewComponentName = 'appAuthorityView';

export const authorityViewComponent = {
    template,
    controller: AuthorityViewController,
    controllerAs: 'vm',
    bindings: {
        'data': '<',
    },
};

/////

/* @ngInject */
function AuthorityViewController($scope, $state, $stateParams, $timeout, $rootScope, $q, $http, $filter, gettext, gettextCatalog, Config, langService, AuthorityService) {
    /*jshint validthis: true */
    var vm = this;

    vm.searchHistory = [];

    activate();

    /////

    function activate() {
        vm.searchHistory = AuthorityService.searchHistory;
        AuthorityService.onSubject($scope, function () {
            vm.searchHistory = AuthorityService.searchHistory;
        });
    }
}

