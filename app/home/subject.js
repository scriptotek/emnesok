(function() {
	'use strict';

	angular
		.module('app.modules.subject', ['app.services.config', 'app.services.lang', 'app.services.subject'])
		.directive('modSubject', SubjectModule);

	function SubjectModule() {

		var directive = {
			restrict: 'E',
			templateUrl: './templates/subject.html?' + Math.random(),
			replace: true,
			scope: {
				subjectData: '='
			},
			controllerAs: 'vm',
			controller: controller,
			bindToController: true
		};

		return directive;
	}

	//Checks if subject contains anything else than prefLabel
	function setContentBool(subject) {

		console.log("altlabel",subject.altLabel);
		console.log("definition",subject.definition);
		console.log("related",subject.related);
		console.log("translations",subject.translations);

		if (subject.altLabel) return true;
		if (subject.definition) return true;
		if (subject.related.length) return true;
		if (subject.translations.length) return true;

		return false;

	}

	controller.$inject = ['$scope', 'Config', 'Lang'];

	function controller($scope, Config, Lang) {
		/*jshint validthis: true */
		var vm = this;
		vm.error = null;
		//vm.expanded = $scope.expanded;

		activate();

		////////////

		function activate() {
			$scope.$watch('vm.subjectData', function(newValue, oldValue) {
				if (newValue != oldValue) {
					update();
				}
			});
			update();
		}

		function update () {
			// console.log('[Subject] update():', vm.subjectData.data.prefLabel.nb);
			vm.subject = process(vm.subjectData);
			//vm.subject.hasContent = setContentBool(vm.subjectData);
		}

		function process(subject) {
			var lang = Lang.language;
			var displayLang = lang;
			var defaultLang = Lang.defaultLanguage;
			var translations = [];

			if (!subject.data.prefLabel[lang]) {
				displayLang = defaultLang;
			}
			Object.keys(subject.data.prefLabel).forEach(function(langCode) {
				if (langCode !== displayLang) {
					translations.push({
						language: {code: langCode, name: Config.languageLabels[langCode]},
						prefLabel: subject.data.prefLabel[langCode],
						altLabel: subject.data.altLabel[langCode]
					});
				}
			});

			return {
				prefLabel: subject.data.prefLabel[displayLang],
				altLabel: subject.data.altLabel[displayLang],
				definition: subject.data.definition[displayLang] || subject.data.definition[defaultLang],
				related: subject.data.related.map(function(k) {
					return {
						prefLabel: k.prefLabel[displayLang] || k.prefLabel[defaultLang]
					};
				}),
				translations: translations,
			};
		}
	}

})();