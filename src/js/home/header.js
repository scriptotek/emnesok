(function() {
	'use strict';

	angular
		.module('app.modules.header', ['app.services.lang', 'app.services.config'])
		.directive('modHeader', HeaderModule);

	function HeaderModule() {

		var directive = {
	        restrict: 'A',
	        templateUrl: 'app/header.html',
	        replace: false,
	        scope: {},
	        controllerAs: 'vm',
	        controller: ['$state', '$stateParams', 'Lang', 'Config', controller]
	    };

	    return directive;
	}

	function controller($state, $stateParams, Lang, Config) {
		/*jshint validthis: true */
		var vm = this;

		vm.languageLabels = Config.languageLabels;
		vm.lang = Lang.language;
		vm.langState = $stateParams.lang;
		vm.languages = Lang.languages;
		vm.navCollapsed = true;
		vm.vocab = $stateParams.vocab ? Config.vocabularies[$stateParams.vocab] : null;

		vm.helloHidden = localStorage.getItem('hideHello1');

		vm.setLanguage = function(code) {
			Lang.setLanguage(code);
		};

		vm.hideHello = function() {
			localStorage.setItem('hideHello1', true);
			vm.helloHidden = true;
		};
	}

})();
