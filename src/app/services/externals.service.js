(function() {
    'use strict';

    angular
        .module('app.services.externals', [
            'app.services.config',
        ])
        .factory('Externals', ExternalsFactory);

    /* @ngInject */
    function ExternalsFactory($http, $q, $filter) {

        function htmlToPlaintext(text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
        }

        var service = {
            snl:snl,
            wp:wp,
            ps:ps
        };

        return service;

        function snl(prefLabel) {

            var deferred = $q.defer();

            $http({
                method: 'GET',
                cache: true,
                url: 'https://services.biblionaut.net/api/snl.php',
                params: {query: prefLabel}
            }).
            then(function(result){

                result.data.name = 'Store norske leksikon';
                if (result.data.type == 'no result') {
                    return deferred.resolve(null);
                }
                return deferred.resolve(result.data);

            },function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function ps(prefLabel) {

            var deferred = $q.defer();

            $http({
                method: 'GET',
                cache: true,
                url: 'https://services.biblionaut.net/api/ps.php',
                params: {ele: prefLabel}
            }).
            then(function(result){

                result.data = result.data;
                result.data.name = 'Periodesystemet';
                deferred.resolve(result.data);

            },function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        }


        function wp(prefLabel,lang,type,deferred) {

            var wpLang = (lang == 'nb') ? 'no' : lang;

            if (type===undefined) type='exact';
            if (!type) type='exact';

            if (!deferred) {
                deferred = $q.defer();
            }

            if (type=='exact'){

                $http({
                    method: 'GET',
                    cache: true,
                    url: 'https://'+wpLang+'.wikipedia.org/w/api.php',
                    params: {
                        action: 'query',
                        prop: 'extracts|info',
                        exintro:'',
                        inprop: 'url',
                        redirects:'',
                        titles:prefLabel,
                        format: 'json',
                        origin: '*',  // Per https://www.mediawiki.org/wiki/Manual:CORS#Description
                    }
                }).
                then(function(result){

                    var processed;

                    for (var pageid in result.data.query.pages) {

                        processed=result.data.query.pages[pageid];
                        break;
                    }

                    if (processed.missing===undefined) {

                        var extract='';
                        if (processed.extract) {

                            var paragraphs =  processed.extract.match(/<p>([^]*?)<\/p>/gi);
                            extract = htmlToPlaintext(paragraphs[0]);
                        }

                        result.data = {
                            name: 'Wikipedia',
                            url: processed.canonicalurl,
                            extract: extract,
                            type: type
                        };
                        deferred.resolve(result.data);
                    }

                    else {
                        wp(prefLabel,lang,'search', deferred);
                    }

                },function(error){
                    deferred.reject(error);
                });
            }

            if (type=='search') {

                $http({
                    method: 'GET',
                    cache: true,
                    url: 'https://'+wpLang+'.wikipedia.org/w/api.php',
                    params :{
                        action: 'query',
                        list: 'search',
                        srsearch:prefLabel,
                        srinfo:'totalhits',
                        redirects:'',
                        format: 'json',
                        origin: '*',  // Per https://www.mediawiki.org/wiki/Manual:CORS#Description
                    }
                }).
                then(function(result){

                    var data = null;

                    if (result.data.query.searchinfo.totalhits) {

                        data = {
                            name: 'Wikipedia',
                            url: 'https://'+wpLang+'.wikipedia.org/w/index.php?search='+prefLabel,
                            extract: '',
                            type: type
                        };
                    }

                    deferred.resolve(data);

                },function(error){
                    deferred.reject(error);
                });
            }

            return deferred.promise;
        }
    }
})();
