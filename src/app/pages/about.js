(function() {
    'use strict';

    angular
		.module('app.pages')
        .component('appAbout', {
            templateUrl: 'app/pages/about.html',
            controller: AboutController,
            controllerAs: 'vm',
        });

    /* @ngInject */
    function AboutController(langService) {
        this.lang = langService.language;
    }

})();
