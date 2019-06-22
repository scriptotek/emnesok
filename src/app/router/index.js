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
    $urlRouterProvider.when(/^\/(humord|realfagstermer|tekord|mrtermer)$/, '/$1/search');
    $urlRouterProvider.when(/^\/(humord|realfagstermer|tekord|mrtermer)\/$/, '/$1/search');

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
        .state('subject.error', {
            url: '/error',
            views: {
                'searchBox': 'appSearchBox',
                'catalogue': 'appError',
            },
        })
        .state('subject.search', {
            url: '/search?term&id&uri&broad&library',
            views: {
                'searchBox': 'appSearchBox',
                'catalogue': 'appCatalogueResults',
                'concept': 'appAuthorityView',
                'info': 'appVocabularyInfo',
            },
            resolve: {
                subject: /* @ngInject */ function (AuthorityService, $stateParams, $q, $state, $timeout) {
                    var deferred = $q.defer();

                    if (!$stateParams.term && !$stateParams.id && !$stateParams.uri) {
                        return
                    }

                    if ($stateParams.vocab == 'ubo') {

                        AuthorityService.lookupUboClassification($stateParams.term)
                           .then(
                                result => {
                                    $state.go('subject.search', {
                                        vocab: result.vocab,
                                        term: result.term,
                                        library: result.library,
                                        lang: result.lang,
                                        id: null,
                                        uri: null,
                                    });
                                    return deferred.reject('Redirecting');
                                }
                            )
                           .catch(err => deferred.reject(`The classification code ${$stateParams.term} was not found in any of the supported classification schemes.`));

                    } else {

                        AuthorityService.lookup($stateParams)
                            .then(result => deferred.resolve(result))
                            .catch(err => {
                                if ($stateParams.term) {
                                    deferred.reject(`The search term "${$stateParams.term}" was not found in this vocabulary.`);
                                } else {
                                    deferred.reject('The search term was not found in this vocabulary.');
                                }
                            })

                    }
                    return deferred.promise;
                }
            }
        });
}

/* @ngInject */
function run($rootScope, $state, $transitions, AuthorityService, TitleService) {

    $transitions.onStart({}, function (transition) {
        var toParams = transition.params('to');

        if (!toParams.id && !toParams.term && !toParams.uri) {
            AuthorityService.clearCurrentSubject();
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
        var targetStateParams = transition.targetState().params();
        log.error('Error while transitioning to a new state: ', error);
        if (angular.isObject(error) && angular.isString(error.code)) {
            switch (error.code) {
            case 'NOT_AUTHENTICATED':
                // go to the login page
                $state.go('login');
                return;
            default:
                // set the error object on the error state and go there
                $state.get('error').message = error.message;
            }
        } else if (angular.isObject(error)) {
            console.log('Trans error', error.type, error.message)
            if (error.type == 5) {
                // No transition was necessary, this is fine.
                return;
            }
            if (error.detail == 'Redirecting') {
                // The transition has been superseded by a different transition, also fine.
                return;
            }

            // unexpected error
            $state.get('error').message = error.detail;
        }
        if (targetStateParams.vocab) {
            $state.go('subject.error', {vocab: targetStateParams.vocab});
        } else {
            $state.go('error');
        }
    });
}

