import { get, mapValues } from 'lodash/object';
import { keyBy } from 'lodash/collection';

export const pnxRecordServiceName = 'PnxRecord';

export const pnxRecordService = /* @ngInject */ function(
    gettext,
    gettextCatalog,
    Institutions
) {

    function Subject(data) {
        this.id = get(data, 'id');
        this.term = get(data, 'term').trim().replace(/ -- /g, ' : ');
        this.vocabulary = get(data, 'vocabulary');
        this.type = 'topic';
    }

    /**
     * Constructor, with class name
     */
    function PnxRecord(data, institution) {

        this.currentInstitution = institution;
        let vid = institution.vid || institution.id;

        this.id = get(data, 'control.recordid.0');
        this.group_id = get(data, 'facets.frbrgroupid.0');
        this.source = get(data, 'control.sourcesystem.0');
        this.number_of_editions = parseInt(get(data, 'display.version', 1));
        this.type = (get(data, 'facets.frbrtype') != '6' && this.number_of_editions != 1) ? 'group' : 'record';
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

        this.places = get(data, 'facets.lfc17', []);
        this.genres = get(data, 'facets.genre', []);

        this.subjects = {
            realfagstermer: extractSubjects(data, 'NOUBOMN', this.places, this.genres),
            mrtermer: extractSubjects(data, 'NOUBOMR', this.places, this.genres),
            humord: extractSubjects(data, 'HUMORD', this.places, this.genres),
            tekord: extractSubjects(data, 'TEKORD', this.places, this.genres),
            mesh: extractSubjects(data, 'MESH', this.places, this.genres),

            ddc: get(data, 'facets.lfc10', []).map(x => new Subject({term: x, vocabulary: 'ddc'})),
            ubo: get(data, 'facets.lfc18', []).map(x => new Subject({
                term: x.split('$$')[0],
                vocabulary: 'ubo',
            })),

            // genre: ?
            // place: ?
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

        let delivery = {};
        get(data, 'delivery.delcategory', []).forEach(delcategory => {
            let [category, institution] = delcategory.split('$$I');
            if (!delivery.hasOwnProperty(category)) {
                delivery[category] = [];
            }
            delivery[category].push(institution);
        });
        this.delivery = delivery;

        this.urls = get(data, 'links.linktorsrc', [])
            .map(x => proccessField(x, {
                'U': 'url',
                'E': 'description',
            }));
        this.urls = this.urls.map(x => {
            if (x.description == 'linktorsrc') x.description = 'Fulltext';
            return x;
        });
        
        this.pubEdYear = this.formatPubEdYearString();

        this.thumbnails = keyBy(get(data, 'links.thumbnail', []).map(x => proccessField(x, {
            'T': 'service',
            '1': 'param',
        })), 'service');

        if ('BIBSYS_thumb' in this.thumbnails) {
            this.thumbnail = `https://innhold.bibsys.no/bilde/forside/?size=mini&id${this.thumbnails.BIBSYS_thumb.param}`;
        } else {
            this.thumbnail = 'https://ub-lsm.uio.no/primo/records/' + encodeURIComponent(this.id) + '/cover';
        }

        // Add links
        this.links = {};
        if (this.type == 'group') {
            this.links.primo = `https://bibsys-almaprimo.hosted.exlibrisgroup.com/primo-explore/search?vid=${vid}&query=any,contains,${encodeURIComponent(this.title)}&facet=frbrgroupid,include,${this.group_id}`;
            // https://bibsys-almaprimo.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains,whatever&vid=UIO&facet=frbrgroupid,include,209044763
        } else {
            this.links.primo = `https://bibsys-almaprimo.hosted.exlibrisgroup.com/primo-explore/fulldisplay?vid=${vid}&docid=${this.id}`;
        }


        console.log(this);
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

    function extractSubjects(data, vocabulary, places, genres) {
        return get(data, 'browse.subject', [])
            .map(x => proccessField(x, {
                'D': 'term',
                'E': null,
                'T': 'vocabulary',
                'I': 'identifier',
                'P': 'preferred',
            }))
            .filter(x => x.vocabulary && x.vocabulary.toLowerCase() == vocabulary.toLowerCase())
            .filter(x => x.preferred != 'N')  // For Tekord mangler den helt
            .map(x => new Subject(x))
            .map(x => {
                if (places.indexOf(x.term) !== -1) x.type = 'geographic';
                if (genres.indexOf(x.term) !== -1) x.type = 'genre';

                return x;
            });
    }

    PnxRecord.prototype.matchesQuery = function(params, vocabularies) {
        var matches = 0;
        for (let q of params.q.split(';')) {
            // Note: We adopt a relaxed matching for subject strings. A search for "Fisker : Atferd"
            // will also match books having "Fisker" AND "Atferd" as separate terms. The reason
            // is that many catalogue records have not been updated correctly, in the example case
            // of "Fiske : Atferd", 3 out of 4 records had the subject strings as separate
            // subject headings.
            // The complexity of the test below is awful though. I hope we can simplify it at some point.
            let [vocab, op, term, op2] = q.split(',');
            let termParts = term.split(' : ').map(x => x.trim().toLowerCase());
            let termMatches = 0;
            let termMatchesNeeded = termParts.length;
            for (let voc in this.subjects) {
                if (vocabularies.hasOwnProperty(voc) && [vocabularies[voc].primo_index, 'lsr17', 'lsr46'].indexOf(vocab) !== -1) {
                    for (let subject of this.subjects[voc]) {
                        let subParts = subject.term.split(' : ').map(x => x.trim().toLowerCase());
                        for (let subPart of subParts) {
                            for (let termPart of termParts) {
                                if (termPart == subPart) {
                                    subject.matchesQuery = true;
                                    termMatches++;
                                }
                            }
                        }
                    }
                }
            }
            if (termMatches >= termMatchesNeeded) matches++;
        }

        // We're good if we match at least one of the query terms, since the query terms
        // are connected by OR.
        return matches > 0;
    };

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

    PnxRecord.prototype.simplifyAvailability = function(selectedInstitution) {
        // @TODO: Show libraries if selectedInstitution

        this.availability = {};

        if (this.type == 'group') {
            return;
        }

        var myInstitution = this.currentInstitution.id;

        // Print availability
        var printInstitutions = [];
        if (this.holdings) {
            this.holdings.forEach(function(holding) {
                var library = holding.library ? holding.library.replace(/[0-9]+/, '') : '';
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
        if ('Alma-E' in this.delivery) {
            if (this.delivery['Alma-E'].indexOf(myInstitution) !== -1) {
                this.availability.electronic = {
                    description: 'E-book',
                    url: this.links.primo,
                };    
            }
        }
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
