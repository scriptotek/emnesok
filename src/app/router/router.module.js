(function() {
    'use strict';

    var router = angular.module('app.router', [
        'app.services.authority',
        'app.services.title',
    ]);

    router.config(configure);
    router.run(run);

    /* @ngInject */
    function configure($stateProvider, $urlRouterProvider) {

        // Configure router
        $urlRouterProvider.when(/^\/(humord|realfagstermer|tekord|mrtermer)$/, '/$1/');
        $urlRouterProvider.otherwise('/');

        var headerView = {
            templateUrl: 'app/header.html',
            controller: 'HeaderController',
            controllerAs: 'vm'
        };

        $stateProvider
            .state('home', {
                url: '/?lang',
                data: {pageTitle: ''},
                views: {
                    'header': headerView,
                    'main': {
                        templateUrl: 'app/main.html',
                        controller: 'MainController',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('error', {
                url: '/error?lang',
                views: {
                    'header': headerView,
                    'main': {
                        templateUrl: 'app/error.html',
                        controller: 'ErrorController',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('about', {
                url: '/about?lang',
                data: {pageTitle: 'About'},
                views: {
                    'header': headerView,
                    'main': {
                        templateUrl: 'app/about.html',
                        controller: 'AboutController',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('subject', {
                url: '/:vocab?lang',
                abstract: true,
                views: {
                    'header': headerView,
                    'main': {
                        template: [
                            '<div class="container-fluid">',
                            '<div class="row">',
                            '   <div id="left" class="col-md-5">',
                            '       <div mod-search></div>',
                            '   </div>',
                            '   <div id="right" class="col-md-7">',
                            '       <div ui-view="catalogue"></div>',
                            '   </div>',
                            '</div>',
                            '</div>'
                        ].join('')
                    }
                }
            })
            .state('subject.vocab', {
                url: '/',
                views: {
                    'catalogue': {
                        templateUrl: function (stateParams) {
                            return 'app/vocabs/' + stateParams.vocab + '.html';
                        },
                        controller: 'VocabularyController',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('subject.search', {
                url: '/search?term&id&uri&broad&library',
                views: {
                    'catalogue': {
                        templateUrl: 'app/catalogue/catalogue.html',
                        controller: 'CatalogueController',
                        controllerAs: 'vm'
                    }
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
    function run($rootScope, $state, Lang, AuthorityService, TitleService) {

        $rootScope.$on('$stateChangeSuccess', function listener(event, toState) {
            if (toState.data && toState.data.pageTitle !== undefined) {
                TitleService.set(toState.data.pageTitle);
            }
        });

        $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams, error) {
            if (!toParams.id && !toParams.term && !toParams.uri) {
                AuthorityService.clearSearchHistory();
            }
        });

        $rootScope.$on('$stateChangeError', function (evt, toState, toParams, fromState, fromParams, error) {
            console.error(error);
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
                // unexpected error
                // $state.go('error');
            }
        });
    }

})();