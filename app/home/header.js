angular.module('app.modules.header', ['app.services.lang', 'app.services.config'])
.directive('modHeader', ['$state', '$stateParams', 'Lang', 'Config',
function HeaderModule($state, $stateParams, Lang, Config) {

	console.log('[Header] Init');

	function controller() {
		var vm = this;

		vm.langNames = Config.languageLabels;
		vm.lang = Lang.language;
		vm.languages = Lang.languages;
		vm.vocab = $stateParams.vocab ? Config.vocabularies[$stateParams.vocab] : null;

		vm.setLanguage = function(code) {
			Lang.setLanguage(code);
		};
	}

	return {
        restrict: 'A',
        templateUrl: './templates/header.html?' + Math.random(),
        replace: true,
        scope: {},
        controllerAs: 'vm',
        controller: controller
    };
}]);