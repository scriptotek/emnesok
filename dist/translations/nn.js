angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('nn', {"About":"Om","Active subject":"Valt emneord","All branches":"Alle avdelingar","All libraries":"Alle bibliotek","An unknown error occured.":"Det oppsto ein ukjend feil ","Broad":"Breitt","broad search":"breitt søk","Catalogue results":"Katalogresultat","Containing":"Inneheld","Ends with":"Sluttar med","Enter a subject":"Søk etter emne","Exact match":"Eksakt lik","Failed to fetch list of editions.":"Klarte ikkje å hente liste over utgåver","Fetching more editions…":"Hentar fleire utgåver...","For information about the subject vocabularies, see the <a ui-sref=\"home\">start page</a>.":"For informasjon om emneordtilfanget, sjå <a ui-sref=\"home\"> startsida </a>","GenreForm":"Sjanger/form","Geographic":"Stad","Grunnstoff":"Grunnstoff","How odd! Not a single document on that subject could be found using the current subject vocabulary.":"Så rart! Ikkje eit einaste dokument vart funne.","Human rights":"Menneskerettar","Humanities and social sciences":"Humaniora og samfunnsfag","Humord is the best portal to the humanities and social sciences. The vocabulary also has a relatively large amount of interdisciplinary subject headings. This vocabulary has only Norwegian Bokmål terms.":"Humord gjev den beste inngangen til humaniora og samfunnsfag. Ordtilfanget har også ei stor mengd tverrfaglege termar. Dette ordtilfanget har berre emneord på bokmål. ","Loaded {{ vm.last }} records so far, {{ vm.total_results - vm.last }} to go, hold on…":"{{vm.last}} poster er henta så langt, {{vm.total_results - vm.last}} står att, vi skunder oss sakte...","Looking…":"Leitar","More editions":"Fleire utgåver","Narrow":"Snevert","narrow search":"snevert søk","No hits :(":"Ingen treff :(","No network connection":"Inkje nettverkssamband","Note: Results from a single branch will not include e-books.":"Merk: Resultat frå berre ei avdeling vil ikkje inkludere e-bøkar","Note: Search for subject strings is currently experimental, and might not yet work as expected.":"Merk: Søk etter emneordstrengar er førebels eksperimentelt og fungerer kanskje ikkje som planlagt","Once in, you can toggle between <em>broad</em> and <em>narrow</em> search. With <em>narrow</em> search, you will only get highly relevant results carefully indexed by skilled librarians and subject specialists using the selected vocabulary. <em>Broad</em> search will give you more results, matching subjects from other vocabularies or even keywords from a variety of sources, but sometimes at the expense of precision.":"Så fort du er inne kan du velje mellom <em> breidt </em> og <em> snevert </em> søk. Med <em> snevert </em> søk vil du berre få relevante resultat nøye utvald av flinke bibliotekarar og fagfolk som har brukt det valde ordtilfanget. <em> Breitt </em> søk er ikkje like presist, men det gjev fleire resultat av di det søker mot andre ordtilfang og frie nøkkelord frå ei rekke kjelder. ","One edition:":["Ei utgåve:","{{$count}} utgåver:"],"Print copy at":"Trykt utgåve ved","Science":"Realfag","Search '+vm.vocab+' only":"Berre søk i '+vm.vocab+' ","Search all subject vocabularies":"Søk i alle emneordtilfang","Search for scientific concepts. <em>Realfagstermer</em> is a controlled vocabulary maintained by the science libraries at the University at Oslo and Bergen, and is the best portal to our collections. Realfagstermer is a multilingual vocabulary that can be searched in Bokmål, Nynorsk (translation in progress), English (translation in progress) and Latin (scientific names).":"Søk etter realfaglege omgrep. <em>Realfagstermar</em> er eit kontrollert ordtilfang som vert vedlikehaldt av realfagsbiblioteka ved UiO og UiB. Dette er den beste inngangen til samlingane våre. Realfagstermar er eit fleirspråkleg ordtilfang der du kan søke på både bokmål, nynorsk (omsetjing under utarbeiding), engelsk (omsetjing under utarbeiding) og latin (vitskapelege namn). ","Search history":"Søkehistorikk","See also:":"Sjå også:","Series":"Serie","Several fantastic pieces of free and open-source software have been used to build this search. A list is provided below together with their licenses.":"Ei rekkje supre open kjelde-komponentar er nytta for å byggje opp emneordsøket. Desse er lista opp saman med lisensane dei er underlagde. ","Sorry, the subject \"{{subject}}\" was not found in the current vocabulary.":"Orsak,, emnet «{{subject}}» vart ikkje funne i dette ordtilfanget.","Starting with":"Startar med","Subject Search":"Emnesøk","Subject Search ß":"Emnesøk ß","Technology and engineering":"Teknologi og ingeniørfag","Tekord is a vocabulary created at NTNU (Norwegian University of Science and Technology). It is an especially useful search portal to Technical and Engeneering literature. This vocabulary has only Norwegian Bokmål terms.":"Tekord er eit ordtilfang utvikla ved NTNU. Det er særleg ein god søkeinngang til teknisk faglitteratur ved NTNU. Tekord inneheld berre emneord på bokmål. ","Temporal":"Tid","The search went out in error:":"Søket gjekk ut i feil","The Subject Search is <a href=\"https://github.com/scriptotek/emnesok\">open source</a> and licensed under the <a href=\"https://github.com/scriptotek/emnesok/blob/master/LICENSE\">MIT license</a>.":"Emnesøket er <a href=\"https://github.com/scriptotek/emnesok\">open kjeldekode</a> lisensisert under <a href=\"https://github.com/scriptotek/emnesok/blob/master/LICENSE\">MIT-lisensen</a>.","The Subject Search is developed by the University of Oslo Science Library. Vocabulary search and retrieval is powered by a <a href=\"http://skosmos.org/\">Skosmos</a> instance using data from <a href=\"http://data.ub.uio.no\">data.ub.uio.no</a>, while library catalogue search and retrieval is powered by <a href=\"https://developers.exlibrisgroup.com/primo/apis/webservices/xservices/search/briefsearch\">Primo</a> through a locally developed middleware (<a href=\"https://github.com/scriptotek/scs\">SCS</a>).":"Emnesøket er utvikla av UiO Realfagsbiblioteket. Søk i emneordtilfanget vert drivne av ein <a href=\"http://skosmos.org/\">Skosmos</a>-instans med data frå <a href=\"http://data.ub.uio.no\">data.ub.uio.no</a>, medan søk i bibliotekskatalogen vert drivne av <a href=\"https://developers.exlibrisgroup.com/primo/apis/webservices/xservices/search/briefsearch\">Primo</a> via ein lokalt utvikla mellomvare (<a href=\"https://github.com/scriptotek/scs\">SCS</a>).","The subject was not found. It might have been deleted.":"Emnet vart ikkje funne. Det kan ha blitt sletta.","Third party licenses":"Tredjepartslisensar","Topic":"Emne","Uh oh, some kind of server error occured.":"Orsak, det oppsto ein serverfeil.","Used for:":"Nytta for:","Welcome to our subject search. Start by choosing a vocabulary from the list below. A vocabulary is a controlled set of subjects. Searching all vocabularies at the same time isn't yet supported, but definitely something we would like to support in the future.":"Velkomen til emnesøket vårt. Start med å velje eit emneordtilfang frå lista under. Eit emneordtilfang er eit kontrollert sett av emneord. Søk i alle ordtilfanga samstundes er førebels ikkje støtta, men vi vonar det skal vere mogleg i framtida. ","Welcome to the new Subject Search beta. Head over <a href=\"https://github.com/scriptotek/emnesok/issues\">to GitHub</a> if you want to peek into the current state of development, report a problem or suggest an idea. If you're looking for the old Subject Search, it's <a href=\"http://app.uio.no/ub/emnesok/test/oria/\">still around</a>.":"Velkommen til beta-utgåva av det nye emnesøket. Du kan følgje med på utviklinga <a href=\"https://github.com/scriptotek/emnesok/issues\">på GitHub</a>.  Der kan du også melde frå om feil og føreslå utbetringar. Saknar du det gamle emnesøket finn du det <a href=\"http://app.uio.no/ub/emnesok/test/oria/\">her</a>.","Yes, we have a controlled subject vocabulary just for human rights terms! Developed and maintained by the Norwegian Centre for Human Rights’ (SMR), the vocabulary has only English terms.":"Ja, vi har eit eige emneordtilfang berre for terminologi knytta til menneskerettar. Det er utvikla og vedlikehaldt av biblioteket ved Norsk senter for menneskerettar (SMR) og har berre emneord på engelsk.","You could try expanding the search to a <a ui-sref=\"subject.search({narrow:false})\">broad search</a>.":"Prøv gjerne å utvide søket til eit <a ui-sref=\"subject.search({narrow:false})\">breitt søk</a>.","You've reached the end, my friend!":"Du har nådd enden av lista. "});
/* jshint +W100 */
}]);