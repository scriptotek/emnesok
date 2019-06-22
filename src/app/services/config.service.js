import angular from 'angular';

const moduleName = 'app.services.config';

angular
    .module(moduleName, [])
    .factory('Config', ConfigService);

export default moduleName;

/////

function ConfigService() {
    var factory = {
        languages: ['nb', 'nn', 'en'],
        languageLabels: {
            nb: 'Bokmål',
            nn: 'Nynorsk',
            en: 'English',
            la: 'Latin'
        },
        defaultLanguage: 'nb',
        institutions: {
            'UBO': {
                id: 'UBO',
                label: 'UiO',
                vid: 'UIO',  // if it differs from id
                libraries: {
                    '1030310': {label: 'Realfagsbiblioteket VB'},
                    '1030317': {label: 'Informatikkbiblioteket'},
                    '1030500': {label: 'Naturhistorisk museum'},
                    '1030300,1030303': {label: 'Humsam-biblioteket + Sophus Bugge'},
                    '1030010': {label: 'Etnografisk bibliotek'},
                    '1030011': {label: 'Arkeologisk bibliotek'},
                    '1030048': {label: 'Menneskerettighetsbiblioteket'}
                }
            },
            'UBB': {
                id: 'UBB',
                label: 'UiB',
                libraries: {
                    '1120104': {label: 'Bibliotek for realfag'},
                    '1120100': {label: 'Bibliotek for humaniora'},
                    '1120108': {label: 'Bibliotek for samfunnsvitenskap'}
                }
            },
            'NTNU_UB': {
                id: 'NTNU_UB',
                label: 'NTNU',
                libraries: {
                    '1160133': {label: 'DORA'},
                    '1160103': {label: 'Realfagbiblioteket'},
                    '1160101': {label: 'Teknologibiblioteket'}
                }
            },
            'UBTO': {
                id: 'UBTO',
                label: 'UiT',
            },
            'NMBU': {
                id: 'NMBU',
                label: 'NMBU',
            },
        },
        vocabularies: {
            findByUri: function(uri) {
                for (const [code, vocab] of Object.entries(factory.vocabularies)) {
                    if (vocab.scheme === uri) {
                        return vocab;
                    }
                }
            },
            realfagstermer: {
                name: 'Realfagstermer',
                code: 'realfagstermer',
                languages: ['nb', 'nn', 'en'],
                defaultLanguage: 'nb',
                scheme: 'http://data.ub.uio.no/realfagstermer/',
                uriPattern: 'http://data.ub.uio.no/realfagstermer/{id}',
                show_vocabs: ['realfagstermer', 'ddc', 'ubo'],
                primo_index: 'lsr20',
                concept_types: [
                    'http://data.ub.uio.no/onto#Topic',
                    'http://data.ub.uio.no/onto#Place',
                    'http://data.ub.uio.no/onto#Time',
                    'http://data.ub.uio.no/onto#GenreForm',
                    'http://data.ub.uio.no/onto#ComplexConcept',
                ],
            },
            humord: {
                name: 'Humord',
                code: 'humord',
                languages: ['nb'],
                defaultLanguage: 'nb',
                scheme: 'http://data.ub.uio.no/humord/',
                uriPattern: 'http://data.ub.uio.no/humord/{id}',
                show_vocabs: ['humord', 'ddc', 'ubo'],
                primo_index: 'lsr14',
            },
            tekord: {
                name: 'Tekord',
                code: 'tekord',
                languages: ['nb'],
                defaultLanguage: 'nb',
                scheme: 'http://data.ub.uio.no/tekord/',
                uriPattern: 'http://data.ub.uio.no/tekord/{id}',
                show_vocabs: ['tekord'],
                notationSearch: false,
                primo_index: 'lsr12',
            },
            mrtermer: {
                name: 'Human Rights Terms',
                code: 'mrtermer',
                languages: ['en'],
                defaultLanguage: 'en',
                scheme: 'http://data.ub.uio.no/mrtermer/',
                uriPattern: 'http://data.ub.uio.no/mrtermer/{id}',
                show_vocabs: ['mrtermer'],
                primo_index: 'lsr19',
            },
            ddc: {
                name: 'Norsk WebDewey',
                code: 'ddc',
                languages: ['nb'],
                defaultLanguage: 'nb',
                scheme: 'http://dewey.info/scheme/edition/e23/',
                uriPattern: 'http://dewey.info/{id}',
                showWikipedia: false,
                supportsBroadSearch: false,
                show_vocabs: ['realfagstermer', 'humord', 'ddc', 'ubo'],
                notationSearch: true,
                primo_index: 'lsr10',
            },
            'msc-ubo': {
                name: 'MSC',
                code: 'msc-ubo',
                languages: ['en', 'nb'],
                defaultLanguage: 'en',
                scheme: 'http://data.ub.uio.no/msc-ubo/',
                uriPattern: 'http://data.ub.uio.no/msc-ubo/{id}',
                showWikipedia: false,
                supportsBroadSearch: false,
                show_vocabs: ['realfagstermer', 'ubo'],
                notationSearch: true,
                primo_index: 'lsr18',
            },
            'acm-ccs-ubo': {
                name: 'ACM CCS',
                code: 'acm-ccs-ubo',
                languages: ['en'],
                defaultLanguage: 'en',
                scheme: 'http://data.ub.uio.no/acm-ccs-ubo/',
                uriPattern: 'http://data.ub.uio.no/acm-ccs-ubo/{id}',
                showWikipedia: false,
                supportsBroadSearch: false,
                show_vocabs: ['realfagstermer', 'ubo'],
                notationSearch: true,
                primo_index: 'lsr18',
            },
            ubo: {
                /* Placeholder */
                name: 'UBO classification (placeholder)',
                code: 'ubo',
                languages: ['nb'],
                defaultLanguage: 'nb',
                scheme: 'http://data.ub.uio.no/ubo/',
                uriPattern: 'http://data.ub.uio.no/ubo/{id}',
                showWikipedia: false,
                supportsBroadSearch: false,
                show_vocabs: [],
                notationSearch: true,
                primo_index: 'lsr18',
            },
        },
        skosmos: {
            baseUrl: 'https://data.ub.uio.no/skosmos/rest/v1',
            vocabularyStatisticsUrl: 'https://data.ub.uio.no/skosmos/rest/v1/{vocab}/vocabularyStatistics',
            dataUrl: 'https://data.ub.uio.no/skosmos/rest/v1/data?uri={uri}',
            jskosUrl: 'https://ub-www01.uio.no/microservices/jskos.php?uri={uri}&expandMappings=true',
            searchUrl: 'https://data.ub.uio.no/skosmos/rest/v1/search',
        },
        catalogue: {
            searchUrl: 'https://ub-lsm.uio.no/primo/v2/search',
        }
    };
    return factory;
}
