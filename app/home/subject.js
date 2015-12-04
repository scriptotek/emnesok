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
	        scope: {subject: '=', expanded: '='},
	        controllerAs: 'vm',
	        controller: ['$scope', '$stateParams', '$filter', 'Config', 'Lang', 'SubjectService', controller]
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

	function controller($scope, $stateParams, $filter, Config, Lang, SubjectService) {
		/*jshint validthis: true */
		var vm = this;
		var subject = $scope.subject;
		
		vm.selectSubject = selectSubject;
		vm.removeFromSearchHistory = removeFromSearchHistory;
		vm.error = null;
		vm.expanded = $scope.expanded;

		console.log('[Subject] Init');


		activate();

		////////////

		//console.log(JsonldRest);

		function removeFromSearchHistory() {

			console.log("removeFromSearchHistory",this.subject);

		}

		function selectSubject(){
			//¤¤
			/*
			$rootScope.$broadcast('SubjectReady', {
				uri: uri,
				vocab: vocab,
				id: id,
				data: subject
			});
			*/

			console.log(subject);
		}

		function activate() {

			var lang = Lang.language;
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
				type: subject.type,
				related: subject.related.map(function(k) {
					return {
						prefLabel: k.prefLabel[displayLang] || k.prefLabel[defaultLang]
					};
				}),
				translations: translations,
			};

			vm.subject.hasContent = setContentBool(vm.subject);

		}
	}

})();