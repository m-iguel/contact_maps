/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 *
 * Adapted from MolQL project
 */
import { MolScriptBuilder } from '../../../mol-script/language/builder';
var B = MolScriptBuilder;
var reFloat = /[-+]?[0-9]*\.?[0-9]+/;
function atomNameListMap(x) { return x.split('+').map(B.atomName); }
function listMap(x) { return x.split('+').map(function (x) { return x.replace(/^["']|["']$/g, ''); }); }
function listOrRangeMap(x) {
    // cases
    if (x.includes('-') && x.includes('+')) {
        var pSplit = x.split('+').map(function (x) { return x.replace(/^["']|["']$/g, ''); });
        var res_1 = [];
        pSplit.forEach(function (x) {
            if (x.includes('-') && !x.startsWith('-')) {
                var _a = x.split('-').map(function (x) { return parseInt(x); }), min = _a[0], max = _a[1];
                for (var i = min; i <= max; i++) {
                    res_1.push(i);
                }
            }
            else if (x.includes('-') && x.startsWith('-') && x.match(/[0-9]+-[-0-9]+/)) {
                var min = -parseInt(x.split('-')[1]);
                var max = void 0;
                if (x.includes('--')) {
                    max = -parseInt(x.split('-')[3]);
                }
                else {
                    max = parseInt(x.split('-')[2]);
                }
                for (var i = min; i <= max; i++) {
                    res_1.push(i);
                }
            }
            else if (x.includes('-') && x.startsWith('-') && !x.match(/[0-9]+-[-0-9]+/)) {
                res_1.push(parseInt(x));
            }
            else {
                res_1.push(parseInt(x));
            }
        });
        return res_1;
    }
    else if (x.includes('-') && !x.includes('+')) {
        var res = [];
        if (!x.startsWith('-')) {
            var _a = x.split('-').map(function (x) { return parseInt(x); }), min = _a[0], max = _a[1];
            for (var i = min; i <= max; i++) {
                res.push(i);
            }
        }
        else if (x.startsWith('-') && x.match(/[0-9]+-[-0-9]+/)) {
            var min = -parseInt(x.split('-')[1]);
            var max = void 0;
            if (x.includes('--')) {
                max = -parseInt(x.split('-')[3]);
            }
            else {
                max = parseInt(x.split('-')[2]);
            }
            for (var i = min; i <= max; i++) {
                res.push(i);
            }
        }
        else if (x.startsWith('-') && !x.match(/[0-9]+-[-0-9]+/)) {
            res.push(parseInt(x));
        }
        else {
            res.push(parseInt(x));
        }
        return res;
    }
    else if (!x.includes('-') && x.includes('+')) {
        return listMap(x).map(function (x) { return parseInt(x); });
    }
    else {
        return [parseInt(x)];
    }
}
function elementListMap(x) {
    return x.split('+').map(B.struct.type.elementSymbol);
}
var sstrucDict = {
    H: 'helix',
    S: 'beta',
    L: 'none'
};
function sstrucListMap(x) {
    return {
        flags: B.struct.type.secondaryStructureFlags(x.toUpperCase().split('+').map(function (ss) { return sstrucDict[ss] || 'none'; }))
    };
}
export var properties = {
    symbol: {
        '@desc': 'chemical-symbol-list: list of 1- or 2-letter chemical symbols from the periodic table',
        '@examples': ['symbol O+N'],
        abbr: ['e.'], regex: /[a-zA-Z'"+]+/, map: elementListMap,
        level: 'atom-test', property: B.acp('elementSymbol')
    },
    name: {
        '@desc': 'atom-name-list: list of up to 4-letter codes for atoms in proteins or nucleic acids',
        '@examples': ['name CA+CB+CG+CD'],
        abbr: ['n.'], regex: /[a-zA-Z0-9'"+]+/, map: atomNameListMap,
        level: 'atom-test', property: B.ammp('label_atom_id')
    },
    resn: {
        '@desc': 'residue-name-list: list of 3-letter codes for amino acids or list of up to 2-letter codes for nucleic acids',
        '@examples': ['resn ASP+GLU+ASN+GLN', 'resn A+G'],
        abbr: ['resname', 'r.'], regex: /[a-zA-Z0-9'"+]+/, map: listMap,
        level: 'residue-test', property: B.ammp('label_comp_id')
    },
    resi: {
        '@desc': 'residue-identifier-list list of up to 4-digit residue numbers or residue-identifier-range',
        '@examples': ['resi 1+10+100+1000', 'resi 1-10'],
        abbr: ['resident', 'residue', 'resid', 'i.'], regex: /[0-9+-]+/, map: listOrRangeMap,
        level: 'residue-test', property: B.ammp('auth_seq_id')
    },
    alt: {
        '@desc': 'alternate-conformation-identifier-list list of single letters',
        '@examples': ['alt A+B', 'alt ""', 'alt ""+A'],
        abbr: [], regex: /[a-zA-Z0-9'"+]+/, map: listMap,
        level: 'atom-test', property: B.ammp('label_alt_id')
    },
    chain: {
        '@desc': 'chain-identifier-list list of single letters or sometimes numbers',
        '@examples': ['chain A'],
        abbr: ['c.'], regex: /[a-zA-Z0-9'"+]+/, map: listMap,
        level: 'chain-test', property: B.ammp('auth_asym_id')
    },
    segi: {
        '@desc': 'segment-identifier-list list of up to 4 letter identifiers',
        '@examples': ['segi lig'],
        abbr: ['segid', 's.'], regex: /[a-zA-Z0-9'"+]+/, map: listMap,
        level: 'chain-test', property: B.ammp('label_asym_id')
    },
    flag: {
        '@desc': 'flag-number a single integer from 0 to 31',
        '@examples': ['flag 0'],
        isUnsupported: true,
        abbr: ['f.'], regex: /[0-9]+/, map: function (x) { return parseInt(x); },
        level: 'atom-test'
    },
    numeric_type: {
        '@desc': 'type-number a single integer',
        '@examples': ['nt. 5'],
        isUnsupported: true,
        abbr: ['nt.'], regex: /[0-9]+/, map: function (x) { return parseInt(x); },
        level: 'atom-test'
    },
    text_type: {
        '@desc': 'type-string a list of up to 4 letter codes',
        '@examples': ['text_type HA+HC'],
        isUnsupported: true,
        abbr: ['tt.'], regex: /[a-zA-Z0-9'"+]+/, map: listMap,
        level: 'atom-test'
    },
    id: {
        '@desc': 'external-index-number a single integer',
        '@examples': ['id 23'],
        regex: /[0-9+-]+/, map: listOrRangeMap,
        level: 'atom-test', property: B.ammp('id')
    },
    index: {
        '@desc': 'internal-index-number a single integer',
        '@examples': ['index 11'],
        regex: /[0-9+-]+/, map: listOrRangeMap,
        level: 'atom-test', property: B.ammp('id')
    },
    ss: {
        '@desc': 'secondary-structure-type list of single letters. Helical regions should be assigned H and sheet regions S. Loop regions can either be assigned L or be blank.',
        '@examples': ['ss H+S+L', 'ss S+""'],
        abbr: [], regex: /[a-zA-Z'"+]+/, map: sstrucListMap,
        level: 'residue-test', property: B.ammp('secondaryStructureFlags')
    },
    b: {
        '@desc': 'comparison-operator b-factor-value a real number',
        '@examples': ['b > 10'],
        isNumeric: true,
        abbr: [], regex: reFloat, map: function (x) { return parseFloat(x); },
        level: 'atom-test', property: B.ammp('B_iso_or_equiv')
    },
    q: {
        '@desc': 'comparison-operator occupancy-value a real number',
        '@examples': ['q <0.50'],
        isNumeric: true,
        abbr: [], regex: reFloat, map: function (x) { return parseFloat(x); },
        level: 'atom-test', property: B.ammp('occupancy')
    },
    formal_charge: {
        '@desc': 'comparison-operator formal charge-value an integer',
        '@examples': ['fc. = -1'],
        isNumeric: true,
        abbr: ['fc.'], regex: reFloat, map: function (x) { return parseFloat(x); },
        level: 'atom-test', property: B.ammp('pdbx_formal_charge')
    },
    partial_charge: {
        '@desc': 'comparison-operator partial charge-value a real number',
        '@examples': ['pc. > 1'],
        isUnsupported: true,
        isNumeric: true,
        abbr: ['pc.'], regex: reFloat, map: function (x) { return parseFloat(x); },
        level: 'atom-test'
    },
    elem: {
        '@desc': 'str  atomic element symbol string ("X" if undefined)',
        '@examples': ['elem N'],
        regex: /[a-zA-Z0-9]{1,3}/, map: function (x) { return B.es(x); },
        level: 'atom-test', property: B.acp('elementSymbol')
    }
};
