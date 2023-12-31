/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import * as B from 'benchmark';
import * as util from 'util';
import * as fs from 'fs';
import fetch from 'node-fetch';
import { CIF } from '../mol-io/reader/cif';
import { Structure, Queries as Q, StructureElement, StructureSelection, StructureSymmetry, StructureQuery, StructureProperties as SP } from '../mol-model/structure';
// import { Segmentation, OrderedSet } from '../mol-data/int'
import { to_mmCIF } from '../mol-model/structure/export/mmcif';
import { Vec3 } from '../mol-math/linear-algebra';
import { trajectoryFromMmCIF, MmcifFormat } from '../mol-model-formats/structure/mmcif';
// import { printUnits } from '../apps/structure-info/model';
// import { EquivalenceClasses } from '../mol-data/util';
require('util.promisify').shim();
var readFileAsync = util.promisify(fs.readFile);
var writeFileAsync = util.promisify(fs.writeFile);
function readData(path) {
    return __awaiter(this, void 0, void 0, function () {
        var input, data, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!path.match(/\.bcif$/)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFileAsync(path)];
                case 1:
                    input = _a.sent();
                    data = new Uint8Array(input.byteLength);
                    for (i = 0; i < input.byteLength; i++)
                        data[i] = input[i];
                    return [2 /*return*/, data];
                case 2: return [2 /*return*/, readFileAsync(path, 'utf8')];
            }
        });
    });
}
// (Symbol as any).asyncIterator = (Symbol as any).asyncIterator || Symbol.for('Symbol.asyncIterator');
// interface ProgressGenerator<T> extends AsyncIterableIterator<number | T> {
//     next(cont?: boolean): Promise<IteratorResult<number | T>>
// }
// async function *test(): ProgressGenerator<boolean> {
//     const r = yield await new Promise<number>(res => res(10));
//     return r;
// }
// async function runIt(itP: () => ProgressGenerator<boolean>) {
//     const it = itP();
//     while (true) {
//         const { value, done } = await it.next(true);
//         if (done) return value;
//     }
// }
// runIt(test).then(r => console.log('rerdasdasda', r))
export function readCIF(path) {
    return __awaiter(this, void 0, void 0, function () {
        var input, comp, parsed, data, models, structures;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.time('readData');
                    return [4 /*yield*/, readData(path)];
                case 1:
                    input = _a.sent();
                    console.timeEnd('readData');
                    console.time('parse');
                    comp = typeof input === 'string' ? CIF.parseText(input) : CIF.parseBinary(input);
                    return [4 /*yield*/, comp.run()];
                case 2:
                    parsed = _a.sent();
                    console.timeEnd('parse');
                    if (parsed.isError) {
                        throw parsed;
                    }
                    data = parsed.result.blocks[0];
                    console.time('buildModels');
                    return [4 /*yield*/, trajectoryFromMmCIF(data).run()];
                case 3:
                    models = _a.sent();
                    console.timeEnd('buildModels');
                    structures = [Structure.ofModel(models.representative)];
                    return [2 /*return*/, { mmcif: models.representative.sourceData.data, models: models, structures: structures }];
            }
        });
    });
}
var DATA_DIR = './build/data';
if (!fs.existsSync(DATA_DIR))
    fs.mkdirSync(DATA_DIR);
function getBcifUrl(pdbId) {
    return "http://www.ebi.ac.uk/pdbe/coordinates/".concat(pdbId.toLowerCase(), "/full?encoding=bcif");
}
function getBcifPath(pdbId) {
    return "".concat(DATA_DIR, "/").concat(pdbId.toLowerCase(), "_full.bcif");
}
function ensureBcifAvailable(pdbId) {
    return __awaiter(this, void 0, void 0, function () {
        var bcifPath, data, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    bcifPath = getBcifPath(pdbId);
                    if (!!fs.existsSync(bcifPath)) return [3 /*break*/, 4];
                    console.log("downloading ".concat(pdbId, " bcif..."));
                    return [4 /*yield*/, fetch(getBcifUrl(pdbId))];
                case 1:
                    data = _c.sent();
                    _a = writeFileAsync;
                    _b = [bcifPath];
                    return [4 /*yield*/, data.buffer()];
                case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.sent()]))];
                case 3:
                    _c.sent();
                    console.log("done downloading ".concat(pdbId, " bcif"));
                    _c.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
