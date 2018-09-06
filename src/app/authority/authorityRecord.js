(function() {
    'use strict';

    angular
		.module('app.authority')
		.component('appAuthorityRecord', {
            templateUrl: 'app/authority/authorityRecord.html',
            controller: AuthorityRecordController,
            controllerAs: 'vm',
            bindings: {
                data: '<',
            },
        });

    /* @ngInject */
    function AuthorityRecordController($scope, Config, langService, Externals) {
		/*jshint validthis: true */
        var vm = this;

        vm.error = null;
        vm.subject = null;

        this.$onChanges = function(changes) {
            if (!vm.data) {
                vm.error = null;
                vm.subject = null;
            } else {
                vm.subject = process(vm.data);
                vm.subject.vocab = vm.data.vocab;
            }
        };

        function process(subject) {
            var lang = langService.language;
            var displayLang = lang;
            var defaultLang = langService.defaultLanguage;
            var translations = [];
            var externals = [];
            var output = {};

            if (!subject.data.prefLabel[displayLang]) {
                displayLang = defaultLang;
            }

			//Externals////////////////////

            if (subject.data.prefLabel[displayLang].substr(-12)=='(grunnstoff)') {
                subject.data.prefLabel[displayLang]=subject.data.prefLabel[displayLang].slice(0, -12);
            }

            if (subject.data.prefLabel[lang]!==undefined) {
				// Externals.snl(subject.data.prefLabel[displayLang]).then(function(data) {
				// 	externals.push(data);
				// 	output.externals = externals;
				// });

                Externals.wp(subject.data.prefLabel[displayLang],displayLang).then(function(data) {
                    externals.push(data);
                    output.externals = externals;
                });
            }


            if (subject.data.elementSymbol && (displayLang=='nb' || displayLang=='nn')){

                Externals.ps(subject.data.elementSymbol).then(function(data) {
                    externals.push(data);
                    output.externals = externals;
                });

            }
			////////////////////////////////

            Object.keys(subject.data.prefLabel).forEach(function(langCode) {
                if (langCode !== displayLang) {
                    translations.push({
                        language: {code: langCode, name: Config.languageLabels[langCode]},
                        prefLabel: subject.data.prefLabel[langCode],
                        altLabel: subject.data.altLabel[langCode]
                    });
                }
            });

            function transformRelatedSubject(k) {
                return {
                    prefLabel: k.prefLabel[displayLang] || k.prefLabel[defaultLang],
                    notation: k.notation.length ? k.notation[0] : null,
                    uri: k.uri,
                    id: k.id,
                    type: k.type,
                };
            }

            output = {
                prefLabel: subject.data.prefLabel[displayLang],
                altLabel: subject.data.altLabel[displayLang],
                notation: subject.data.notation.length ? subject.data.notation[0] : null,
                definition: subject.data.definition[displayLang] || subject.data.definition[defaultLang],
                related: subject.data.related.map(transformRelatedSubject),
                broader: subject.data.broader.map(transformRelatedSubject),
                narrower: subject.data.narrower.map(transformRelatedSubject),
                translations: translations,
                elementSymbol: subject.data.elementSymbol,
                uri: subject.data.uri,
            };

            if (subject.vocab == 'realfagstermer') {
                var uri_id = output.uri.split('/').pop();
                var ident = uri_id.replace('c', 'REAL');
                var emnesokUrl = 'https://app.uio.no/ub/emnesok/realfagstermer/search?id=' + encodeURIComponent(uri_id);
                var katapiUrl  = 'http://ub-viz01.uio.no/okapi2/#/search?q=' + encodeURIComponent('realfagstermer:"' + output.prefLabel + '"');
                var soksedUrl = 'http://ub-soksed.uio.no/concepts/' + ident ;
                var issue_title = output.prefLabel;
                var issue_body = encodeURIComponent('\n\n\n\n---\n*' + ident + ' (' + output.prefLabel + ') i [Emnesøk](' + emnesokUrl + '), [Skosmos]('+ output.uri + '), [Okapi](' + katapiUrl + '), [Soksed](' + soksedUrl + ')*');
                output.feedback_uri = 'https://github.com/realfagstermer/realfagstermer/issues/new?title=' + issue_title + '&body=' + issue_body;
            }

            return output;
        }
    }

})();
