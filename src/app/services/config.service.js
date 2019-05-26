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
                label: 'UiO',
                scope: 'default_scope',
                facet: 'facet_local4,exact,UBO',
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
                label: 'UiB',
                scope: 'default_scope',
                facet: 'facet_local4,exact,UBB',
                libraries: {
                    '1120104': {label: 'Bibliotek for realfag'},
                    '1120100': {label: 'Bibliotek for humaniora'},
                    '1120108': {label: 'Bibliotek for samfunnsvitenskap'}
                }
            },
            'NTNU_UB': {
                label: 'NTNU',
                scope: 'default_scope',
                facet: 'facet_local4,exact,NTNU_UB',
                libraries: {
                    '1160133': {label: 'DORA'},
                    '1160103': {label: 'Realfagbiblioteket'},
                    '1160101': {label: 'Teknologibiblioteket'}
                }
            },
            'UBTO': {
                label: 'UiT',
                facet: 'facet_local4,exact,UBTO'
            },
            'NMBU': {
                label: 'NMBU',
                facet: 'facet_local4,exact,NMBU'
            },
        },
        vocabularies: {
            realfagstermer: {
                name: 'Realfagstermer',
                languages: ['nb', 'nn', 'en'],
                defaultLanguage: 'nb',
                scheme: 'http://data.ub.uio.no/realfagstermer/',
                uriPattern: 'http://data.ub.uio.no/realfagstermer/{id}',
                show_vocabs: ['realfagstermer', 'ddc', 'ubo'],
                primo_index: 'lsr20',
            },
            humord: {
                name: 'Humord',
                languages: ['nb'],
                defaultLanguage: 'nb',
                scheme: 'http://data.ub.uio.no/humord/',
                uriPattern: 'http://data.ub.uio.no/humord/{id}',
                show_vocabs: ['humord', 'ddc', 'ubo'],
                primo_index: 'lsr14',
            },
            tekord: {
                name: 'Tekord',
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
                languages: ['en'],
                defaultLanguage: 'en',
                scheme: 'http://data.ub.uio.no/mrtermer/',
                uriPattern: 'http://data.ub.uio.no/mrtermer/{id}',
                show_vocabs: ['mrtermer'],
                primo_index: 'lsr19',
            },
            ddc: {
                name: 'DDC',
                languages: ['nb'],
                defaultLanguage: 'nb',
                scheme: 'http://dewey.info/scheme/edition/e23/',
                uriPattern: 'http://dewey.info/{id}',
                showWikipedia: false,
                supportsBroadSearch: false,
                show_vocabs: ['realfagstermer', 'humord', 'ddc'],
                notationSearch: true,
                primo_index: 'lsr10',
            },
        },
        skosmos: {
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
