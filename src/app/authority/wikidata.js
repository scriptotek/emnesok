import template from './wikidata.html';

export const wikidataComponentName = 'appWikidata';

export const wikidataComponent = {
    template,
    controller: wikidataController,
    controllerAs: 'vm',
    bindings: {
        'mapping': '<',
        'subject': '<',
    },
};

/////

/* @ngInject */
function wikidataController(wikidataService, langService) {

    this.data = {};

    this.$onChanges = () => {
        if (this.mapping) {
            let item = this.mapping.to.uri.split('/').pop();
            wikidataService.fromEntityId(item).then(data => {
                this.data = data;
                this.verified = true;
            });
        } else {
            let label = this.subject.getPrefLabel();
            wikidataService.fromSearch(langService.language, label).then(data => {
                this.data = data;
                this.verified = false;
            });
        }
    };
}
