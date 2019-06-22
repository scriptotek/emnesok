import {sortBy} from 'lodash/collection';
import template from './topConcepts.html';

export const topConceptsComponentName = 'appTopConcepts';

export const topConceptsComponent = {
    template,
    controller: TopConceptsController,
    controllerAs: 'vm',
};

/* @ngInject */
function TopConceptsController($stateParams, Config, AuthorityService) {
    /*jshint validthis: true */
    var vm = this;
    vm.topConcepts = [];

    activate();

    /////

    function activate() {
        console.log('GET')
        let vocab = Config.vocabularies[$stateParams.vocab];
        AuthorityService.getTopConcepts($stateParams.vocab).then(function (data) {
            console.log('GOT KEY', data)
            if (vocab.notationSearch) {
                vm.topConcepts = sortBy(data, 'notation');
            } else {
                vm.topConcepts = sortBy(data, 'label');
            }
        });
    }
}
