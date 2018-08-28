(function() {
    'use strict';

    angular
		.module('app.modules.home', [])
		.controller('HomeController', controller)
		;

    controller.$inject = ['$stateParams'];

    function controller($stateParams) {
		/*jshint validthis: true */
        var vm = this;

        vm.lang = $stateParams.lang;
    }

})();
