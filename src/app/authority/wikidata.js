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

    this.getSearchUrl = () => {
        let term = encodeURIComponent(this.subject.getPrefLabel());
        return `https://${langService.language}.wikipedia.org/w/index.php?search=${term}`;
    };

    this.$onChanges = () => {
        if (this.mapping) {
            let item = this.mapping.to.uri.split('/').pop();
            wikidataService.fromEntityId(item, langService.language).then(data => {
                this.data = data;
                this.verified = true;
            });
        } else {
            let label = this.subject.getPrefLabel();
            wikidataService.fromTitle(langService.language, label).then(data => {
                this.data = data;
                this.verified = false;
            });
        }
    };
}
