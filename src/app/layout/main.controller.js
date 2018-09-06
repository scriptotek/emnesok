(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('MainController', MainController);

    /* @ngInject */
    function MainController($stateParams) {
        /*jshint validthis: true */
        var vm = this;

        vm.lang = $stateParams.lang;
    }

})();
