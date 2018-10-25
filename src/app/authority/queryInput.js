import angular from 'angular';
import {uniqBy} from 'lodash/array';
import template from './queryInput.html';

export const queryInputComponentName = 'appQueryInput';

export const queryInputComponent = {
    template,
    controller: queryInputController,
    bindings: {
        'data': '=',
        'vocab': '<',
    },
};

/////

/* @ngInject */
function queryInputController($scope, $state, $stateParams, $timeout, $rootScope, $q, $http, $filter, gettext, gettextCatalog, Config, langService, AuthorityService) {
    this.disabled = false;
    this.initialValue = null;
    this.value = '';

    let lookupByUri = (uri) => {
        AuthorityService
            .getByUri(uri)
            .then(result => {
                this.data.concept = result;
                this.initialValue = result.getPrefLabel();
                console.log('Got full concept data', result);
                this.data.ready = true;
                $scope.$emit('queryPartReady');
            });
    }

    let search = (authQuery) => {

        // TODO: Fix exact authQuery = authQuery.replace(/"(.*)"/, '$1');

        return AuthorityService
            .search(
                authQuery,
                this.vocab
            )
            // .then(results => Promise.all(
            //     results.map(x => AuthorityService.getByUri(x.uri))
            // ))
            .then(results => {
                this.data.matches = results;
                console.log(`Matched ${this.data.matches.length} concepts`, this.data.matches);
                if (this.data.matches.length == 0) {
                    if (authQuery.indexOf('*') === -1 && authQuery.indexOf('"') === -1) {
                        // Retry query with fuzzy
                        search(authQuery + '*');
                    } else {
                        this.data.ready = true;
                        $scope.$emit('queryPartReady');
                    }
                } else if (this.data.matches.length == 1) {
                    this.data.type = 'Concept';
                    lookupByUri(this.data.matches[0].uri);
                } else {
                    this.data.ready = true;
                    $scope.$emit('queryPartReady');
                }
            });
    }

    this.$onChanges = function() {
        if (this.data.type == 'Concept') {
            lookupByUri(this.data.term);
        } else {
            this.initialValue = this.data.term;
            search(this.data.term);
        }
    }

    this.search = (value) => {
        return new Promise((resolve, reject) => {
            // console.log('Ent', value);
        });
    };

    this.inputChanged = (value) => {
        console.log('INPc', value);
        this.value = value;
        this.data.term = value;
        this.data.type = 'Text';
    };

    this.openSearcMenu = (value) => {

    };

    this.selectSuggestion = (v) => {
        //console.log('SELEC', v);
    };
}
