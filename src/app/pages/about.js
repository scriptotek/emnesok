import template from './about.html';

export const aboutComponentName = 'appAbout';

export const aboutComponent = {
    template,
    controller: AboutController,
    controllerAs: 'vm',
};

/* @ngInject */
function AboutController(langService) {
    this.lang = langService.language;
}
