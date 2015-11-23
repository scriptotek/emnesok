(function() {
    'use strict';

    angular
        .module('app.modules.catalogue', ['app.services.catalogue', 'app.services.subject', 'app.services.config'])
        .directive('modCatalogue', CatalogueDirective)
        .directive('modCatalogueResult', CatalogueResultDirective);

    function CatalogueResultDirective() {
        console.log('[CatalogueResultDirective] Init');

        var directive = {
            restrict: 'E',
            templateUrl: './templates/catalogue-result.html?' + Math.random(),
            replace: true,
            scope: {
                record: '='
            },
            controller: ['$scope', 'Lang', 'Catalogue', 'Config', resultController]
        };

        return directive;
    }

    function resultController($scope, Lang, Catalogue, Config) {
        // @TODO
        $scope.recordExpanded = false;
        $scope.expandGroup = expandGroup;
        $scope.versions = [];

        ////////////

        function expandGroup() {
            var groupId = $scope.record.id;
            $scope.busy = true;
            Catalogue.expandGroup(groupId).then(function(response) {
                console.log('Got response:');
                console.log(response.result.records);
                $scope.busy = false;
                $scope.recordExpanded = true;
                $scope.versions = response.result.records;
            }, function(error) {
                // @TODO: Handle error
                $scope.busy = false;
            });
        }
    }

    function CatalogueDirective() {
    	console.log('[Catalogue] Init');

    	var directive = {
            restrict: 'A',
            templateUrl: './templates/catalogue.html?' + Math.random(),
            replace: false,
            scope: {},
            controllerAs: 'vm',
            controller: ['$stateParams', '$scope', '$window', 'Lang', 'Catalogue', 'Config', controller]
        };

        return directive;
    }

    function controller($stateParams, $scope, $window, Lang, Catalogue, Config) {
        /*jshint validthis: true */
        var vm = this;
        vm.vocab = '';
        vm.term = '';
        vm.start = 0;
        vm.last = 0;
        vm.next = 1;
        vm.busy = true;
        vm.total_results = 0;
        vm.results = [];
        vm.expandGroup = expandGroup;
        vm.getMoreRecords = getMoreRecords;

        activate();

        ////////////

        function activate() {
            var defaultLang = Lang.defaultLanguage;
            $scope.$on('SubjectReady', function(evt, data) {
                console.log('[CatalogueController] Got subject');
                vm.vocab = data.vocab;
                vm.term = data.data.prefLabel[defaultLang];
                search();
            });

            // scope.$on('$destroy', function() {
            //     return target.off('scroll', handler);
            // });

            angular.element($window).on('scroll', checkScrollPos);
        }

        function checkScrollPos() {
            var scrollPosition = window.pageYOffset;
            var windowHeight     = window.innerHeight;
            var bodyHeight     = document.body.offsetHeight;

            var body = document.body,
                html = document.documentElement;

            var height = Math.max( body.scrollHeight, body.offsetHeight, 
                                   html.clientHeight, html.scrollHeight, html.offsetHeight );

            vm.distanceFromBottom = height - scrollPosition - windowHeight;

            if (vm.distanceFromBottom < 500) {
                getMoreRecords();
            }

            $scope.$apply();
        }

        function expandGroup(id) {
            var url = Config.catalogue.groupUrl.replace('{id}', id);
            console.log(url);
        }

        function gotResults(response) {
            console.log('Got results from CatalogueService:');
            console.log(response);

            vm.total_results = response.total_results;
            vm.start = response.first;
            vm.next = response.next;
            vm.last = vm.next ? vm.next - 1 : vm.total_results;
            vm.results = vm.results.concat(response.results);
            vm.busy = false;
            checkScrollPos();
        }

        function getMoreRecords() {
            if (vm.vocab && vm.term && vm.next && !vm.busy) {
                search();
            }
        }

        function search() {
            vm.busy = true;
            Catalogue.search(vm.vocab, vm.term, vm.next).then(
                gotResults,
                function(error) {
                    // @TODO Handle error
                }
            );
        }

    }

})();
