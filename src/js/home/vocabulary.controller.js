(function() {
	'use strict';

	angular
		.module('app.modules.vocabulary', [])
		.controller('VocabularyController', controller);

	controller.$inject = ['$stateParams', 'Config', 'TitleService', 'vocabulary'];

	function controller($stateParams, Config, TitleService, vocabulary) {
		/*jshint validthis: true */

		var vm = this;
		var vocabName = Config.vocabularies[$stateParams.vocab].name;
		TitleService.set(vocabName);

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

	}

})();