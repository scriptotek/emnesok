(function() {
	'use strict';

	angular
		.module('app.modules.error', [])
		.controller('ErrorController', ['$state', '$stateParams', controller])
		;

	function controller($state, $stateParams) {
		/*jshint validthis: true */
		var vm = this;

		if ($state.get('error').error) {
			vm.message = $state.get('error').error.message;
		} else {
			vm.message = 'An unknown error occured';
		}

	}

})();