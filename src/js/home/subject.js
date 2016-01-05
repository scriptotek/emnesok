(function() {
	'use strict';

	angular
		.module('app.modules.subject', ['app.services.config', 'app.services.lang', 'app.services.subject','app.services.externals'])
		.directive('modSubject', SubjectModule);

	function SubjectModule() {

		var directive = {
			restrict: 'E',
			templateUrl: 'app/subject.html',
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

	controller.$inject = ['$scope', 'Config', 'Lang', 'Externals'];

	function controller($scope, Config, Lang, Externals) {
		/*jshint validthis: true */
		var vm = this;
		vm.error = null;
		vm.subject = null;

		//vm.expanded = $scope.expanded;

		activate();

		////////////

		function activate() {
			$scope.$watch('vm.subjectData', function(newValue, oldValue) {
				if (newValue != oldValue) {
					update();
				}
			});
			if (vm.subjectData) {
				update();
			}
		}

		function update () {
			// console.log('[Subject] update():', vm.subjectData.data.prefLabel.nb);
			vm.subject = process(vm.subjectData);
			vm.subject.vocab = vm.subjectData.vocab;
		}

		function process(subject) {

			var lang = Lang.language;
			var displayLang = lang;
			var defaultLang = Lang.defaultLanguage;
			var translations = [];
			var externals = [];
			var output = {};
	

			Externals.snl(subject.data.prefLabel[displayLang]).then(function(data) {
				externals.push(data);
				output.externals = externals;
			});

			Externals.wp(subject.data.prefLabel[displayLang],displayLang).then(function(data) {
				externals.push(data);
				output.externals = externals;	
			});


			if (!subject.data.prefLabel[lang]) {
				displayLang = defaultLang;
			}

			if (subject.data.elementSymbol){

				Externals.ps(subject.data.elementSymbol).then(function(data) {
					externals.push(data);
					output.externals = externals;	
				});


				if (subject.data.prefLabel[displayLang].substr(-12)=="(grunnstoff)") {
					subject.data.prefLabel[displayLang]=subject.data.prefLabel[displayLang].slice(0, -12);
				}

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

			function transformRelatedSubject(k) {
				return {
					prefLabel: k.prefLabel[displayLang] || k.prefLabel[defaultLang],
					id: k.id
				};
			}

			output = {
				prefLabel: subject.data.prefLabel[displayLang],
				altLabel: subject.data.altLabel[displayLang],
				definition: subject.data.definition[displayLang] || subject.data.definition[defaultLang],
				related: subject.data.related.map(transformRelatedSubject),
				broader: subject.data.broader.map(transformRelatedSubject),
				narrower: subject.data.narrower.map(transformRelatedSubject),
				translations: translations,
				elementSymbol: subject.data.elementSymbol,
				uri: subject.uri,
			};
			console.log(output);
			return output;
		}
	}

})();