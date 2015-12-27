(function() {
	'use strict';

	angular
		.module('app.modules.header', ['app.services.lang', 'app.services.config'])
		.directive('modHeader', HeaderModule);

	function HeaderModule() {
		console.log('[Header] Init');

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
		vm.languages = Lang.languages;
		vm.navCollapsed = true;
		vm.vocab = $stateParams.vocab ? Config.vocabularies[$stateParams.vocab] : null;

		vm.helloHidden = sessionStorage.getItem('hideHello');

		vm.setLanguage = function(code) {
			Lang.setLanguage(code);
		};

		vm.hideHello = function() {
			sessionStorage.setItem('hideHello', true);
			vm.helloHidden = true;
		};
	}

})();