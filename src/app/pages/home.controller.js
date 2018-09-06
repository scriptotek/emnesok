(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('HomeController', HomeController);

    /* @ngInject */
    function HomeController($stateParams) {
        /*jshint validthis: true */
        var vm = this;

        vm.lang = $stateParams.lang;
    }

})();
