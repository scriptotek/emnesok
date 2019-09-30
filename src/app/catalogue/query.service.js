import { get } from 'lodash/object';

export const queryBuilderServiceName = 'QueryBuilder';

export const queryBuilderService = /* @ngInject */ function(
    Config
) {
    /**
     * Constructor, with class name
     */
    function QueryBuilder(data, broadSearch, lang) {
        data = data || {};
        this.broadSearch = broadSearch;
        this.lang = lang;
        this.q = get(data, 'q', []);
        this.qInclude = get(data, 'qInclude', []);
        this.multiFacets = get(data, 'multifacets', []);
    }

    QueryBuilder.prototype.whereSubject = function(subject) {
        let vocab = Config.vocabularies[subject.vocab];

        let indices = {
            'Topic': this.broadSearch ? 'sub' : vocab.primo_index,
            'Geographic': 'lsr17',  // 'facet_local17',
            'GenreForm': 'lsr46',
        };

        // If vocabulary is a classification scheme, search using the notation, not the class heading
        if (subject.notation && vocab.notationSearch !== false) {
            return this.where(indices['Topic'], 'exact', subject.notation);
        }

        let parts = {
            'Geographic': [],
            'GenreForm': [],
            'Topic': [],
        };

        // If subject is a subject string, we need to first pop off the
        // non-topic parts.
        if (subject._components.length) {
            subject._components.forEach(c => {
                if (parts[c.type] === undefined) {
                    console.error('Unknown type: ' + c.type);
                    return;
                }
                parts[c.type].push(c);
            });
            
            // Join the topic parts together if we're using narrow search
            if (!this.broadSearch) {
                parts['Topic'].sort((a, b) => {
                    var alab = a.prefLabel[this.lang], blab = b.prefLabel[this.lang],
                        tlab = subject.prefLabel[this.lang].split(' : ');
                    return tlab.indexOf(alab) - tlab.indexOf(blab);
                });

                parts['Topic'] = [{prefLabel:{
                    [this.lang]: parts['Topic']
                        .map(item => get(item.prefLabel, this.lang))
                        .join(' : ')
                }}];
            }

            Object.keys(parts).forEach(key => {
                if (parts[key].length) {
                    console.log('PK', parts[key]);
                    let terms = parts[key].map(
                        subject => this.broadSearch ? this.getTerms(subject).join(' OR ') : subject.prefLabel[this.lang]
                    ).join(' AND ');
                    this.where(indices[key], 'contains', terms);
                }
            });

        // Type is normal concept
        } else {
            let term = this.broadSearch ? this.getTerms(subject, true).join(' OR ') : subject.prefLabel[this.lang];
            this.where(indices[subject.type], 'contains', term);
        }

        return this; // for chaining
    };

    QueryBuilder.prototype.where = function(key, op, value) {
        if (value === undefined || value === null) {
            return this;
        }
        this.q.push([key, op, value, 'AND']);

        return this; // for chaining
    };

    QueryBuilder.prototype.orWhere = function(key, op, value) {
        if (value === undefined || value === null) {
            return this;
        }
        if (this.q.length) {
            // Yes, this is weird, but the Primo API...
            this.q[this.q.length - 1][3] = 'OR';
        }
        this.q.push([key, op, value]);

        return this; // for chaining
    };

    QueryBuilder.prototype.getTerms = function (item, includeEnglish) {
        var labels = [item.prefLabel[this.lang]];
        if (includeEnglish && item.prefLabel.en !== undefined && item.prefLabel.en !== item.prefLabel[this.lang]) {
            labels.push(item.prefLabel.en);
        }
        return labels;
    };

    QueryBuilder.prototype.build = function() {
        return {
            q: this.q.map(x => x.join(',')).join(';') || null,
            qInclude: this.qInclude.map(x => x.join(',')) || null,
            multiFacets: this.multiFacets.map(x => x.join(',')) || null,
        };
    };

    /**
     * Return the constructor function
     */
    return QueryBuilder;
};
