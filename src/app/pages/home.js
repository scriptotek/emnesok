(function() {
    'use strict';

    angular
        .module('app.pages')
        .component('appHome', {
            templateUrl: 'app/pages/home.html',
            controller: HomeController,
            controllerAs: 'vm',
        });

    /* @ngInject */
    function HomeController(langService) {
        this.lang = langService.language;
    }

})();
