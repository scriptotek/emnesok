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

    vm.history = [];
    vm.currentSubject = null;

    activate();

    /////

    function updateSubject() {
        vm.history = AuthorityService.history;
        vm.currentSubject = AuthorityService.currentSubject;
        if (vm.currentSubject) {
            vm.currentSubject.sortLabels();
        }
    }

    function activate() {
        updateSubject();
        AuthorityService.onSubject($scope, updateSubject);
    }
}

