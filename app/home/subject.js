(function() {
    'use strict';

	angular
		.module('app.modules.subject', ['app.services.config', 'app.services.lang', 'app.services.subject'])
		.directive('modSubject', SubjectModule);

	function SubjectModule() {

		var directive = {
	        restrict: 'A',
	        templateUrl: './templates/subject.html?' + Math.random(),
	        replace: false,
	        scope: {},
	        controllerAs: 'vm',
	        controller: ['$stateParams', '$filter', 'Config', 'Lang', 'SubjectService', controller]
	    };

    	return directive;
    }

	function controller($stateParams, $filter, Config, Lang, SubjectService) {
		/*jshint validthis: true */
		var vm = this;
		vm.subject = null;
		vm.error = null;

		console.log('[Subject] Init');

		activate();

		////////////

		function getSubject(vocab, subject_id) {
			var lang = Lang.language;

			SubjectService.get(vocab, subject_id).then(function(subject) {
				var displayLang = lang;
				var defaultLang = Lang.defaultLanguage;
				var translations = [];

				console.log('[Subject] Hooray, got a subject:');
				console.log(subject);

				if (!subject.prefLabel[lang]) {
					displayLang = defaultLang;
				}
				Object.keys(subject.prefLabel).forEach(function(langCode) {
					if (langCode !== displayLang) {
						translations.push({
							language: {code: langCode, name: Config.languageLabels[langCode]},
							prefLabel: subject.prefLabel[langCode],
							altLabel: subject.altLabel[langCode]
						});
					}
				});

				vm.subject = {
					prefLabel: subject.prefLabel[displayLang],
					altLabel: subject.altLabel[displayLang],
					definition: subject.definition[displayLang] || subject.definition[defaultLang],
					related: subject.related.map(function(k) {
						return {
							prefLabel: k.prefLabel[displayLang] || k.prefLabel[defaultLang]
						};
					}),
					translations: translations
				};
			}, function (error) {
				console.log('Uh oh');
				vm.error = 'Oh noes!';
			});
		}

		function activate() {
			if ($stateParams.subjects) {
				var subjectParts = $stateParams.subjects.split(':');
				if (subjectParts.length == 2) {
					getSubject(subjectParts[0], subjectParts[1]);
				}
			}
			// @TODO: Subject should probably be given to the directive as an argument
		}
	}

})();