export function getBcif(pdbId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureBcifAvailable(pdbId)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, readCIF(getBcifPath(pdbId))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
export var PropertyAccess;
(function (PropertyAccess) {
    function baseline(model) {
        if (!MmcifFormat.is(model.sourceData))
            throw new Error('Model must be mmCIF');
        var atom_site = model.sourceData.data.db.atom_site;
        var id = atom_site.id.value;
        var s = 0;
        for (var i = 0, _i = atom_site._rowCount; i < _i; i++) {
            s += id(i);
        }
        return s;
    }
    function sumProperty(structure, p) {
        var l = StructureElement.Location.create(structure);
        var s = 0;
        for (var _a = 0, _b = structure.units; _a < _b.length; _a++) {
            var unit = _b[_a];
            l.unit = unit;
            var elements = unit.elements;
            for (var j = 0, _j = elements.length; j < _j; j++) {
                l.element = elements[j];
                s += p(l);
            }
        }
        return s;
    }
    // function sumPropertySegmented(structure: Structure, p: Element.Property<number>) {
    //     const { elements, units } = structure;
    //     const unitIds = ElementSet.unitIndices(elements);
    //     const l = Element.Location();
    //     let s = 0;
    //     let vA = 0, cC = 0, rC = 0;
    //     for (let i = 0, _i = unitIds.length; i < _i; i++) {
    //         const unit = units[unitIds[i]] as Unit.Atomic;
    //         l.unit = unit;
    //         const set = ElementSet.groupAt(elements, i);
    //         const chainsIt = Segmentation.transientSegments(unit.hierarchy.chainSegments, set.elements);
    //         const residues = unit.hierarchy.residueSegments;
    //         while (chainsIt.hasNext) {
    //             cC++;
    //             const chainSegment = chainsIt.move();
    //             const residuesIt = Segmentation.transientSegments(residues, set.elements, chainSegment);
    //             while (residuesIt.hasNext) {
    //                 rC++;
    //                 const residueSegment = residuesIt.move();
    //                 // l.element= OrdSet.getAt(set, residueSegment.start);
    //                 // console.log(unit.hierarchy.residues.auth_comp_id.value(unit.residueIndex[l.atom]), l.atom, OrdSet.getAt(set, residueSegment.end))
    //                 for (let j = residueSegment.start, _j = residueSegment.end; j < _j; j++) {
    //                     l.element= ElementGroup.getAt(set, j);
    //                     vA++;
    //                     s += p(l);
    //                 }
    //             }
    //         }
    //     }
    //     console.log('seg atom count', vA, cC, rC);
    //     return s;
    // }
    // function sumPropertyResidue(structure: Structure, p: Element.Property<number>) {
    //     const { atoms, units } = structure;
    //     const unitIds = ElementSet.unitIds(atoms);
    //     const l = Element.Location();
    //     let s = 0;
    //     for (let i = 0, _i = unitIds.length; i < _i; i++) {
    //         const unit = units[unitIds[i]];
    //         l.unit = unit;
    //         const set = ElementSet.unitGetByIndex(atoms, i);
    //         const residuesIt = Segmentation.transientSegments(unit.hierarchy.residueSegments, set.atoms);
    //         while (residuesIt.hasNext) {
    //             l.element= ElementGroup.getAt(set, residuesIt.move().start);
    //             s += p(l);
    //         }
    //     }
    //     return s;
    // }
    // function sumPropertyAtomSetIt(structure: Structure, p: Element.Property<number>) {
    //     const { elements, units } = structure;
    //     let s = 0;
    //     const atomsIt = ElementSet.elements(elements);
    //     const l = Element.Location();
    //     while (atomsIt.hasNext) {
    //         const a = atomsIt.move();
    //         l.unit = units[Element.unit(a)];
    //         l.element= Element.index(a);
    //         s += p(l);
    //     }
    //     return s;
    // }
    // function sumPropertySegmentedMutable(structure: Structure, p: Property<number>) {
    //     const { atoms, units } = structure;
    //     const unitIds = ElementSet.unitIds(atoms);
    //     const l = Property.createLocation();
    //     let s = 0;
    //     for (let i = 0, _i = unitIds.length; i < _i; i++) {
    //         const unit = units[unitIds[i]];
    //         l.unit = unit;
    //         const set = ElementSet.unitGetByIndex(atoms, i);
    //         const chainsIt = Segmentation.transientSegments(unit.hierarchy.chainSegments, set);
    //         const residuesIt = Segmentation.transientSegments(unit.hierarchy.residueSegments, set);
    //         while (chainsIt.hasNext) {
    //             const chainSegment = chainsIt.move();
    //             residuesIt.updateRange(chainSegment);
    //             while (residuesIt.hasNext) {
    //                 const residueSegment = residuesIt.move();
    //                 for (let j = residueSegment.start, _j = residueSegment.end; j < _j; j++) {
    //                     l.element= OrdSet.getAt(set, j);
    //                     s += p(l);
    //                 }
    //             }
    //         }
    //     }
    //     return s;
    // }
    // function sumDirect(structure: Structure) {
    //     const { atoms, units } = structure;
    //     const unitIds = ElementSet.unitIds(atoms);
    //     let s = 0;
    //     for (let i = 0, _i = unitIds.length; i < _i; i++) {
    //         const unitId = unitIds[i];
    //         const unit = units[unitId];
    //         const set = ElementSet.unitGetByIndex(atoms, i);
    //         //const { residueIndex, chainIndex } = unit;
    //         const p = unit.conformation.atomId.value;
    //         for (let j = 0, _j = ElementGroup.size(set); j < _j; j++) {
    //             const aI = ElementGroup.getAt(set, j);
    //             s += p(aI);
    //         }
    //     }
    //     return s;
    // }
    // function concatProperty(structure: Structure, p: Property<string>) {
    //     const { atoms, units } = structure;
    //     const unitIds = ElementSet.unitIds(atoms);
    //     const l = Property.createLocation(structure);
    //     let s = [];
    //     for (let i = 0, _i = unitIds.length; i < _i; i++) {
    //         const unitId = unitIds[i];
    //         l.unit = units[unitId];
    //         const set = ElementSet.unitGetByIndex(atoms, i);
    //         const { residueIndex, chainIndex } = l.unit;
    //         for (let j = 0, _j = OrdSet.size(set); j < _j; j++) {
    //             const aI = OrdSet.getAt(set, j);
    //             l.element= aI;
    //             l.residueIndex = residueIndex[aI];
    //             l.chainIndex = chainIndex[aI];
    //             s[s.length] = p(l);
    //         }
    //     }
    //     return s;
    // }
    function write(s) {
        console.log(to_mmCIF('test', s));
    }
    PropertyAccess.write = write;
    function testAssembly(id, s) {
        return __awaiter(this, void 0, void 0, function () {
            var a;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.time('assembly');
                        return [4 /*yield*/, StructureSymmetry.buildAssembly(s, '1').run()];
                    case 1:
                        a = _a.sent();
                        // const auth_comp_id = SP.residue.auth_comp_id;
                        // const q1 = Query(Q.generators.atoms({ residueTest: l => auth_comp_id(l) === 'ALA' }));
                        // const alas = await query(q1, a);
                        console.timeEnd('assembly');
                        fs.writeFileSync("".concat(DATA_DIR, "/").concat(id, "_assembly.bcif"), to_mmCIF(id, a, true));
                        // fs.writeFileSync(`${DATA_DIR}/${id}_assembly.bcif`, to_mmCIF(id, Selection.unionStructure(alas), true));
                        console.log('exported');
                        return [2 /*return*/];
                }
            });
        });
    }
    PropertyAccess.testAssembly = testAssembly;
    function testSymmetry(id, s) {
        return __awaiter(this, void 0, void 0, function () {
            var a;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.time('symmetry');
                        return [4 /*yield*/, StructureSymmetry.buildSymmetryRange(s, Vec3.create(-1, -1, -1), Vec3.create(1, 1, 1)).run()];
                    case 1:
                        a = _a.sent();
                        // const auth_comp_id = SP.residue.auth_comp_id;
                        // const q1 = Query(Q.generators.atoms({ residueTest: l => auth_comp_id(l) === 'ALA' }));
                        // const alas = await query(q1, a);
                        console.timeEnd('symmetry');
                        fs.writeFileSync("".concat(DATA_DIR, "/").concat(id, "_symm.bcif"), to_mmCIF(id, a, true));
                        // fs.writeFileSync(`${DATA_DIR}/${id}_assembly.bcif`, to_mmCIF(id, Selection.unionStructure(alas), true));
                        console.log('exported');
                        return [2 /*return*/];
                }
            });
        });
    }
    PropertyAccess.testSymmetry = testSymmetry;
    function testIncludeSurroundings(id, s) {
        return __awaiter(this, void 0, void 0, function () {
            var a, auth_comp_id, op, q1, surr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // const a = s;
                        console.time('symmetry');
                        return [4 /*yield*/, StructureSymmetry.buildSymmetryRange(s, Vec3.create(-2, -2, -2), Vec3.create(2, 2, 2)).run()];
                    case 1:
                        a = _a.sent();
                        auth_comp_id = SP.atom.auth_comp_id, op = SP.unit.operator_name;
                        q1 = Q.modifiers.includeSurroundings(Q.generators.atoms({
                            chainTest: function (l) { return op(l.element) === '1_555'; },
                            atomTest: function (l) { return auth_comp_id(l.element) === 'REA'; }
                        }), {
                            radius: 5,
                            wholeResidues: true
                        });
                        surr = StructureSelection.unionStructure(StructureQuery.run(q1, a));
                        console.timeEnd('symmetry');
                        // for (const u of surr.units) {
                        //     const { atomId } = u.model.atomicConformation;
                        //     console.log(`${u.id}, ${u.conformation.operator.name}`);
                        //     for (let i = 0; i < u.elements.length; i++) {
                        //         console.log(`  ${atomId.value(u.elements[i])}`);
                        //     }
                        // }
                        // const it = surr.elementLocations();
                        // while (it.hasNext) {
                        //     const e = it.move();
                        //     console.log(`${SP.unit.operator_name(e)} ${SP.atom.id(e)}`);
                        // }
                        // fs.writeFileSync(`${DATA_DIR}/${id}_surr.bcif`, to_mmCIF(id, a, true));
                        fs.writeFileSync("".concat(DATA_DIR, "/").concat(id, "_surr.cif"), to_mmCIF(id, surr, false));
                        console.log('exported');
                        return [2 /*return*/];
                }
            });
        });
    }
    PropertyAccess.testIncludeSurroundings = testIncludeSurroundings;
    // export async function testGrouping(structure: Structure) {
    //     const { elements, units } = await Run(Symmetry.buildAssembly(structure, '1'));
    //     console.log('grouping', units.length);
    //     console.log('built asm');
    //     const uniqueGroups = EquivalenceClasses<number, { unit: Unit, group: ElementGroup }>(
    //         ({ unit, group }) => ElementGroup.hashCode(group),
    //         (a, b) => a.unit.model.id === b.unit.model.id && (a.group.key === b.group.key && OrderedSet.areEqual(a.group.elements, b.group.elements))
    //     );
    //     for (let i = 0, _i = ElementSet.groupCount(elements); i < _i; i++) {
    //         const group = ElementSet.groupAt(elements, i);
    //         const unitId = ElementSet.groupUnitIndex(elements, i);
    //         uniqueGroups.add(unitId, { unit: units[unitId], group });
    //     }
    //     console.log('group count', uniqueGroups.groups.length);
    // }
    function query(q, s) {
        return StructureQuery.run(q, s);
    }
    function runBonds() {
        return __awaiter(this, void 0, void 0, function () {
            var structures;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, readCIF('e:/test/quick/3j3q_full.bcif')];
                    case 1:
                        structures = (_a.sent()).structures;
                        console.time('bonds');
                        structures[0].interUnitBonds;
                        console.timeEnd('bonds');
                        return [2 /*return*/];
                }
            });
        });
    }
    PropertyAccess.runBonds = runBonds;
    function run() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, structures, models /* , mmcif */, auth_comp_id, q, P, q1, q2, q3, q2r, col, suite;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, readCIF('e:/test/quick/1cbs_updated.cif')];
                    case 1:
                        _a = _b.sent(), structures = _a.structures, models = _a.models;
                        // const { structures: s1, /* , mmcif */ } = await readCIF('e:/test/quick/1tqn_updated.cif');
                        // testGrouping(structures[0]);
                        // console.log('------');
                        // testGrouping(s1[0]);
                        // const { structures, models/*, mmcif*/ } = await readCIF('e:/test/quick/5j7v_updated.cif');
                        // console.log(mmcif.pdbx_struct_oper_list.matrix.toArray());
                        // console.log(mmcif.pdbx_struct_oper_list.vector.toArray());
                        // await testAssembly('1hrv', structures[0]);
                        // await testSymmetry('1cbs', structures[0]);
                        return [4 /*yield*/, testIncludeSurroundings('1cbs', structures[0])];
                    case 2:
                        // const { structures: s1, /* , mmcif */ } = await readCIF('e:/test/quick/1tqn_updated.cif');
                        // testGrouping(structures[0]);
                        // console.log('------');
                        // testGrouping(s1[0]);
                        // const { structures, models/*, mmcif*/ } = await readCIF('e:/test/quick/5j7v_updated.cif');
                        // console.log(mmcif.pdbx_struct_oper_list.matrix.toArray());
                        // console.log(mmcif.pdbx_struct_oper_list.vector.toArray());
                        // await testAssembly('1hrv', structures[0]);
                        // await testSymmetry('1cbs', structures[0]);
                        _b.sent();
                        // throw '';
                        // console.log(models[0].symmetry.assemblies);
                        // const { structures, models } = await readCIF('e:/test/molstar/3j3q.bcif');
                        // fs.writeFileSync('e:/test/molstar/3j3q.bcif', to_mmCIF('test', structures[0], true));
                        // return;
                        // console.log(toMmCIFString('test', structures[0]));
                        // return;
                        console.log('bs', baseline(models.representative));
                        console.log('sp', sumProperty(structures[0], function (l) { return l.unit.model.atomicConformation.atomId.value(l.element); }));
                        // console.log(sumPropertySegmented(structures[0], l => l.unit.model.atomSiteConformation.atomId.value(l.element)));
                        // console.log(sumPropertySegmentedMutable(structures[0], l => l.unit.model.conformation.atomId.value(l.element));
                        // console.log(sumPropertyAtomSetIt(structures[0], l => l.unit.model.atomSiteConformation.atomId.value(l.element)));
                        // console.log(sumProperty(structures[0], Property.cachedAtomColumn(m => m.conformation.atomId)));
                        // console.log(sumDirect(structures[0]));
                        // console.log('r', sumPropertyResidue(structures[0], l => l.unit.hierarchy.residues.auth_seq_id.value(l.unit.residueIndex[l.atom])));
                        console.time('atom.x');
                        console.log('atom.x', sumProperty(structures[0], SP.atom.x));
                        console.timeEnd('atom.x');
                        console.time('__x');
                        // console.log('__x', sumProperty(structures[0], l => l.unit.conformation.x[l.atom]));
                        console.timeEnd('__x');
                        auth_comp_id = SP.atom.auth_comp_id;
                        q = Q.generators.atoms({ atomTest: Q.pred.eq(function (l) { return SP.atom.auth_comp_id(l.element); }, 'ALA') });
                        P = SP;
                        q1 = (Q.generators.atoms({ atomTest: function (l) { return auth_comp_id(l.element) === 'ALA'; } }));
                        q2 = (Q.generators.atoms({ atomTest: function (l) { return auth_comp_id(l.element) === 'ALA'; }, groupBy: function (l) { return SP.residue.key(l.element); } }));
                        q3 = (Q.generators.atoms({
                            chainTest: Q.pred.inSet(function (l) { return P.chain.auth_asym_id(l.element); }, ['A', 'B', 'C', 'D']),
                            atomTest: Q.pred.eq(function (l) { return P.atom.auth_comp_id(l.element); }, 'ALA')
                        }));
                        return [4 /*yield*/, query(q, structures[0])];
                    case 3:
                        _b.sent();
                        // console.log(to_mmCIF('test', Selection.union(q0r)));
                        console.time('q1');
                        query(q1, structures[0]);
                        console.timeEnd('q1');
                        console.time('q1');
                        query(q1, structures[0]);
                        console.timeEnd('q1');
                        console.time('q2');
                        q2r = query(q2, structures[0]);
                        console.timeEnd('q2');
                        console.log(StructureSelection.structureCount(q2r));
                        col = models.representative.atomicConformation.atomId.value;
                        suite = new B.Suite();
                        suite
                            // .add('test q', () => q1(structures[0]))
                            // .add('test q', () => q(structures[0]))
                            .add('test int', function () { return sumProperty(structures[0], function (l) { return col(l.element); }); })
                            .add('test q1', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, query(q1, structures[0])];
                        }); }); })
                            .add('test q3', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, query(q3, structures[0])];
                        }); }); })
                            // .add('sum residue', () => sumPropertyResidue(structures[0], l => l.unit.hierarchy.residues.auth_seq_id.value(l.unit.residueIndex[l.atom])))
                            // .add('baseline', () =>  baseline(models[0]))
                            // .add('direct', () =>  sumDirect(structures[0]))
                            // .add('normal int', () => sumProperty(structures[0], l => l.unit.model.conformation.atomId.value(l.element))
                            // .add('atom set it int', () => sumPropertyAtomSetIt(structures[0], l => l.unit.conformation.atomId.value(l.element))
                            // .add('segmented faster int', () => sumPropertySegmented(structures[0], l => l.unit.conformation.atomId.value(l.element))
                            // .add('faster int', () => sumProperty(structures[0], l => l.unit.conformation.atomId.value(l.element))
                            // .add('segmented faster _x', () => sumPropertySegmented(structures[0], l => l.unit.conformation.__x[l.atom]))
                            // .add('faster _x', () => sumProperty(structures[0], l => l.unit.conformation.__x[l.atom] +  l.unit.conformation.__y[l.atom] +  l.unit.conformation.__z[l.atom]))
                            // .add('segmented mut faster int', () => sumPropertySegmentedMutable(structures[0], l => l.unit.conformation.atomId.value(l.element))
                            // .add('normal shortcut int', () => sumProperty(structures[0], l => l.conformation.atomId.value(l.element))
                            // .add('cached int', () => sumProperty(structures[0], Property.cachedAtomColumn(m => m.conformation.atomId)))
                            // .add('concat str', () => concatProperty(structures[0], l => l.unit.model.hierarchy.atoms.auth_atom_id.value(l.element))
                            // .add('cached concat str', () => concatProperty(structures[0], Property.cachedAtomColumn(m => m.hierarchy.atoms.auth_atom_id)))
                            .on('cycle', function (e) { return console.log(String(e.target)); })
                            .run();
                        return [2 /*return*/];
                }
            });
        });
    }
    PropertyAccess.run = run;
})(PropertyAccess || (PropertyAccess = {}));
PropertyAccess.runBonds();
