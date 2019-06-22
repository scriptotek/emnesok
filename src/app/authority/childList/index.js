import {sortBy} from 'lodash/collection';
import template from './childList.html';

export const childListComponentName = 'appChildList';

export const childListComponent = {
    template,
    controller: childListController,
    controllerAs: 'vm',
    bindings: {
        topConcepts: '<',
        uri: '<',
    },
};

/* @ngInject */
function childListController($stateParams, Config, AuthorityService) {
    /*jshint validthis: true */
    var vm = this;
    vm.children = [];

    /////

    this.$onInit = function() {
        let vocab = Config.vocabularies[$stateParams.vocab];

        let results = vm.topConcepts
            ? AuthorityService.getTopConcepts($stateParams.vocab)
            : AuthorityService.getChildren($stateParams.vocab, vm.uri);

        results.then(function (data) {
            if (vocab.notationSearch) {
                vm.children = sortBy(data, 'notation');
            } else {
                vm.children = sortBy(data, 'label');
            }
        });
    };
}
