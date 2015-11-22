angular.module('app.modules.catalogue', [])
.directive('appCatalogue', ['$http', '$stateParams','$rootScope',
function CatalogueController($http, $stateParams, $rootScope) {

	console.log('[Catalogue] Init');

	function controller() {
		// @TODO
	}

	return {
        restrict: 'A',
        templateUrl: './templates/catalogue.html?' + Math.random(),
        replace: true,
        scope: {},
        controllerAs: 'vm',
        controller: controller
    };
}]);
