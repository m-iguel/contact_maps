/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { parseSdf } from '../sdf/parser';
var SdfString = "\n  Mrv1718007121815122D\n\n  5  4  0  0  0  0            999 V2000\n    0.0000    0.8250    0.0000 O   0  5  0  0  0  0  0  0  0  0  0  0\n   -0.8250    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000   -0.8250    0.0000 O   0  5  0  0  0  0  0  0  0  0  0  0\n    0.0000    0.0000    0.0000 P   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8250    0.0000    0.0000 O   0  5  0  0  0  0  0  0  0  0  0  0\n  4  1  1  0  0  0  0\n  4  2  2  0  0  0  0\n  4  3  1  0  0  0  0\n  4  5  1  0  0  0  0\nM  CHG  3   1  -1   3  -1   5  -1\nM  END\n> <DATABASE_ID>\n0\n\n> <DATABASE_NAME>\ndrugbank\n\n> 5225 <TEST_FIELD>\nwhatever\n\n> <INCHI_IDENTIFIER>\nInChI=1S/H3O4P/c1-5(2,3)4/h(H3,1,2,3,4)/p-3\n\n> <INCHI_KEY>\nNBIIXXVUZAFLBC-UHFFFAOYSA-K\n\n> <FORMULA>\nO4P\n\n> <MOLECULAR_WEIGHT>\n94.9714\n\n> <EXACT_MASS>\n94.95342\n\n> <JCHEM_ACCEPTOR_COUNT>\n4\n\n> <JCHEM_ATOM_COUNT>\n5\n\n> <JCHEM_AVERAGE_POLARIZABILITY>\n4.932162910070488\n\n> <JCHEM_BIOAVAILABILITY>\n1\n\n> <JCHEM_DONOR_COUNT>\n0\n\n> <JCHEM_FORMAL_CHARGE>\n-3\n\n> <JCHEM_GHOSE_FILTER>\n0\n\n> <JCHEM_IUPAC>\nphosphate\n\n> <JCHEM_LOGP>\n-1.0201038226666665\n\n> <JCHEM_MDDR_LIKE_RULE>\n0\n\n> <JCHEM_NUMBER_OF_RINGS>\n0\n\n> <JCHEM_PHYSIOLOGICAL_CHARGE>\n-2\n\n> <JCHEM_PKA>\n6.951626889535468\n\n> <JCHEM_PKA_STRONGEST_ACIDIC>\n1.7961261340181292\n\n> <JCHEM_POLAR_SURFACE_AREA>\n86.25\n\n> <JCHEM_REFRACTIVITY>\n11.2868\n\n> <JCHEM_ROTATABLE_BOND_COUNT>\n0\n\n> <JCHEM_RULE_OF_FIVE>\n1\n\n> <JCHEM_TRADITIONAL_IUPAC>\nphosphate\n\n> <JCHEM_VEBER_RULE>\n0\n\n> <DRUGBANK_ID>\nDB14523\n\n> <DRUG_GROUPS>\nexperimental\n\n> <GENERIC_NAME>\nPhosphate ion\n\n> <SYNONYMS>\nOrthophosphate; Phosphate\n\n$$$$\n\nComp 2\n\n5  4  0  0  0  0            999 V2000\n  0.0000    0.8250    0.0000 O   0  5  0  0  0  0  0  0  0  0  0  0\n -0.8250    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  0.0000   -0.8250    0.0000 O   0  5  0  0  0  0  0  0  0  0  0  0\n  0.0000    0.0000    0.0000 P   0  0  0  0  0  0  0  0  0  0  0  0\n  0.8250    0.0000    0.0000 O   0  5  0  0  0  0  0  0  0  0  0  0\n4  1  1  0  0  0  0\n4  2  2  0  0  0  0\n4  3  1  0  0  0  0\n4  5  1  0  0  0  0\nM  CHG  3   1  -1   3  -1   5  -1\nM  END\n> <DATABASE_ID>\n1\n\n$$$$\n\n2244\n  -OEChem-04122119123D\n\n 21 21  0     0  0  0  0  0  0999 V2000\n    1.2333    0.5540    0.7792 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.6952   -2.7148   -0.7502 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7958   -2.1843    0.8685 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.7813    0.8105   -1.4821 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.0857    0.6088    0.4403 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7927   -0.5515    0.1244 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7288    1.8464    0.4133 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.1426   -0.4741   -0.2184 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.0787    1.9238    0.0706 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.7855    0.7636   -0.2453 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.1409   -1.8536    0.1477 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1094    0.6715   -0.3113 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.5305    0.5996    0.1635 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.1851    2.7545    0.6593 H   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.7247   -1.3605   -0.4564 H   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.5797    2.8872    0.0506 H   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.8374    0.8238   -0.5090 H   0  0  0  0  0  0  0  0  0  0  0  0\n    3.7290    1.4184    0.8593 H   0  0  0  0  0  0  0  0  0  0  0  0\n    4.2045    0.6969   -0.6924 H   0  0  0  0  0  0  0  0  0  0  0  0\n    3.7105   -0.3659    0.6426 H   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.2555   -3.5916   -0.7337 H   0  0  0  0  0  0  0  0  0  0  0  0\n  1  5  1  0  0  0  0\n  1 12  1  0  0  0  0\n  2 11  1  0  0  0  0\n  2 21  1  0  0  0  0\n  3 11  2  0  0  0  0\n  4 12  2  0  0  0  0\n  5  6  1  0  0  0  0\n  5  7  2  0  0  0  0\n  6  8  2  0  0  0  0\n  6 11  1  0  0  0  0\n  7  9  1  0  0  0  0\n  7 14  1  0  0  0  0\n  8 10  1  0  0  0  0\n  8 15  1  0  0  0  0\n  9 10  2  0  0  0  0\n  9 16  1  0  0  0  0\n 10 17  1  0  0  0  0\n 12 13  1  0  0  0  0\n 13 18  1  0  0  0  0\n 13 19  1  0  0  0  0\n 13 20  1  0  0  0  0\nM  END\n> <PUBCHEM_COMPOUND_CID>\n2244\n\n> <PUBCHEM_CONFORMER_RMSD>\n0.6\n\n> <PUBCHEM_CONFORMER_DIVERSEORDER>\n1\n11\n10\n3\n15\n17\n13\n5\n16\n7\n14\n9\n8\n4\n18\n6\n12\n2\n\n> <PUBCHEM_MMFF94_PARTIAL_CHARGES>\n18\n1 -0.23\n10 -0.15\n11 0.63\n12 0.66\n13 0.06\n14 0.15\n15 0.15\n16 0.15\n17 0.15\n2 -0.65\n21 0.5\n3 -0.57\n4 -0.57\n5 0.08\n6 0.09\n7 -0.15\n8 -0.15\n9 -0.15\n\n> <PUBCHEM_EFFECTIVE_ROTOR_COUNT>\n3\n\n> <PUBCHEM_PHARMACOPHORE_FEATURES>\n5\n1 2 acceptor\n1 3 acceptor\n1 4 acceptor\n3 2 3 11 anion\n6 5 6 7 8 9 10 rings\n\n> <PUBCHEM_HEAVY_ATOM_COUNT>\n13\n\n> <PUBCHEM_ATOM_DEF_STEREO_COUNT>\n0\n\n> <PUBCHEM_ATOM_UDEF_STEREO_COUNT>\n0\n\n> <PUBCHEM_BOND_DEF_STEREO_COUNT>\n0\n\n> <PUBCHEM_BOND_UDEF_STEREO_COUNT>\n0\n\n> <PUBCHEM_ISOTOPIC_ATOM_COUNT>\n0\n\n> <PUBCHEM_COMPONENT_COUNT>\n1\n\n> <PUBCHEM_CACTVS_TAUTO_COUNT>\n1\n\n> <PUBCHEM_CONFORMER_ID>\n000008C400000001\n\n> <PUBCHEM_MMFF94_ENERGY>\n39.5952\n\n> <PUBCHEM_FEATURE_SELFOVERLAP>\n25.432\n\n> <PUBCHEM_SHAPE_FINGERPRINT>\n1 1 18265615372930943622\n100427 49 16967750034970055351\n12138202 97 18271247217817981012\n12423570 1 16692715976000295083\n12524768 44 16753525617747228747\n12716758 59 18341332292274886536\n13024252 1 17968377969333732145\n14181834 199 17830728755827362645\n14614273 12 18262232214645093005\n15207287 21 17703787037639964108\n15775835 57 18340488876329928641\n16945 1 18271533103414939405\n193761 8 17907860604865584321\n20645476 183 17677348215414174190\n20871998 184 18198632231250704846\n21040471 1 18411412921197846465\n21501502 16 18123463883164380929\n23402539 116 18271795865171824860\n23419403 2 13539898140662769886\n23552423 10 18048876295495619569\n23559900 14 18272369794190581304\n241688 4 16179044415907240795\n257057 1 17478316999871287486\n2748010 2 18339085878070479087\n305870 269 18263645056784260212\n528862 383 18117272558388284091\n53812653 8 18410289211719108569\n7364860 26 17910392788380644719\n81228 2 18050568744116491203\n\n> <PUBCHEM_SHAPE_MULTIPOLES>\n244.06\n3.86\n2.45\n0.89\n1.95\n1.58\n0.15\n-1.85\n0.38\n-0.61\n-0.02\n0.29\n0.01\n-0.33\n\n> <PUBCHEM_SHAPE_SELFOVERLAP>\n513.037\n\n> <PUBCHEM_SHAPE_VOLUME>\n136\n\n> <PUBCHEM_COORDINATE_TYPE>\n2\n5\n10\n\n$$$$\n";
var V3000SdfString = "FYI-001\nFYICenter.com\n123456789012345678901234567890123456789012345678901234567890\n 0  0  0     0  0            999 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 13 14 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 N 0.84 -0.16 0 0\nM  V30 2 N 1.48 0.43 0 0\nM  V30 3 N 0.09 0.27 0 0\nM  V30 4 C 1.11 1.21 0 0\nM  V30 5 C 0.27 1.12 0 0\nM  V30 6 C 0.84 -1.03 0 0\nM  V30 7 C 1.53 1.99 0 0\nM  V30 8 Cl 1.07 2.74 0.01 0\nM  V30 9 C 1.59 -1.46 0 0\nM  V30 10 C 0.08 -1.46 0 0\nM  V30 11 C 1.59 -2.33 0 0\nM  V30 12 C 0.07 -2.32 0 0\nM  V30 13 C 0.84 -2.76 0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 2 1\nM  V30 2 1 3 1\nM  V30 3 1 6 1\nM  V30 4 2 4 2\nM  V30 5 2 5 3\nM  V30 6 1 7 4\nM  V30 7 1 4 5\nM  V30 8 1 9 6\nM  V30 9 2 10 6\nM  V30 10 1 8 7\nM  V30 11 2 11 9\nM  V30 12 1 12 10\nM  V30 13 1 13 11\nM  V30 14 2 13 12\nM  V30 END BOND\nM  V30 END CTAB\nM  END\n> <Comment>\nThis is an SDF example.\nWith a multi-line comment.\n\n> <source>\nThis was retrieved from biotech.fyicenter.com\n\n$$$$\nL-Alanine\nGSMACCS-II07189510252D 1 0.00366 0.00000 0\nFigure 1, J. Chem. Inf. Comput. Sci., Vol 32, No. 3., 1992\n 0 0 0 0 0 999 V3000\nM V30 BEGIN CTAB\nM V30 COUNTS 6 5 0 0 1\nM V30 BEGIN ATOM\nM V30 1 C -0.6622 0.5342 0 0 CFG=2\nM V30 2 C 0.6622 -0.3 0 0\nM V30 3 C -0.7207 2.0817 0 0 MASS=13\nM V30 4 N -1.8622 -0.3695 0 0 CHG=1\nM V30 5 O 0.622 -1.8037 0 0\nM V30 6 O 1.9464 0.4244 0 0 CHG=-1\nM V30 END ATOM\nM V30 BEGIN BOND\nM V30 1 1 1 2\nM V30 2 1 1 3 CFG=1\nM V30 3 1 1 4\nM V30 4 2 2 5\nM V30 5 1 2 6\nM V30 END BOND\nM V30 END CTAB\nM END\n\n$$$$\n";
describe('sdf reader', function () {
    it('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parsed, compound1, compound2, compound3, molFile, dataItems, atoms, bonds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseSdf(SdfString).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError) {
                        throw new Error(parsed.message);
                    }
                    compound1 = parsed.result.compounds[0];
                    compound2 = parsed.result.compounds[1];
                    compound3 = parsed.result.compounds[2];
                    molFile = compound1.molFile, dataItems = compound1.dataItems;
                    atoms = molFile.atoms, bonds = molFile.bonds;
                    expect(parsed.result.compounds.length).toBe(3);
                    // number of structures
                    expect(atoms.count).toBe(5);
                    expect(bonds.count).toBe(4);
                    expect(compound2.molFile.atoms.count).toBe(5);
                    expect(compound2.molFile.bonds.count).toBe(4);
                    expect(atoms.x.value(0)).toBeCloseTo(0, 0.001);
                    expect(atoms.y.value(0)).toBeCloseTo(0.8250, 0.0001);
                    expect(atoms.z.value(0)).toBeCloseTo(0, 0.0001);
                    expect(atoms.type_symbol.value(0)).toBe('O');
                    expect(bonds.atomIdxA.value(3)).toBe(4);
                    expect(bonds.atomIdxB.value(3)).toBe(5);
                    expect(bonds.order.value(3)).toBe(1);
                    expect(dataItems.dataHeader.value(0)).toBe('<DATABASE_ID>');
                    expect(dataItems.data.value(0)).toBe('0');
                    expect(dataItems.dataHeader.value(1)).toBe('<DATABASE_NAME>');
                    expect(dataItems.data.value(1)).toBe('drugbank');
                    expect(dataItems.dataHeader.value(2)).toBe('5225 <TEST_FIELD>');
                    expect(dataItems.data.value(2)).toBe('whatever');
                    expect(dataItems.dataHeader.value(31)).toBe('<SYNONYMS>');
                    expect(dataItems.data.value(31)).toBe('Orthophosphate; Phosphate');
                    expect(compound1.dataItems.data.value(0)).toBe('0');
                    expect(compound2.dataItems.data.value(0)).toBe('1');
                    expect(compound3.dataItems.dataHeader.value(2)).toBe('<PUBCHEM_CONFORMER_DIVERSEORDER>');
                    expect(compound3.dataItems.data.value(2)).toBe('1\n11\n10\n3\n15\n17\n13\n5\n16\n7\n14\n9\n8\n4\n18\n6\n12\n2');
                    expect(compound3.dataItems.dataHeader.value(21)).toBe('<PUBCHEM_COORDINATE_TYPE>');
                    expect(compound3.dataItems.data.value(21)).toBe('2\n5\n10');
                    return [2 /*return*/];
            }
        });
    }); });
    it('charge parsing in V2000', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parsed, compound1, compound2, compound3, formalCharges1, formalCharges2, formalCharges3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseSdf(SdfString).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError) {
                        throw new Error(parsed.message);
                    }
                    compound1 = parsed.result.compounds[0];
                    compound2 = parsed.result.compounds[1];
                    compound3 = parsed.result.compounds[2];
                    formalCharges1 = {
                        atomIdx: compound1.molFile.formalCharges.atomIdx,
                        charge: compound1.molFile.formalCharges.charge
                    };
                    formalCharges2 = {
                        atomIdx: compound2.molFile.formalCharges.atomIdx,
                        charge: compound2.molFile.formalCharges.charge
                    };
                    formalCharges3 = {
                        atomIdx: compound3.molFile.formalCharges.atomIdx,
                        charge: compound3.molFile.formalCharges.charge
                    };
                    expect(formalCharges1.atomIdx.rowCount).toBe(3);
                    expect(formalCharges2.atomIdx.rowCount).toBe(3);
                    expect(formalCharges3.atomIdx.rowCount).toBe(0);
                    expect(formalCharges1.charge.rowCount === formalCharges1.atomIdx.rowCount).toBe(true);
                    expect(formalCharges2.charge.rowCount === formalCharges2.atomIdx.rowCount).toBe(true);
                    expect(formalCharges3.charge.rowCount === formalCharges3.atomIdx.rowCount).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('v3000', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parsed, compound1, i, compound2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseSdf(V3000SdfString).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError) {
                        throw new Error(parsed.message);
                    }
                    expect(parsed.result.compounds.length).toBe(2);
                    compound1 = parsed.result.compounds[0];
                    expect(compound1.molFile.atoms.count).toBe(13);
                    expect(compound1.molFile.atoms.x.rowCount).toBe(13);
                    expect(compound1.molFile.atoms.y.rowCount).toBe(13);
                    expect(compound1.molFile.atoms.z.rowCount).toBe(13);
                    expect(compound1.molFile.atoms.type_symbol.rowCount).toBe(13);
                    expect(compound1.molFile.bonds.count).toBe(14);
                    expect(compound1.molFile.bonds.atomIdxA.rowCount).toBe(14);
                    expect(compound1.molFile.bonds.atomIdxB.rowCount).toBe(14);
                    expect(compound1.molFile.bonds.order.rowCount).toBe(14);
                    expect(compound1.molFile.atoms.x.value(7)).toBe(1.07);
                    expect(compound1.molFile.atoms.y.value(7)).toBe(2.74);
                    expect(compound1.molFile.atoms.z.value(7)).toBe(0.01);
                    expect(compound1.molFile.atoms.type_symbol.value(7)).toBe('Cl');
                    expect(compound1.molFile.bonds.atomIdxA.value(10)).toBe(11);
                    expect(compound1.molFile.bonds.atomIdxB.value(10)).toBe(9);
                    expect(compound1.molFile.bonds.order.value(10)).toBe(2);
                    expect(compound1.molFile.formalCharges.atomIdx.rowCount).toBe(13);
                    for (i = 0; i < compound1.molFile.atoms.count; i++) {
                        expect(compound1.molFile.formalCharges.charge.value(i)).toBe(0);
                    }
                    expect(compound1.dataItems.dataHeader.rowCount).toBe(2);
                    expect(compound1.dataItems.data.rowCount).toBe(2);
                    expect(compound1.dataItems.dataHeader.value(0)).toBe('<Comment>');
                    expect(compound1.dataItems.data.value(0)).toBe("This is an SDF example.\nWith a multi-line comment.");
                    expect(compound1.dataItems.dataHeader.value(1)).toBe('<source>');
                    expect(compound1.dataItems.data.value(1)).toBe('This was retrieved from biotech.fyicenter.com');
                    compound2 = parsed.result.compounds[1];
                    expect(compound2.molFile.atoms.count).toBe(6);
                    expect(compound2.molFile.bonds.count).toBe(5);
                    expect(compound2.molFile.atoms.x.value(4)).toBe(0.622);
                    expect(compound2.molFile.atoms.y.value(4)).toBe(-1.8037);
                    expect(compound2.molFile.atoms.z.value(4)).toBe(0);
                    expect(compound2.molFile.atoms.type_symbol.value(4)).toBe('O');
                    expect(compound2.molFile.bonds.atomIdxA.value(1)).toBe(1);
                    expect(compound2.molFile.bonds.atomIdxB.value(1)).toBe(3);
                    expect(compound2.molFile.bonds.order.value(1)).toBe(1);
                    expect(compound2.dataItems.dataHeader.rowCount).toBe(0);
                    expect(compound2.dataItems.data.rowCount).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
});
