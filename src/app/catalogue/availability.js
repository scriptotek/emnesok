(function() {
    'use strict';

    angular
        .module('app.catalogue')
        .component('appAvailability', {
            templateUrl: 'app/catalogue/availability.html',
            controller: AvailabilityController,
            controllerAs: 'vm',
            bindings: {
                record: '<'
            },
        });

    function AvailabilityController() {
        var vm = this;
    }

})();
