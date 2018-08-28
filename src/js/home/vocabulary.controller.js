(function() {
    'use strict';

    angular
		.module('app.modules.vocabulary', [])
		.controller('VocabularyController', controller);

    controller.$inject = ['$stateParams', 'Config', 'TitleService', 'SubjectService'];

    function controller($stateParams, Config, TitleService, SubjectService) {
		/*jshint validthis: true */
        var vm = this;
        var vocabName = Config.vocabularies[$stateParams.vocab].name;
        TitleService.set(vocabName);

        SubjectService.getVocabulary($stateParams.vocab).then(function(vocabulary) {
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
