import { get, mapValues } from 'lodash/object';
import { keyBy } from 'lodash/collection';

export const pnxRecordServiceName = 'PnxRecord';

export const pnxRecordService = /* @ngInject */ function(
    gettext,
    gettextCatalog,
    Institutions
) {

    /**
     * Constructor, with class name
     */
    function PnxRecord(data) {

        let vid = 'UBO'; // @TODO: Get this from Config and selected inst

        this.id = get(data, 'control.recordid.0');
        this.source = get(data, 'control.sourcesystem.0');
        this.number_of_editions = parseInt(get(data, 'display.version', 1));
        this.type = (get(data, 'facets.frbrtype') != '6' && this.number_of_editions != 1) ? 'group' : 'record';
        this.links = {
            primo: `https://bibsys-almaprimo.hosted.exlibrisgroup.com/primo-explore/fulldisplay?vid=${vid}&docid=${this.id}`,
        };
        // this.is_group = this.type == 'group';

        this.title = get(data, 'display.title.0');
        this.publisher = get(data, 'display.publisher.0');
        this.edition = get(data, 'display.edition.0');
        this.date = get(data, 'display.creationdate.0');

        this.creators = get(data, 'display.creator', []);
        this.creator_string = get(data, 'sort.author.0');
        this.material = get(data, 'facets.rsrctype', []);

        //     Object.keys(record.subjects).forEach(function(k) {
        //         record.subjects[k] = record.subjects[k].filter(onlyUnique);
        //     });

        this.places = get(data, 'facets.lfc17');
        this.subjects = {
            realfagstermer: extractSubjects(data, 'NOUBOMN', this.places),
            mrtermer: extractSubjects(data, 'NOUBOMR', this.places),
            humord: extractSubjects(data, 'HUMORD', this.places),
            tekord: extractSubjects(data, 'TEKORD', this.places),
            mesh: extractSubjects(data, 'MESH', this.places),

            ddc: get(data, 'facets.lfc10'),
            // osv.
        };

        if (this.source == 'Alma') {

            this.alma_id = get(data, 'addata.lad11', [])
                .map(x => x.match('^(.+)_([^_]+)$'))
                .map(x => ({key: x[1], val: x[2] }));
            this.alma_id = mapValues(keyBy(this.alma_id, 'key'), 'val');

            // this.alma_id = get(this.alma_id, '47BIBSYS_NETWORK')

            this.holdings = get(data, 'display.availlibrary', []).map(item => {
                let field = proccessField(item);

                // https://knowledge.exlibrisgroup.com/Primo/Product_Documentation/Interoperability_Guide/030Harvesting_Availability_Information_from_ILS_Systems/010Availability_Information_in_the_PNX
                return {
                    institution: get(field, 'I'),
                    library: get(field, 'L'),
                    location: get(field, '1'),
                    callcode: get(field, '2'),
                    available: (get(field, 'S') == 'available'),  // available, unavailable, or check_holdings
                    alma_instance: get(field, 'X'),
                    alma_library: get(field, 'Y'),
                    // priority: get(field, 'P'),
                };
            });
        }

        this.urls = get(data, 'links.linktorsrc', [])
            .map(x => proccessField(x, {
                'U': 'url',
                'E': 'description',
            }));

        this.pubEdYear = this.formatPubEdYearString();
    }

    function proccessField(line, keyMap) {
        let out = {};
        line = line.split('$$');
        line.forEach(part => {
            if (part.length > 0) {
                let key = get(keyMap, part[0], part[0]);
                if (key !== null) out[key] = part.substr(1);    
            }
        });
        return out;
    }

    function extractSubjects(data, vocabulary, blacklist) {
        if (!blacklist) blacklist = [];
        return get(data, 'browse.subject', [])
            .map(x => proccessField(x, {
                'D': 'term',
                'E': null,
                'T': 'vocabulary',
                'I': 'identifier',
                'P': 'preferred',
            }))
            .filter(x => x.vocabulary == vocabulary)
            .filter(x => x.preferred == 'Y')
            .filter(x => blacklist.indexOf(x.term) === -1)  // Very primitive way to filter out placenames. Might catch too much.
            .map(x => x.term);  // FOR NOW... Would be better to return object, so we can use IDs later on.
    }

    PnxRecord.prototype.formatPubEdYearString = function() {
        var tmp = '';
        var ed = (this.edition && this.type == 'record') ? this.edition : '';
        if (this.publisher) {
            tmp += this.publisher;
            if (ed) {
                tmp += ', ';
            }
        }
        tmp += ed;
        if (this.date) {
            if (tmp.length) {
                tmp += ' ';
            }
            tmp += this.date;
        }
        
        // Remove square brackets
        tmp = tmp.replace(/[\[\]]/g, '');

        return tmp;
    };


    // -----------
    // TODO
    // ------------
    PnxRecord.prototype.simplifyAvailability = function(selectedInstitution) {
        // @TODO: Show libraries if selectedInstitution

        this.availability = {};

        if (this.type == 'group') {
            return;
        }

        var myInstitution = selectedInstitution || 'UBO';  // @TODO: Default based on IP address

        // Print availability
        var printInstitutions = [];
        if (this.holdings) {
            this.holdings.forEach(function(holding) {
                var library = holding.library.replace(/[0-9]+/, '');
                // console.log(holding.library);
                if (printInstitutions.indexOf(library) === -1 && library) {
                    printInstitutions.push(library);
                }
            });
            this.holdings = null;
        }

        if (printInstitutions.length > 0) {
            var printInstitutionsStr = '';
            if (printInstitutions.indexOf(myInstitution) != -1) {
                if (printInstitutions.length > 1) {
                    // MyLibrary and n other libraries
                    printInstitutionsStr = gettextCatalog.getPlural(printInstitutions.length - 1,
                        'Print copy at {{library}} and one other library.',
                        'Print copy at {{library}} and {{$count}} other libraries.',
                        {library: Institutions.getName(myInstitution)}
                    );
                } else {
                    // MyLibrary
                    printInstitutionsStr = gettextCatalog.getString('Print copy at {{library}}.', {
                        library: Institutions.getName(myInstitution)
                    });
                }
            } else if (printInstitutions.length == 1) {
                // Lib1
                printInstitutionsStr = gettextCatalog.getString('Print copy at {{library}}.', {
                    library: Institutions.getName(printInstitutions[0])
                });
            } else if (printInstitutions.length <= 4) {
                // Lib1, Lib2, Lib3 and lib 4
                var last = printInstitutions.pop();
                printInstitutionsStr = gettextCatalog.getString('Print copy at {{institutions}} and {{lastInstitution}}.', {
                    institutions: printInstitutions.map(function(k) { return Institutions.getName(k); }).join(', '),
                    lastInstitution: Institutions.getName(last)
                });
            } else {
                // Lib1, Lib2, Lib3 and n. more libraries (where n >= 2)
                printInstitutionsStr = gettextCatalog.getString('Print copy at {{institutions}} and {{count}} more libraries.', {
                    institutions: printInstitutions.slice(0, 4).map(function(k) { return Institutions.getName(k); }).join(', '),
                    count: printInstitutions.length - 3
                });
            }
            this.availability.print = printInstitutionsStr;
        }

        // Electronic availability
        if (this.urls.length > 0) {
            gettext('E-book');
            this.availability.electronic = {
                url: this.urls[0].url,
                description: gettextCatalog.getString(this.urls[0].description)
            };
        }

        console.log(this);
    };

    /**
     * Return the constructor function
     */
    return PnxRecord;
};
