(function() {
	'use strict';

	angular
		.module('app.modules.about', [])
		.controller('AboutController', controller)
		;

	controller.$inject = ['$stateParams'];

	function controller($stateParams) {
		/*jshint validthis: true */
		var vm = this;

		vm.lang = $stateParams.lang;
	}

})();