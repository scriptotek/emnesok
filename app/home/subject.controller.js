angular.module('app.controllers.subject', ['app.services.config']).controller('SubjectController', ['$http', '$stateParams', '$filter', 'Config',
	function SubjectController($http, $stateParams, $filter, Config) {

		function arrayifyJSONLD(arrayornot) {

			if (arrayornot===undefined) return false;

			var arr = [];

			if (arrayornot[0]!==undefined && typeof arrayornot === "object") {
				arr = arrayornot;
			}

			else {
				arr.push(arrayornot);
			}
			return arr;
		}

		//Checks for periodic elements and sets acronym to be chemical element
		function isPeriodicalElement(subject,akronym) {

			if (akronym===undefined) return false;
			if (akronym[0]!==undefined && typeof akronym === "object") return false;

			for (var i=0; i<grunnstoff.length; i++){

				if (subject.toLocaleLowerCase()==grunnstoff[i].name && akronym.toLocaleLowerCase()==grunnstoff[i].symbol) {

					return true;
				}
			}
			return false;
		}

		console.log('[SubjectController] Init');

		var that = this;
		that.lang = $stateParams.lang || Config.defaultLanguage;
		that.relatedSubjects = [];
		that.otherLangSubjects = [];
		that.altSubjects = [];

		that.uri = 'http://data.ub.uio.no/'+$stateParams.vocab+'/'+$stateParams.id;

		$http({
		  method: 'GET',
		  url: Config.skosmos.dataUrl.replace('{uri}', that.uri)
		}).
		success(function(data){

			//Organize resources by uri key
			var resources = {};
			data.graph.forEach(function(graph) {
				resources[graph.uri] = graph;
			});

			console.log(resources);

			var relatedUris = arrayifyJSONLD(resources[that.uri].related);

			angular.forEach(resources, function(value, key) {


				//Find preferred terms
				if (that.uri==key) {
					var lang = that.lang
					var prefLabel = arrayifyJSONLD(value.prefLabel);

					//Main term
					var subject = $filter('filter')(prefLabel, {lang: lang}, true);

					//In case of main term not existing in chosen language, default to nb
					if (subject[0]===undefined) {
						var lang = 'nb'
						var subject = $filter('filter')(prefLabel, {lang: lang}, true);

					}

					that.subject = subject[0].value;

					//Term in other languages
					var otherterm  = $filter('filter')(prefLabel, {lang: '!'+lang}, true);

					if (otherterm[0]!==undefined) {

						otherterm.forEach(function(ot) {


							that.otherLangSubjects.push(
								{'value':ot.value, 'uri': key, 'lang':ot.lang}
							);

						});
					}

				}

				//Find related terms if any
				if (relatedUris) {

					//Find if uri of preflabels is in related
					var filtered = $filter('filter')(relatedUris, {uri: key}, true);

					if (filtered[0]!==undefined) {

						//Find related terms in current language
						var relterm = $filter('filter')(arrayifyJSONLD(value.prefLabel), {lang: that.lang}, true);
						if (relterm[0]!==undefined) {
							that.relatedSubjects.push(
								{'value':relterm[0].value, 'uri': key}
							);
						}
					}
				}

				//Find alternate terms

				var altLabel = arrayifyJSONLD(value.altLabel);

				if (altLabel) {


					//Find alternate terms in current language
					var altterm = $filter('filter')(altLabel, {lang: lang}, true);
					if (altterm[0]!==undefined) {
						that.altSubjects.push(
							{'value':altterm[0].value}
						);
					}

					console.log(that.altSubjects);
				}

				//Chemical element test///////////// MUST BE FIXED
				/*
				if (data.graph[1].altLabel!==undefined) {

					if (that.subject=="Kopper") that.subject = "Kobber";

					if (data.graph[1].altLabel[0]!==undefined && typeof data.graph[1].altLabel === "object" ) {
						console.log('array!',data.graph[1].altLabel);
						var akronym = data.graph[1].altLabel[0];
					}

					else {
						console.log('variable!',data.graph[1].altLabel);
						var akronym = data.graph[1].altLabel;
					}

					console.log("akronym",akronym);

					if (isPeriodicalElement(that.subject,akronym)) {

						that.chem = akronym;
					}
				}
				//////////////////////////////////
				*/

			});

		}).
		error(function(data){
			//
		});



	//http://li148-205.members.linode.com/rest/v1/data?uri=http://data.ub.uio.no/realfagstermer/c000039

    }
]);
