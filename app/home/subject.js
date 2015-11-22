angular.module('app.modules.subject', ['app.services.config', 'app.services.lang', 'app.services.subject'])
.directive('modSubject', ['$stateParams', '$filter', 'Config', 'Lang', 'SubjectService',
function SubjectModule($stateParams, $filter, Config, Lang, SubjectService) {

	console.log('[Subject] Init');

	function controller() {
		var vm = this;
		vm.subject = null;
		vm.error = null;

		activate();

		////////////

		function getSubject(uri) {
			var lang = Lang.language;

			SubjectService.get(uri).then(function(subject) {
				var displayLang = lang;
				var translations = [];

				console.log('[Subject] Hooray, got a subject:');
				console.log(subject);

				if (!subject.prefLabel[lang]) {
					displayLang = Lang.defaultLanguage;
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
					related: subject.related.map(function(k) {
						return {
							prefLabel: k.prefLabel[displayLang] || k.prefLabel[Lang.defaultLanguage]
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
			var subject;
			var uri;

			if ($stateParams.subjects) {
				subject = $stateParams.subjects.split(':');
				if (subject.length == 2) {
					uri = 'http://data.ub.uio.no/' + subject[0] + '/' + subject[1];
				}
			}

			// @TODO: Subject should probably be given to the directive as an argument

			if (uri) {
				getSubject(uri);
			}
		}
	}

	return {
        restrict: 'A',
        templateUrl: './templates/subject.html?' + Math.random(),
        replace: false,
        scope: {},
        controllerAs: 'vm',
        controller: controller
    };
}]);
