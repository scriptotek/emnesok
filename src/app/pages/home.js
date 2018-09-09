import template from './home.html';

export const homeComponentName = 'appHome';

export const homeComponent = {
    template,
    controller: HomeController,
    controllerAs: 'vm',
};

/* @ngInject */
function HomeController(langService) {
    this.lang = langService.language;
}
