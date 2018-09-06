(function() {
    'use strict';

    angular
		.module('app.vocabulary', [
            'app.services.authority',
            'app.services.config',
            'app.services.title',
        ])
		.component('appVocabularyInfo', {
            templateUrl: /* @ngInject */ function ($stateParams) {
                console.log('INIT WITH', $stateParams);
                return 'app/vocabulary/' + $stateParams.vocab + '.html';
            },
            controller: VocabularyInfoController,
            controllerAs: 'vm',
        });

    /* @ngInject */
    function VocabularyInfoController($stateParams, Config, TitleService, AuthorityService) {
		/*jshint validthis: true */
        var vm = this;
        var vocabName = Config.vocabularies[$stateParams.vocab].name;

        TitleService.set(vocabName);

        AuthorityService.getVocabulary($stateParams.vocab).then(function(vocabulary) {
            _.forOwn({
                topicCount: 'Topic',
                genreCount: 'GenreForm',
                placeCount: 'Place',
                timeCount: 'Time',
                compoundConceptCount: 'CompoundConcept',
                virtualCompoundConceptCount: 'VirtualCompoundConcept'
            }, function(val, key) {
                vm[key] = _.result(_.find(vocabulary.subTypes, { 'type': 'http://data.ub.uio.no/onto#' + val }), 'count');
            });
        });

    }

})();
