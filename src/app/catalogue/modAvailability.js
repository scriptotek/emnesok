(function() {
    'use strict';

    angular
        .module('app.catalogue')
        .directive('modAvailability', AvailabilityDirective)
    ;

    /* ------------------------------------------------------------------------------- */

    function AvailabilityDirective() {

        var directive = {
            restrict: 'EA',
            templateUrl: 'app/catalogue/availability.html',
            replace: false,
            scope: {
                record: '='
            },
            controllerAs: 'vm',
            controller: controller,
            bindToController: true // because the scope is isolated
        };

        return directive;
    }

    controller.$inject = [];

    function controller() {
        var vm = this;
    }


})();
