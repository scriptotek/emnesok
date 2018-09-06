(function() {
    'use strict';

    angular
        .module('app.catalogue')
        .component('modCatalogueResult', {
            templateUrl: 'app/catalogue/catalogue-result.html',
            controller: ModCatalogueResultController,
            controllerAs: 'vm',
            bindings: {
                record: '<',
                vocab: '<',
                indexTerm: '<',
            },
        });

    /* @ngInject */
    function ModCatalogueResultController(Lang, Catalogue, Config, AuthorityService, $state, ngToast, gettext, gettextCatalog, $analytics, $stateParams) {
        /*jshint validthis: true */
        var vm = this;

        vm.recordExpanded = false;
        vm.clickSubject = clickSubject;
        vm.expandGroup = expandGroup;
        vm.versions = [];
        vm.filterPrint = filterPrint;
        vm.filterElectronic = filterElectronic;
        vm.getStatus = getStatus;
        vm.selectedInstitution = $stateParams.library ? $stateParams.library.split(':')[0] : null;
        vm.vocabularies = Config.vocabularies;
        vm.busy = false;


        ////////////

        function clickSubject(subject) {
            if (vm.busy) {
                return;
            }
            vm.busy = true;

            $analytics.eventTrack('ClickTag', {category: 'UncontrolledTag', label: subject});

            AuthorityService.exists(subject, vm.vocab).then(function (response) {
                vm.busy = false;
                if (!response) {
                    $analytics.eventTrack('TagLookupFailed', {
                        category: 'UncontrolledTag',
                        label: subject,
                        nonInteraction: true
                    });

                    var msg = gettext('Sorry, the subject "{{subject}}" was not found in the current vocabulary.');
                    var translated = gettextCatalog.getString(msg, {subject: subject});
                    ngToast.danger(translated, 'danger');
                } else {
                    $analytics.eventTrack('TagLookupSuccess', {
                        category: 'UncontrolledTag',
                        label: subject,
                        nonInteraction: true
                    });
                    $state.go('subject.search', {id: response.localname, term: null});
                }
            }, function (err) {

            });
        }

        function expandGroup() {
            var groupId = vm.record.id;
            vm.busy = true;
            Catalogue.expandGroup(groupId, vm.selectedInstitution).then(function (response) {
                vm.busy = false;
                vm.recordExpanded = true;
                vm.versions = response.result.records;

            }, function (error) {
                vm.busy = false;
                var msg = gettext('Failed to fetch list of editions.');
                var translated = gettextCatalog.getString(msg);
                ngToast.danger(translated, 'danger');
            });
        }

        function filterPrint(component) {
            return component.category == 'Alma-P';
        }

        function filterElectronic(component) {
            return component.category !== undefined && component.category !== 'Alma-P';
        }

        function getStatus(status) {
            var statuses = {
                'check_holdings': 'might be available'
            };
            return statuses[status] || status;
        }
    }

})();
