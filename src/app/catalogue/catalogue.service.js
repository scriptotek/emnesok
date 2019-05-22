import { get, mapValues } from 'lodash/object';
import { keyBy } from 'lodash/collection';

export const catalogueServiceName = 'Catalogue';

export const catalogueService = /* @ngInject */ function CatalogueService(
    $http,
    Config,
    PnxRecord,
    langService,
    QueryBuilder
) {
    var service = {
        search: search,
        expandGroup: expandGroup
    };

    return service;

    ////////////

    function search(query, offset, institution, library, broadSearch) {
        var params = {
            expand_groups: true,  // in order to filter we need this, since it's random which edition we get data for in frbr groups
            repr: 'full',
            sort: 'date',
            q: query.q,
            qInclude: query.qInclude,
        };

        if (offset) {
            params.offset = offset;
        }
        if (institution) {
            let institutionObj = Config.institutions[institution];
            params.inst = institutionObj.inst;   // Do we need this?
            params.scope = institutionObj.scope;   // or this?
            if (institutionObj.facet) {
                params.qInclude.push(institutionObj.facet);
            }
        }
        if (library) {
            params.qInclude.push(`facet_library,exact,${library}`);
        }

        return $http({
            method: 'GET',
            cache: true,
            url: Config.catalogue.searchUrl,
            params: params,
        }).then(response => processResponse(response.data, institution, params, broadSearch));
    }
    
    function expandGroup(id, institution, lang) {
        let query = (new QueryBuilder({}, false, lang))
            .where('facet_frbrgroupid', 'exact', id);

        var params = {
            repr: 'full',
            sort: 'date',
            q: query.q,
            qInclude: query.qInclude,
        };
        if (institution) {
            params.institution = institution;
            params.scope = institution;
        }

        return $http({
            method: 'GET',
            cache: true,
            url: Config.catalogue.searchUrl,
            params: query,
        }).then(response => processResponse(response.data, institution));
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function processResponse(data, selectedInstitution) {
        return {
            total_results: data.info.total - 0,
            first: data.info.first - 0,
            last: data.info.last - 0,
            records: processDocs(data.docs, selectedInstitution),
        };
    }
    function processDocs(records, selectedInstitution, queryParams, broadSearch) {
        records = records.map(doc => new PnxRecord(doc.pnx));

        records.forEach(rec => rec.simplifyAvailability(selectedInstitution));

        // ------------
        // TODO:
        // ------------

        // function matchingRecord(rec) {
        //     var firstTerm;
        //     if (broadSearch) {
        //         return true;
        //     }
        //     if (queryParams && queryParams.vocabulary && queryParams.subject) {
        //         firstTerm = queryParams.subject.split(' OR ').shift();
        //         if (rec.subjects[queryParams.vocabulary].indexOf(firstTerm) == -1) { return false; }
        //     }
        //     if (queryParams && queryParams.place) {
        //         firstTerm = queryParams.place.split(' OR ').shift();
        //         if (rec.subjects.place.indexOf(firstTerm) == -1) { return false; }
        //     }
        //     if (queryParams && queryParams.genre) {
        //         firstTerm = queryParams.genre.split(' OR ').shift();
        //         if (rec.subjects.genre.indexOf(firstTerm) == -1) { return false; }
        //     }
        //     return true;
        // }

        // // Since Oria doesn't support exact search, we must post-filter
        // records = records.filter(function(rec) {
        //     if (rec.type == 'group') {
        //         var matching = rec.records.map(matchingRecord);
        //         if (matching.indexOf(true) != -1) { return true; }
        //     } else if (matchingRecord(rec)) {
        //         return true;
        //     }
        //     return false;
        // });

        return records;
    }

};
