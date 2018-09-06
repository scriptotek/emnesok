(function() {
    'use strict';

    angular
		.module('app.vocabulary', [
            'app.services.authority',
            'app.services.config',
            'app.services.title',
        ])
		.controller('VocabularyController', VocabularyController);

    /* @ngInject */
    function VocabularyController($stateParams, Config, TitleService, AuthorityService) {
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
