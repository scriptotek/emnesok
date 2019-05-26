import template from './availability.html';

export const availabilityComponentName = 'appAvailability';

export const availabilityComponent = {
    template,
    controller: AvailabilityController,
    controllerAs: 'vm',
    bindings: {
        record: '<',
    },
};

/////

function AvailabilityController() {
    var vm = this;
}
