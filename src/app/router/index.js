import angular from 'angular';
import authorityModule from '../services/authority.service';
import titleModule from '../services/title.service';
import * as log from 'loglevel';

const moduleName = 'app.router';

angular
    .module(moduleName, [
        authorityModule,
        titleModule,
    ])
    .config(configure)
    .run(run);

export default moduleName;

/* @ngInject */
function configure($stateProvider, $urlRouterProvider) {

    // Configure router
    $urlRouterProvider.when(/^\/(humord|realfagstermer|tekord|mrtermer)$/, '/$1/');
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/?lang',
            data: {pageTitle: ''},
            views: {
                'main': 'appHome',
            },
        })
        .state('error', {
            url: '/error?lang',
            views: {
                'main': 'appError',
            },
        })
        .state('about', {
            url: '/about?lang',
            data: {pageTitle: 'About'},
            views: {
                'main': 'appAbout',
            },
        })
        .state('subject', {
            url: '/:vocab?lang',
            abstract: true,
            views: {
                'main': 'appMain',
            },
        })
        .state('subject.vocab', {
            url: '/',
            views: {
                'info': 'appVocabularyInfo',
            },
        })
        .state('subject.search', {
            url: '/search?term&id&uri&broad&library',
            views: {
                'catalogue': 'appCatalogueResults'
            },
            resolve: {
                subject: /* @ngInject */ function (AuthorityService, $stateParams) {
                    if ($stateParams.uri) {
                        return AuthorityService.getByUri($stateParams.uri);
                    } else if ($stateParams.term) {
                        return AuthorityService.getByTerm($stateParams.term, $stateParams.vocab);
                    } else if ($stateParams.id) {
                        return AuthorityService.getById($stateParams.id, $stateParams.vocab);
                    } else {
                        // Exception
                    }
                }
            }
        });
}

/* @ngInject */
function run($rootScope, $state, $transitions, AuthorityService, TitleService) {

    $transitions.onStart({}, function (transition) {
        var toParams = transition.params('to');

        if (!toParams.id && !toParams.term && !toParams.uri) {
            AuthorityService.clearHistory();
        }
    });

    $transitions.onSuccess({}, function (transition) {
        var data = transition.to().data;
        if (data && data.pageTitle !== undefined) {
            TitleService.set(data.pageTitle);
        }
    });

    $transitions.onError({}, function (transition) {
        var error = transition.error();
        log.error('Error while transitioning to a new state: ', error);
        if (angular.isObject(error) && angular.isString(error.code)) {
            switch (error.code) {
            case 'NOT_AUTHENTICATED':
                // go to the login page
                $state.go('login');
                break;
            default:
                // set the error object on the error state and go there
                $state.get('error').error = error;
                    // $state.go('error');
            }
        } else {
            if (angular.isObject(error)) {
                if (error.type == 5) {
                    // No transition was necessary, this is fine.
                    return;
                }
            }

            // unexpected error
            $state.go('error');
        }
    });
}

