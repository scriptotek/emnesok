//import angular from 'angular';
//import {uniqBy} from 'lodash/array';

let template = `
<div>
    <input
        type="text"
        ng-model="$ctrl.queryInput"
        ng-change="$ctrl.onInput()"
    >
    {{ $ctrl }}
</div>
`;

class SearchController {

    constructor() {

    }

    onInput() {
        console.log('INP:', this.queryInput);

        this.query = `"${this.queryInput}"`;
    }

}

export const searchComponentName = 'appSearch';

export const searchComponent = {
    template,
    controller: SearchController,
    bindings: {
        'data': '<',
    },
};
