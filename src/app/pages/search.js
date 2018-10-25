import template from './search.html';
import { findIndex } from 'lodash/array';
import { flatMap } from 'lodash/collection';

export const searchComponentName = 'appSearch';

export const searchComponent = {
    template,
    controller: searchController,
};


class QueryPart {
    constructor(term = '', type = 'Text', relation = 'AND') {
        this.term = term;
        this.type = type;
        this.relation = relation;
        this.matches = [];
        this.concept = null;
    }

    format() {
        if (this.type == 'Concept') {
            return this.relation + ' ' + this.concept.getPrefLabel();
        } else {
            return this.relation + ' ' + this.term;
        }
    }
}

/* @ngInject */
function searchController($scope, langService, $state, $stateParams, AuthorityService, Catalogue) {
    this.lang = langService.language;
    this.busy = false;
    this.initialLoading = false;
    this.queryParts = [new QueryPart()];
    this.catalogueRecords = [];

    $scope.$on('queryPartReady', _ => {
        console.log('Query part ready!');
        // If all query parts are ready, init search. For now, we only support one part.
        doCatalogueSearch();
    });

    this.vocabs = [
        {id: null, label: 'Søk i alt'},
        {id: 'realfagstermer', label: 'Realfagstermer'},
        {id: 'humord', label: 'Humord'},
        {id: 'tekord', label: 'Tekord'},
        {id: 'ddc', label: 'Norsk WebDewey'},
    ];
    this.selectedVocab = findIndex(this.vocabs, x => x.id == $stateParams.vocab);

    if ($stateParams.q) {

        this.busy = true;
        this.initialLoading = true;

        // Handle exact searches and wildcards, default to * on end
        this.queryParts = $stateParams.q.split(/ (AND|OR) /).map(term => {
            let type = 'Text';
            if (term.indexOf('uri:') === 0) {
                type = 'Concept';
                term = term.substring(4);
            }
            return new QueryPart(term, type);
        });

        // parseQuery($stateParams.q, $stateParams.vocab, AuthorityService).then(queryParts => {

        //     this.queryParts = queryParts;

        //     this.busy = false;
        //     this.initialLoading = false;
        //     return;

        //     // this.initialValue = this.queryParts.map( x => x.results[0].getPrefLabel() ).join(' AND ');
        //     this.query = $stateParams.q;

        //     console.log('Query parts:' , this.queryParts);

        //     let q = this.buildCatalogueQuery();
        //     console.log('DO Q:', q);
        //     Catalogue
        //         .search(
        //             {subject: q, vocab: $stateParams.vocab}
        //         )
        //         .then(resp => {
        //             console.log(resp);
        //             this.catalogueRecords = resp.results;
        //             this.catalogueRecordsTotal = resp.total_results;
        //         });
        // });


        // If search is simple, go ahead and do a catalogue search right away to save time
        // if (this.queryParts.length == 1 && this.queryParts[0].type == 'normal') {
        //     Catalogue
        //         .search(
        //             {subject: $stateParams.q, vocab: $stateParams.vocab}
        //         )
        //         .then(resp => {
        //             console.log(resp);
        //             this.catalogueRecords = resp.results;
        //             this.catalogueRecordsTotal = resp.total_results;
        //         });
        // }
    }

    let doCatalogueSearch = () => {
            let q = buildCatalogueQuery();
            console.log('DO Q:', q);
            Catalogue
                .search(
                    {subject: q, vocab: $stateParams.vocab}
                )
                .then(resp => {
                    console.log(resp);
                    this.catalogueRecords = resp.results;
                    this.catalogueRecordsTotal = resp.total_results;
                });
    }

    let buildCatalogueQuery = () => {
        console.log('jeez, we got dataz baby!', this.queryParts);
        let d = flatMap(this.queryParts, queryPart => {
            console.log(queryPart);
            return queryPart.format();
        });

        let out = d.join(' ').replace(/^.* /, '') // Remove first operator
        console.log(out);
        return out;
    }

    this.selectVocab = (idx) => {
        $state.go('home', {
            vocab: this.vocabs[idx].id,
        });
    };

    this.submit = (evt) => {
        console.log('SUBMIT', this.queryParts);
        $state.go('home', {
            q: this.queryParts
                .map(queryPart => queryPart.relation + ' ' + (queryPart.type == 'Concept' && queryPart.uri || queryPart.term))
                .join(' ')
                .replace(/^.* /, '') // Remove first operator
        });
    };
}
