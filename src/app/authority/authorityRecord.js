import template from './authorityRecord.html';

export const authorityRecordComponentName = 'appAuthorityRecord';

export const authorityRecordComponent = {
    controller: AuthorityRecordController,
    template,
    controllerAs: 'vm',
    bindings: {
        data: '<',
    },
};

/////

/* @ngInject */
function AuthorityRecordController($scope, Config, langService) {
    /*jshint validthis: true */
    var vm = this;

    vm.error = null;
    vm.subject = null;
    vm.lang = langService.language;
    vm.languageLabels = Config.languageLabels;

    this.$onChanges = function() {
        if (!vm.data) {
            vm.error = null;
            vm.subject = null;
        } else {
            vm.subject = vm.data;
            // vm.vocab = vm.data.vocab;
        }
    };
}
