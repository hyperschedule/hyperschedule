/*
 * This file contains the hard-coded building code to building names conversion table.
 * Due to the nature of the data, we can safely hardcode it and only update it if a new
 * academic building was constructed. We need campus-level mapping because some keys are
 * duplicate across campuses, such as CGU OCS and SC OCS. Also, ARR and TBA are special code
 * that exist in almost all campuses and they translate to slightly different things
 * */

export const buildings: Record<string, Record<string, string>> = {
    CUC: {
        SSC: "Student Services Center",
    },
    SC: {
        RMV: "Rancho Monte Vista Apts",
        SRA: "Scripps Routt Apartments",
        PTA: "Padua Terrace Apartments",
        PAC: "Performing Arts Center",
        PIT: "Residing at Pitzer",
        LCAB: "Lincoln Ceramic Arts Bld",
        LA: "Lang Art Building",
        WIL: "Wilbur Hall",
        PF: "Performing Arts Center",
        WG: "Williamson Gallery",
        SMI: "Smiley Hall",
        "709": "House 709 On College Ave",
        CPA: "College Park Apartments",
        KIM: "Kimberly Hall",
        HMC: "Residing at HMC",
        CCA: "Claremont Collegiate Apt",
        ARR: "Arranged Location",
        RV: "Revelle House",
        "1060": "1060 College Ave",
        POM: "Residing at Pomona",
        BL: "Balch Hall",
        OUTD: "Outdoor classroom",
        CMC: "Residing at CMC",
        HM: "Humanities Building",
        SNH: "Schow Hall",
        MT: "Malott Commons",
        DE: "Denison Library",
        BX: "Baxter Hall",
        FRA: "Frankel Hall",
        "1040": "1040 College Ave",
        DN: "Richardson Dance Studio",
        ONLI: "Online",
        MIL: "Miller Wing",
        SWL: "SC Housing Waitlist",
        SV: "Service Building",
        ST: "Steele Hall",
        TOL: "Toll Hall",
        LOC: "Living Off Campus",
        MRR: "Mary Routt Hall",
        LOA: "Leave of Absence",
        BPA: "Brighton Park Apartments",
        CGU: "CGU Apartments",
        IO: "Inside Out",
        TIER: "Tiernan Field House",
        BRN: "Browning Hall",
        OCS: "Off-Campus Study",
        GN: "Grounds Building",
        TBA: "To Be Announced",
        DOR: "Dorsey Hall",
        MFG: "Margaret Fowler Garden",
        "1030": "1030 Dartmouth",
        VN: "Vita Nova Hall",
        AT: "Athletic Facility/Pool",
        GSC: "Grace Scripps Clark Hall",
        GJW: "Jungels-Winkler Hall",
        "1050": "1050 College Ave",
        "240": "240 11th St House",
    },
    HM: {
        "": "",
        LI: "Linde Hall",
        OFF: "Off-Campus Housing",
        MCSC: "McGregor CompSci Center",
        BRP: "Brighton Park",
        MD: "Modular Classrooms",
        ONLI: "Online",
        NO: "North Hall",
        CA: "Case Hall",
        IO: "Inside Out",
        ASYN: "Online - Asynchronous",
        SP: "Norman F. Sprague Center",
        SG: "Sontag Hall",
        GA: "Galileo Hall",
        PA: "Parsons Engineering Bldg",
        PL: "Platt Campus Center",
        SO: "South Hall",
        WE: "West Hall",
        TBA: "Location to be announced",
        ARR: "Arranged Location",
        LAC: "Linde Activity Center",
        FH: "Foothill Apartments",
        DW: "Drinkward Hall",
        GH: "Garrett House",
        CGUD: "CGU D",
        BK: "Beckman Hall",
        CGUA: "CGU A",
        HS: "Hoch-Schanahan Dining",
        CGUC: "CGU C",
        CGUB: "CGU B",
        EA: "East Hall",
        APT: "Arrow Vista Apartments",
        ON: "Olin Science Center",
        SHAN: "Shanahan Center",
        JA: "Jacobs Science Center",
        AT: "Atwood Hall",
        KE: "Keck Laboratories",
    },
    CU: {
        TBA: "To Be Announced",
        BA: "Baxter Medical Bldg",
        ARR: "Arranged",
        FH: "Faculty House",
        PP: "Physical Plant",
        BF: "Bernard Field Station",
        KS: "Keck Science Center",
        HR: "CUC Human Resources",
        FA: "Facilities/Grnds/Cust",
        BN: "Black Student Affairs",
        CL: "Chicano/Latino St Aff",
        PE: "Pendleton Bus Bldg",
        TL: "Telephone Office",
        MO: "Monsour Counseling Ctr",
        HD: "Honnold/Mudd Library",
        KSII: "Keck Science Complex II",
        MS: "McAlister Religious Ctr",
    },
    CGU: {
        TBA: "To Be Announced",
        IAC: "Ist. Antiq/Christianity",
        ART: "Art Building",
        GMB: "Graduate Math Building",
        HHE: "Harper Hall East",
        MC: "McManus Hall",
        HUM: "Humanities Center",
        HAR: "Harper Hall",
        JAG: "Jagels Building",
        OCS: "Office of Career Service",
        STF: "Stauffer",
        PHIL: "Philosophy House",
        STON: "Stone Ctr-Children Books",
        BU: "Burkle Family Bldg.",
        BLS: "Blaisdell",
        HIS: "History/Cultural Studies",
        MUS: "Music House",
        EN: "English House",
        THE: "Teacher Educ House",
        ACB: "Academic Computing Bldg",
        GRH: "Grad Residence Halls",
    },
    PO: {
        R136: "136 W. 4th St.",
        R135: "135 E. 7th St.",
        BMA: "Benton Museum of Art",
        SNTG: "Sontag Dorm",
        R230: "230 W. 7th St.",
        ONLI: "Online",
        R725: "725 Yale Avenue",
        NCPG: "N. Campus Parking Garage",
        EDMS: "Edmunds",
        LINC: "Lincoln",
        RA: "Rains Center",
        REPH: "Replica House (KSPC)",
        DSHS: "Dean Stds 188 W 7th St",
        "C-3": "Clark lll",
        FYDN: "Frary Dining",
        WCOM: "Walton Commons",
        TBA: "To Be Assigned",
        TERC: "TER Cottage",
        ARR: "Arranged Location",
        MSQD: "Marston Quad",
        R727: "727 Yale Avenue",
        GRKT: "Greek Theatre",
        LYON: "Lyon Court",
        POM: "Pomona Hall",
        SCC: "Smith Campus Center",
        SN: "Seaver North Laboratory",
        R338: "338 N. Harvard Ave.",
        FRDN: "Frank Dining",
        C316: "316 W 8th Street",
        BT: "Brackett",
        ITPG: "IT Parking Garage",
        BRDG: "Bridges Auditorium",
        RY54: "1254 Yale Ave.",
        RY58: "1258 Yale Ave.",
        GBWL: "Giboney Well",
        R451: "451 Harrison Ave, #2",
        DHS: "Dean's House 1220 Colleg",
        STAR: "Studio Arts",
        RY52: "1252 Yale Ave.",
        C239: "239 N. College",
        OAS: "Oasis",
        EXCH: "5C Student Exchange",
        RY50: "1250 Yale Ave.",
        DGEN: "Dorms General",
        R735: "735 Yale Avenue",
        OFFC: "Std Off-Campus Housing",
        R319: "319 S. College Ave.",
        MA: "Mason Hall",
        "320R": "320 West 8th Street",
        IO: "Inside Out",
        WALK: "Walker Hall",
        LWRY: "Lawry Court",
        HALD: "Haldeman Pool",
        TERB: "TE Bunkhouse",
        MRFD: "Merritt Field",
        REM: "Rembrandt Hall",
        PLYT: "Pauley Tennis Courts",
        R730: "730 N. Harvard Ave.",
        LE: "LeBus Court",
        R332: "332 W. 12th Ave.",
        STOV: "Stover Walk",
        R340: "340 N. Harvard Ave.",
        "N-CL": "Norton/Clark III",
        OYHS: "Oyster House",
        R453: "453 Harrison Ave., #1",
        R731: "731 Yale Avenue",
        C245: "245 N. College",
        AN: "Andrew Building",
        GRND: "Grounds",
        R346: "346 N. Harvard Ave.",
        PD: "Pendleton Dance Studio",
        HAR: "Harwood Court",
        AF: "Athletics Fields",
        C320: "320 W 8th Street",
        SCOM: "Seaver Commons",
        PENP: "Pendelton Pool",
        C324: "324 W 8th Street",
        KEN: "Kenyon House",
        R348: "348 S. Annapolis",
        C328: "328 W 8th Street",
        R304: "304 West 8th Street",
        RY40: "1240 Yale Ave.",
        C241: "241 N. College",
        R464: "464 Springfield Dr.",
        R300: "300 West 8th Street",
        SMTR: "Smith Tower",
        SHED: "N. Grounds Shop",
        RENW: "Renwick House (211 N. Co",
        R729: "729 Yale Avenue",
        PR: "Pearsons Hall",
        R115: "115 E. 7th St.",
        R117: "117 E. 7th St.",
        LB: "Bridges Hall of Music",
        R119: "119 1/2 N. College",
        NRTN: "Norton",
        RY56: "1256 Yale Ave.",
        RNCO: "1237 N. College Ave",
        BALD: "Baldwin House (137 N. Co",
        MDSL: "Mudd Science Library",
        CP: "College Park Apartments",
        SVRH: "Seaver House",
        EVEY: "Evey Canyon",
        R324: "324 West 8th Street",
        ALEX: "Alexander",
        "CL-V": "Clark V",
        "328R": "328 West 8th Street",
        ESTE: "Estella Laboratory",
        SVBI: "RC Seaver Biology Bldg",
        WIG: "Wig Hall",
        STRT: "Strehle Track",
        COOK: "119 N. College - Cook Ho",
        R328: "328 N. Harvard Ave.",
        HN: "Hahn Social Science Bldg",
        CGEN: "Campus General",
        FARM: "The Farm",
        B120: "120 W. Bonita",
        C312: "312 W 8th Street",
        R316: "316 West 8th Street",
        R733: "733 Yale Avenue",
        R312: "312 West 8th Street",
        MILL: "Miller Cottage",
        ATH: "Athearn Field",
        R308: "308 West 8th Street",
        SMI: "Smiley Hall",
        SUMH: "Sumner House (105 N. Col",
        RY46: "1246 Yale Ave.",
        GIBS: "Gibson Hall",
        MOA: "Museum of Art",
        BLSD: "Blaisdell",
        DLNS: "Dialynas Hall",
        RY48: "1248 Yale Ave.",
        THAT: "Thatcher Music Bldg",
        CARW: "Ctr for Ath, Rec & Well",
        PRES: "President's House",
        TR: "Biology Trailers",
        TERH: "TE Ranch House",
        SE: "Seaver South Laboratory",
        JCIT: "JC Cowart Info Tech Bldg",
        HIVE: "The Hive",
        ROGT: "Rogers Tennis Courts",
        HARV: "McCarthy Building",
        TE: "Seaver Theatre",
        PBC: "Pendleton Business Ctr",
        SCPG: "S. Campus Parking Garage",
        CA: "Carnegie Building",
        DOMS: "Doms Outdoor Classroom",
        OLD: "Oldenborg Hall",
        MAGI: "S. Campus Athletic Field",
        MUDD: "Mudd",
        R320: "320 N. Harvard Ave.",
        SMNR: "Sumner Hall",
        OLDB: "Oldenborg Center",
        OLDD: "Oldenborg Dining",
        "CL-I": "Clark I",
        GRHK: "Grounds/Hskping 1st St",
        CR: "Crookshank Hall",
        C304: "304 W 8th Street",
        M156: "156 W. 7th St.",
        DPR: "Draper Center",
        C300: "300 W 8th Street",
        GW: "GWS-740 College Ave",
        RY42: "1242 Yale Ave.",
        KA: "Kenyon Annex",
        OLDR: "Oldenborg Director's Res",
        R431: "431 W. 6th St.",
        C308: "308 W 8th Street",
        RY44: "1244 Yale Ave.",
    },
    PZ: {
        RMV: "Rancho Monte Vista Apt",
        CCAE: "Claremont Collegiate E",
        RRC: "Robert Redford Conservcy",
        NSB: "North Sanborn",
        SKN: "Skandera Wing",
        ONLI: "Online",
        RMZ: "Rancho Monte Visa Apts",
        SKD: "Skandera Hall",
        ONT: "Ontario House",
        BP06: "Brighton Park 06",
        PTZ: "Pitzer Hall",
        FL: "Fletcher Hall",
        CCAD: "Claremont Collegiate D",
        ARR: "Arranged",
        CCAA: "Claremont Collegiate A",
        BE: "Bernard Hall",
        CCAC: "Claremont Collegiate C",
        CCAB: "Claremont Collegiate B",
        BH: "Broad Hall",
        BN: "Benson Auditorium",
        HO: "Holden Hall",
        ATN: "Atherton Hall",
        ESB: "East Sanborn",
        SB: "Sanborn Hall",
        TBA: "To Be Assigned",
        OC: "Off Campus",
        MH: "Mead Hall",
        IO: "Inside Out",
        LOA: "Leave Of Absence",
        SC: "Scott Hall",
        BP14: "Brighton Park 14",
        OT: "Ontario Center",
        MC: "McConnell Center",
        BD: "Broad Center",
        ABRD: "Study Abroad",
        OUTD: "Outside Space",
        CRC: "CA Rehbltn Center-Norco",
        EST: "East Hall",
        GC: "Gold Center",
        WST: "West Hall",
        CP: "College Park Apartments",
        AR: "Arboretum",
        GR: "Grove House",
        AV: "Avery Hall",
    },
    CM: {
        RS: "Roberts South",
        COL: "Collins Dining Hall",
        ONLI: "Online",
        AD: "Adams Hall",
        FAW: "Fawcett Hall",
        STA: "Stark Hall",
        OC: "Off Campus Student House",
        VAL: "Valach Hall",
        RN: "Roberts North",
        BOS: "Boswell Hall",
        MCK: "McKenna Auditorium",
        ARR: "As arranged",
        BC: "Bauer Center",
        PCO: "President's Cottage",
        BRI1: "Brighton Park Apartments",
        "651": "Apartment Bldg #651",
        BEC: "Beckett Hall",
        CLAR: "Claremont Blvd Building",
        DC: "Washington DC Housing",
        BS: "Bauer South",
        APP: "Appleby Hall",
        GRE: "Green Hall",
        MAR: "Marks Hall",
        WOH: "Wohlford Hall",
        BZ: "Biszantz Tennis Center",
        BER: "Berger Hall",
        ATH: "M.M. Cook Athenaeum",
        SM: "Seaman Hall",
        BEN: "Benson Hall",
        MI: "Mills Avenue Bldg",
        OCH: "Other CUC Housing",
        OTHR: "Off-Campus Crs Facility",
        PHI: "Phillips Hall",
        CMPE: "CMC PE Facilities",
        IO: "Inside Out",
        CLA: "Claremont Hall",
        "671": "Apartment Bldg #671",
        AK5: "Alexan Kendry #5 Apts",
        AK4: "Alexan Kendry #4 Apts",
        AK3: "Alexan Kendry #3 Apts",
        AK2: "Alexan Kendry #2 Apts",
        CRO: "Crown Hall",
        BRI: "Brighton Park Apartments",
        CC: "Center Court",
        HGB: "Heggblade Center",
        KRV: "The Kravis Center",
        GLE: "Global Education",
        "661": "Apartment Bldg #661",
        AUE: "Auen Hall",
        RPAV: "Roberts Pavilion",
        PRTZ: "Pritzlaf Field",
        "681": "Apartment Bldg #681",
    },
    MAIN: {
        AD: "Archduke Dave Hall",
    },
};
