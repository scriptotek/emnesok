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

        // @TODO: Default based on IP address instead
        var selectedInstitution = Config.institutions['UBO'],
            params = {
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
            selectedInstitution = Config.institutions[institution];
            params.inst = selectedInstitution.inst;   // Do we need this?
            params.scope = selectedInstitution.scope;   // or this?
            params.qInclude.push(`facet_local4,exact,${selectedInstitution.id}`);
        }
        if (library) {
            params.qInclude.push(`facet_library,exact,${library}`);
        }

        return $http({
            method: 'GET',
            cache: true,
            url: Config.catalogue.searchUrl,
            params: params,
        }).then(response => processResponse(response.data, selectedInstitution, params, broadSearch));
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

    function processResponse(data, selectedInstitution, params, broadSearch) {
        return {
            total_results: data.info.total - 0,
            first: data.info.first - 0,
            last: data.info.last - 0,
            records: processDocs(data.docs, selectedInstitution, params, broadSearch),
        };
    }
    function processDocs(records, selectedInstitution, queryParams, broadSearch) {
        records = records.map(doc => new PnxRecord(doc.pnx, selectedInstitution));

        records.forEach(rec => rec.simplifyAvailability());

        // Since Oria doesn't support exact search, we must post-filter
        if (!broadSearch) {
            records = records.filter(
                rec => rec.matchesQuery(queryParams, Config.vocabularies)
            );
        }

        return records;
    }

};
