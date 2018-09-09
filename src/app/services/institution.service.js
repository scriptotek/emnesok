import angular from 'angular';

const moduleName = 'app.services.institutions';

angular
    .module(moduleName, [])
    .factory('Institutions', Institutions);

export default moduleName;

/////

function Institutions() {

    // @TODO: Get from some JSON file
    var institutionNames = {
        'AASENTUN': 'Nynorsk kultursentrum',
        'AHO': 'Arkitektur- og designhøgskolen i Oslo',
        'AHUS': 'Akershus universitetssykehus HF',
        'AMH': 'Atlantis Medisinske Høgskole',
        'BDH': 'Høgskolen Betanien',
        'BI': 'Handelshøyskolen BI',
        'BRC': 'Bergen ressurssenter for internasjonal utvikling',
        'BREDK': 'Statped Vest',
        'BUSKSYK': 'Vestre Viken HF',
        'DEPSS': 'Departementenes sikkerhets',
        'DIAKON': 'Diakonhjemmet Høgskole',
        'DIAKONHS': 'Høyskolen Diakonova',
        'DIASYK': 'Diakonhjemmet Sykehus',
        'DMMH': 'Dronning Mauds Minne',
        'ERFKOMP': 'Nasjonalt senter for erfaringskompetanse innen psykisk helse',
        'FFI_BIBL': 'Forsvarets forskningsinstitutt',
        'FHS': 'Forsvarets høgskole',
        'FISKDIR': 'Fiskeridirektoratet',
        'FOLKEMUS': 'Norsk folkemuseum',
        'FOLKHELS': 'Folkehelseinstituttet',
        'FONNA': 'Helse Fonna HF, Haugesund sjukehus',
        'FORBRUK': 'Statens institutt for forbruksforskning',
        'GLOMDAL': 'Glomdalsmuseet',
        'GRANDE': 'HL-senteret',
        'HAL': 'Høgskolen i Ålesund',
        'HBV': 'Høgskolen i Buskerud og Vestfold',
        'HDH': 'Haraldsplass diakonale høgskole',
        'HH': 'Høgskolen i Hedmark',
        'HIB': 'Høgskolen i Bergen ',
        'HIG': 'Høgskolen i Gjøvik',
        'HIH': 'Høgskolen i Harstad',
        'HIL': 'Høgskolen i Lillehammer',
        'HIM': 'Høgskolen i Molde',
        'HIN': 'Høgskolen i Narvik',
        'HINESNA': 'Høgskolen i Nesna',
        'HINT': 'Høgskolen i Nord',
        'HIO': 'Høgskolen i Østfold',
        'HIOA': 'Høgskolen i Oslo og Akershus',
        'HIST': 'Høgskolen i Sør',
        'HIT': 'Høgskolen i Telemark',
        'HSF': 'Høgskulen i Sogn og Fjordane',
        'HSH': 'Høgskolen Stord/Haugesund',
        'HVO': 'Høgskulen i Volda',
        'IFE': 'Institutt for energiteknikk',
        'JBV': 'Jernbaneverket',
        'JUSDEP': 'Justisdepartementet',
        'KHIB': 'Kunsthøgskolen i Bergen',
        'KHIO': 'Kunsthøgskolen i Oslo',
        'KT': 'Konkurransetilsynet',
        'LOVISHS': 'Lovisenberg diakonale høgskole',
        'MAIHAUG': 'Maihaugen',
        'MF': 'Det teologiske menighetsfakultet',
        'MH': 'Høyskolen Campus Kristiania',
        'MHS': 'Misjonshøgskolen',
        'MIGRDIR': 'Mangfolds',
        'MOLDESYK': 'Helse Møre og Romsdal HF',
        'NB': 'Nasjonalbiblioteket',
        'NBANK': 'Norges Bank',
        'NBI': 'SINTEF Byggforsk',
        'NFR': 'Norges forskningsråd',
        'NHHB': 'Norges handelshøyskole',
        'NIFU': 'NIFU',
        'NIH': 'Norges idrettshøgskole',
        'NILU': 'NILU',
        'NINA_DN': 'NINA',
        'NISK': 'Norsk institutt for skog og landskap',
        'NIVA': 'Norsk institutt for vannforskning',
        'NLA': 'NLA Høgskolen Sandviken',
        'NMBU': 'NMBU',
        'NMH': 'Norges musikkhøgskole',
        'NOBEL': 'Det Norske Nobelinstitutt',
        'NOFIMA': 'Nofima ',
        'NOM': 'Norsk oljemuseum',
        'NPOLAR': 'Norsk Polarinstitutt',
        'NTNU_UB': 'NTNU',
        'OSTFSYK': 'Sykehuset Østfold HF',
        'PFP': 'Bioforsk Plantehelse',
        'POLITIHS': 'Politihøgskolen',
        'RBUP_OS': 'RBUP Øst og Sør',
        'RIKSANT': 'Riksantikvaren',
        'SABHF': 'Vestre Viken HF',
        'SAMALL': 'Sámi allaskuvla',
        'SAMBIB': 'Sámedikki oahpponevvohat',
        'SHDIR': 'Helsedirektoratet',
        'SINTEF': 'SINTEF',
        'SINTEF_E': 'SINTEF Energi AS',
        'SIRUS': 'Statens institutt for rusmiddelforskning',
        'SKOFIMUS': 'Norsk Skogfinsk Museum',
        'SSB': 'Statistisk sentralbyrå',
        'SSHF': 'Sørlandet sykehus HF Kristiansand',
        'STAVMUS': 'Museum Stavanger',
        'STORTING': 'Stortingsbiblioteket',
        'TEKNMUS': 'Norsk Teknisk Museum',
        'TELSYK': 'Sykehuset Telemark HF',
        'TRETEKN': 'Norsk treteknisk institutt',
        'UBA': 'UiA',
        'UBB': 'UiB',
        'UBIN': 'UiN',
        'UBIS': 'UiS',
        'UBO': 'UiO',
        'UBTO': 'UiT',
        'UNIS': 'Universitetssenteret på Svalbard',
        'VEGDIR': 'Vegdirektoratet'
    };

    var factory = {
        getName: getName
    };

    return factory;

    ///////////

    function getName(code) {
        return institutionNames[code] || code;
    }

}
