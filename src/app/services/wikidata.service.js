import angular from 'angular';
import configService from './config.service';
import { get } from 'lodash/object';

const moduleName = 'app.services.wikidata';

angular
    .module(moduleName, [
        configService,
    ])
    .factory('wikidataService', WikidataFactory);

export default moduleName;

/////

class WikidataItem {

    constructor(api, data) {
        this.api = api;
        this.data = data;
    }

    getArticleExtract() {
        return new Promise((resolve, reject) => {
            for (let siteLang of ['no', 'nn', 'da', 'sv', 'en']) {
                let siteId = `${siteLang}wiki`;
                let site = get(this.data, `sitelinks.${siteId}`);
                if (site) {
                    return this.api.getArticleExtract(`${siteLang}.wikipedia.org`, site.title)
                        .then(res => resolve(res));
                }
            }
            resolve(null);
        });
    }

    getImage() {
        return new Promise((resolve, reject) => {
            let value = get(this.data, 'claims.P18.0.mainsnak.datavalue.value');
            if (!value) {
                resolve(null);
            } else {
                this.api.getImage('commons.wikimedia.org', value)
                    .then(res => resolve(res));
            }
        });
    }

    hasClaim(prop) {
        return !!get(this.data, `claims.${prop}`);
    }

    formatStatement(stmt) {
        if (stmt.mainsnak.datatype == 'string') {
            return stmt.mainsnak.datavalue.value;
        }
        if (stmt.mainsnak.datatype == 'external-id') {
            let prop = stmt.mainsnak.property;
            let value = stmt.mainsnak.datavalue.value;
            let urlPatterns = {
                'P815': 'https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=$1',
            };
            let url = urlPatterns[prop].replace('$1', value);
            return `<a href="${url}">${value}</a>`;
        }

        return '???' + stmt.mainsnak.datatype;
    }

    formatClaim(prop) {
        let stmts = get(this.data, `claims.${prop}`)
            .filter(x => x.rank == 'normal' && x.mainsnak && x.mainsnak.snaktype == 'value');

        if (!stmts.length) return '';

        return this.formatStatement(stmts[0]);
    }
}

/* @ngInject */
function WikidataFactory($http, $q) {

    // function htmlToPlaintext(text) {
    //     return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    // }

    let api = {
        fromEntityId,
        getArticleExtract,
        getImage,
        fromSearch,
    };

    return api;

    function apiCall(site, params) {
        let defaultParams = {
            format: 'json',
            origin: '*',  // Per https://www.mediawiki.org/wiki/Manual:CORS#Description
        };

        params = Object.assign(defaultParams, params);

        return $http({
            method: 'GET',
            cache: true,
            url: `https://${site}/w/api.php`,
            params: params,
        });
    }

    function fromEntityId(item) {
        let out = {};

        return getItem(item)
            .then(res => {
                out.item = res;
                return $q.all([
                    out.item.getArticleExtract().then(x => out.article = x),
                    out.item.getImage().then(x => out.image = x),
                ]);
            })
            .then(res => {
                return out;
            });
    }

    function getItem(item) {
        return apiCall('www.wikidata.org', {
            action: 'wbgetentities',
            ids: item,
            props: 'info|sitelinks|aliases|labels|descriptions|claims|datatype',
        }).then(res => {
            let data = res.data.entities[item];
            if (data) {
                return new WikidataItem(api, data);
            } else {
                return null;
            }
        });
    }

    function htmlToPlaintext(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }

    function getArticleExtract(site, title, useSearch = false) {
        // Note to future self: We could also try the page previews api:
        // https://no.wikipedia.org/api/rest_v1/page/summary/Jakarta
        // See: https://www.mediawiki.org/wiki/Page_Previews/API_Specification

        let params = {
            action: 'query',
            prop: 'extracts|info|pageprops|coordinates',
            exintro: '1',
            pprop: 'wikibase_item',
            redirects: '1',
            inprop: 'url|displaytitle',
        };

        if (useSearch) {
            params.generator = 'search';
            params.gsrsearch = title;
            params.gsrnamespace = '0';
            params.gsrlimit = '1';
        } else {
            params.titles = title;
        }

        return apiCall(site, params).then(res => {
            let pageId = Object.keys(res.data.query.pages);
            if (!pageId.length) return null;
            let page = res.data.query.pages[pageId[0]];
            if (page.missing !== undefined) return null;

            // Note: We request html rather than plaintext from the API
            // so that we can extract only text from <p> tags. This removes
            // hat notices (disambiguation etc.). But this can also be fixed
            // on Wikipedia by adding the "noexcerpt" class, see
            // https://no.wikipedia.org/w/index.php?title=Mal:Dablink&action=edit
            let paragraphs =  page.extract.match(/<p>([^]*?)<\/p>/gi);
            page.extract = htmlToPlaintext(paragraphs[0]);

            page.siteName = 'Wikipedia';

            return page;
        });
    }

    function getImage(site, title) {
        return apiCall(site, {
            action: 'query',
            titles: `File:${title}`,
            prop: 'imageinfo',
            iiprop: 'url|thumbmime',
            iiurlwidth: '150',
        }).then(res => {
            let pageId = Object.keys(res.data.query.pages);
            if (!pageId.length) return null;
            let page = res.data.query.pages[pageId[0]];
            if (page.missing !== undefined) return null;

            return page.imageinfo[0];
        });
    }

    function fromSearch(lang, title) {
        return new Promise((resolve, reject) => {
            let out = {};
            let site = {
                'nb': 'no.wikipedia.org',
                'nn': 'nn.wikipedia.org',
                'en': 'en.wikipedia.org',
            }[lang];
            if (!site) return;

            getArticleExtract(site, title, true).then(article => {
                out.article = article;
                let entityId = get(article, 'pageprops.wikibase_item');
                if (entityId) {
                    getItem(entityId).then(res => {
                        out.item = res;
                        if (res) {
                            out.item.getImage()
                                .then(x => out.image = x)
                                .then(_ => resolve(out));
                        } else {
                            resolve(out);
                        }
                    });

                } else {
                    resolve(out);
                }
            });
        });
    }

}
