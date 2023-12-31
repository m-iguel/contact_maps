/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { Segmentation, SortedArray } from '../../../../mol-data/int';
import { StructureSelection } from '../selection';
import { UniqueStructuresBuilder } from '../utils/builders';
import { StructureUniqueSubsetBuilder } from '../../structure/util/unique-subset-builder';
import { structureIntersect, structureSubtract, structureUnion } from '../utils/structure-set';
import { UniqueArray } from '../../../../mol-data/generic';
import { StructureElement } from '../../structure/element';
import { MmcifFormat } from '../../../../mol-model-formats/structure/mmcif';
import { ResidueSet } from '../../model/properties/utils/residue-set';
import { StructureProperties } from '../../structure/properties';
import { arraySetAdd } from '../../../../mol-util/array';
function getWholeResidues(ctx, source, structure) {
    var builder = source.subsetBuilder(true);
    for (var _a = 0, _b = structure.units; _a < _b.length; _a++) {
        var unit = _b[_a];
        if (unit.kind !== 0 /* Unit.Kind.Atomic */) {
            // just copy non-atomic units.
            builder.setUnit(unit.id, unit.elements);
            continue;
        }
        var residueAtomSegments = unit.model.atomicHierarchy.residueAtomSegments;
        var sourceElements = source.unitMap.get(unit.id).elements;
        var elements = unit.elements;
        builder.beginUnit(unit.id);
        var residuesIt = Segmentation.transientSegments(residueAtomSegments, elements);
        while (residuesIt.hasNext) {
            var rI = residuesIt.move().index;
            for (var j = residueAtomSegments.offsets[rI], _j = residueAtomSegments.offsets[rI + 1]; j < _j; j++) {
                if (SortedArray.has(sourceElements, j))
                    builder.addElement(j);
            }
        }
        builder.commitUnit();
        ctx.throwIfTimedOut();
    }
    return builder.getStructure();
}
export function wholeResidues(query) {
    return function query_wholeResidues(ctx) {
        var inner = query(ctx);
        if (StructureSelection.isSingleton(inner)) {
            return StructureSelection.Singletons(ctx.inputStructure, getWholeResidues(ctx, ctx.inputStructure, inner.structure));
        }
        else {
            var builder = new UniqueStructuresBuilder(ctx.inputStructure);
            for (var _a = 0, _b = inner.structures; _a < _b.length; _a++) {
                var s = _b[_a];
                builder.add(getWholeResidues(ctx, ctx.inputStructure, s));
            }
            return builder.getSelection();
        }
    };
}
function getIncludeSurroundings(ctx, source, structure, params) {
    var builder = new StructureUniqueSubsetBuilder(source);
    var lookup = source.lookup3d;
    var r = params.radius;
    for (var _a = 0, _b = structure.units; _a < _b.length; _a++) {
        var unit = _b[_a];
        var _c = unit.conformation, x = _c.x, y = _c.y, z = _c.z;
        var elements = unit.elements;
        for (var i = 0, _i = elements.length; i < _i; i++) {
            var e = elements[i];
            lookup.findIntoBuilder(x(e), y(e), z(e), r, builder);
        }
        ctx.throwIfTimedOut();
    }
    return !!params.wholeResidues ? getWholeResidues(ctx, source, builder.getStructure()) : builder.getStructure();
}
function getIncludeSurroundingsWithRadius(ctx, source, structure, params) {
    var builder = new StructureUniqueSubsetBuilder(source);
    var lookup = source.lookup3d;
    var elementRadius = params.elementRadius, elementRadiusClosure = params.elementRadiusClosure, sourceMaxRadius = params.sourceMaxRadius, radius = params.radius;
    ctx.pushCurrentElement();
    ctx.element.structure = structure;
    for (var _a = 0, _b = structure.units; _a < _b.length; _a++) {
        var unit = _b[_a];
        ctx.element.unit = unit;
        var _c = unit.conformation, x = _c.x, y = _c.y, z = _c.z;
        var elements = unit.elements;
        for (var i = 0, _i = elements.length; i < _i; i++) {
            var e = elements[i];
            ctx.element.element = e;
            var eRadius = elementRadius(ctx);
            lookup.findIntoBuilderWithRadius(x(e), y(e), z(e), eRadius, sourceMaxRadius, radius, elementRadiusClosure, builder);
        }
        ctx.throwIfTimedOut();
    }
    ctx.popCurrentElement();
    return !!params.wholeResidues ? getWholeResidues(ctx, source, builder.getStructure()) : builder.getStructure();
}
function createElementRadiusFn(ctx, eRadius) {
    return function (e) {
        ctx.element.structure = e.structure;
        ctx.element.unit = e.unit;
        ctx.element.element = e.element;
        return eRadius(ctx);
    };
}
function findStructureRadius(ctx, eRadius) {
    var r = 0;
    ctx.element.structure = ctx.inputStructure;
    for (var _a = 0, _b = ctx.inputStructure.units; _a < _b.length; _a++) {
        var unit = _b[_a];
        ctx.element.unit = unit;
        var elements = unit.elements;
        for (var i = 0, _i = elements.length; i < _i; i++) {
            var e = elements[i];
            ctx.element.element = e;
            var eR = eRadius(ctx);
            if (eR > r)
                r = eR;
        }
    }
    ctx.throwIfTimedOut();
    return r;
}
export function includeSurroundings(query, params) {
    return function query_includeSurroundings(ctx) {
        var inner = query(ctx);
        if (params.elementRadius) {
            var prms = __assign(__assign({}, params), { elementRadius: params.elementRadius, elementRadiusClosure: createElementRadiusFn(ctx, params.elementRadius), sourceMaxRadius: findStructureRadius(ctx, params.elementRadius) });
            if (StructureSelection.isSingleton(inner)) {
                var surr = getIncludeSurroundingsWithRadius(ctx, ctx.inputStructure, inner.structure, prms);
                var ret = StructureSelection.Singletons(ctx.inputStructure, surr);
                return ret;
            }
            else {
                var builder = new UniqueStructuresBuilder(ctx.inputStructure);
                for (var _a = 0, _b = inner.structures; _a < _b.length; _a++) {
                    var s = _b[_a];
                    builder.add(getIncludeSurroundingsWithRadius(ctx, ctx.inputStructure, s, prms));
                }
                return builder.getSelection();
            }
        }
        if (StructureSelection.isSingleton(inner)) {
            var surr = getIncludeSurroundings(ctx, ctx.inputStructure, inner.structure, params);
            var ret = StructureSelection.Singletons(ctx.inputStructure, surr);
            return ret;
        }
        else {
            var builder = new UniqueStructuresBuilder(ctx.inputStructure);
            for (var _c = 0, _d = inner.structures; _c < _d.length; _c++) {
                var s = _d[_c];
                builder.add(getIncludeSurroundings(ctx, ctx.inputStructure, s, params));
            }
            return builder.getSelection();
        }
    };
}
export function querySelection(selection, query) {
    return function query_querySelection(ctx) {
        var targetSel = selection(ctx);
        if (StructureSelection.structureCount(targetSel) === 0)
            return targetSel;
        var ret = StructureSelection.UniqueBuilder(ctx.inputStructure);
        var add = function (s) { return ret.add(s); };
        StructureSelection.forEach(targetSel, function (s, sI) {
            ctx.pushInputStructure(s);
            StructureSelection.forEach(query(ctx), add);
            ctx.popInputStructure();
            if (sI % 10 === 0)
                ctx.throwIfTimedOut();
        });
        return ret.getSelection();
    };
}
export function intersectBy(query, by) {
    return function query_intersectBy(ctx) {
        var selection = query(ctx);
        if (StructureSelection.structureCount(selection) === 0)
            return selection;
        var bySel = by(ctx);
        if (StructureSelection.structureCount(bySel) === 0)
            return StructureSelection.Empty(ctx.inputStructure);
        var unionBy = StructureSelection.unionStructure(bySel);
        var ret = StructureSelection.UniqueBuilder(ctx.inputStructure);
        StructureSelection.forEach(selection, function (s, sI) {
            var ii = structureIntersect(unionBy, s);
            if (ii.elementCount !== 0)
                ret.add(ii);
            if (sI % 50 === 0)
                ctx.throwIfTimedOut();
        });
        return ret.getSelection();
    };
}
export function exceptBy(query, by) {
    return function query_exceptBy(ctx) {
        var selection = query(ctx);
        if (StructureSelection.structureCount(selection) === 0)
            return selection;
        var bySel = by(ctx);
        if (StructureSelection.structureCount(bySel) === 0)
            return selection;
        var subtractBy = StructureSelection.unionStructure(bySel);
        var ret = StructureSelection.UniqueBuilder(ctx.inputStructure);
        StructureSelection.forEach(selection, function (s, sI) {
            var diff = structureSubtract(s, subtractBy);
            if (diff.elementCount !== 0)
                ret.add(diff);
            if (sI % 50 === 0)
                ctx.throwIfTimedOut();
        });
        return ret.getSelection();
    };
}
export function union(query) {
    return function query_union(ctx) {
        var ret = StructureSelection.LinearBuilder(ctx.inputStructure);
        ret.add(StructureSelection.unionStructure(query(ctx)));
        return ret.getSelection();
    };
}
export function expandProperty(query, property) {
    return function query_expandProperty(ctx) {
        var src = query(ctx);
        var propertyToStructureIndexMap = new Map();
        var builders = [];
        ctx.pushCurrentElement();
        StructureSelection.forEach(src, function (s, sI) {
            ctx.element.structure = s;
            for (var _a = 0, _b = s.units; _a < _b.length; _a++) {
                var unit = _b[_a];
                ctx.element.unit = unit;
                var elements = unit.elements;
                for (var i = 0, _i = elements.length; i < _i; i++) {
                    ctx.element.element = elements[i];
                    var p = property(ctx);
                    var arr = void 0;
                    if (propertyToStructureIndexMap.has(p))
                        arr = propertyToStructureIndexMap.get(p);
                    else {
                        arr = UniqueArray.create();
                        propertyToStructureIndexMap.set(p, arr);
                    }
                    UniqueArray.add(arr, sI, sI);
                }
            }
            builders[sI] = ctx.inputStructure.subsetBuilder(true);
            if (sI % 10 === 0)
                ctx.throwIfTimedOut();
        });
        ctx.element.structure = ctx.inputStructure;
        for (var _a = 0, _b = ctx.inputStructure.units; _a < _b.length; _a++) {
            var unit = _b[_a];
            ctx.element.unit = unit;
            var elements = unit.elements;
            for (var i = 0, _i = elements.length; i < _i; i++) {
                ctx.element.element = elements[i];
                var p = property(ctx);
                if (!propertyToStructureIndexMap.has(p))
                    continue;
                var indices = propertyToStructureIndexMap.get(p).array;
                for (var _sI = 0, __sI = indices.length; _sI < __sI; _sI++) {
                    builders[indices[_sI]].addToUnit(unit.id, elements[i]);
                }
            }
        }
        ctx.popCurrentElement();
        var ret = StructureSelection.UniqueBuilder(ctx.inputStructure);
        for (var _c = 0, builders_1 = builders; _c < builders_1.length; _c++) {
            var b = builders_1[_c];
            ret.add(b.getStructure());
        }
        return ret.getSelection();
    };
}
export function includeConnected(_a) {
    var query = _a.query, layerCount = _a.layerCount, wholeResidues = _a.wholeResidues, bondTest = _a.bondTest, fixedPoint = _a.fixedPoint;
    var lc = Math.max(layerCount, 0);
    return function query_includeConnected(ctx) {
        var builder = StructureSelection.UniqueBuilder(ctx.inputStructure);
        var src = query(ctx);
        ctx.pushCurrentBond();
        ctx.atomicBond.setTestFn(bondTest);
        StructureSelection.forEach(src, function (s, sI) {
            var incl = s;
            if (fixedPoint) {
                while (true) {
                    var prevCount = incl.elementCount;
                    incl = includeConnectedStep(ctx, wholeResidues, incl);
                    if (incl.elementCount === prevCount)
                        break;
                }
            }
            else {
                for (var i = 0; i < lc; i++) {
                    incl = includeConnectedStep(ctx, wholeResidues, incl);
                }
            }
            builder.add(incl);
            if (sI % 10 === 0)
                ctx.throwIfTimedOut();
        });
        ctx.popCurrentBond();
        return builder.getSelection();
    };
}
function includeConnectedStep(ctx, wholeResidues, structure) {
    var expanded = expandConnected(ctx, structure);
    if (wholeResidues)
        return getWholeResidues(ctx, ctx.inputStructure, expanded);
    return expanded;
}
function expandConnected(ctx, structure) {
    var inputStructure = ctx.inputStructure;
    var interBonds = inputStructure.interUnitBonds;
    var builder = new StructureUniqueSubsetBuilder(inputStructure);
    var atomicBond = ctx.atomicBond;
    // Process intra unit bonds
    for (var _a = 0, _b = structure.units; _a < _b.length; _a++) {
        var unit = _b[_a];
        if (unit.kind !== 0 /* Unit.Kind.Atomic */) {
            // add the whole unit
            builder.beginUnit(unit.id);
            for (var i = 0, _i = unit.elements.length; i < _i; i++) {
                builder.addElement(unit.elements[i]);
            }
            builder.commitUnit();
            continue;
        }
        var inputUnitA = inputStructure.unitMap.get(unit.id);
        var _c = inputUnitA.bonds, intraBondOffset = _c.offset, intraBondB = _c.b, _d = _c.edgeProps, flags = _d.flags, order = _d.order, key = _d.key;
        atomicBond.setStructure(inputStructure);
        // Process intra unit bonds
        atomicBond.a.unit = inputUnitA;
        atomicBond.b.unit = inputUnitA;
        for (var i = 0, _i = unit.elements.length; i < _i; i++) {
            // add the current element
            builder.addToUnit(unit.id, unit.elements[i]);
            var aIndex = SortedArray.indexOf(inputUnitA.elements, unit.elements[i]);
            // check intra unit bonds
            for (var lI = intraBondOffset[aIndex], _lI = intraBondOffset[aIndex + 1]; lI < _lI; lI++) {
                var bIndex = intraBondB[lI];
                var bElement = inputUnitA.elements[bIndex];
                // Check if the element is already present:
                if (SortedArray.has(unit.elements, bElement) || builder.has(unit.id, bElement))
                    continue;
                atomicBond.aIndex = aIndex;
                atomicBond.a.element = unit.elements[i];
                atomicBond.bIndex = bIndex;
                atomicBond.b.element = bElement;
                atomicBond.type = flags[lI];
                atomicBond.order = order[lI];
                atomicBond.key = key[lI];
                if (atomicBond.test(ctx, true)) {
                    builder.addToUnit(unit.id, bElement);
                }
            }
        }
        // Process inter unit bonds
        for (var _e = 0, _f = interBonds.getConnectedUnits(inputUnitA.id); _e < _f.length; _e++) {
            var bondedUnit = _f[_e];
            var currentUnitB = structure.unitMap.get(bondedUnit.unitB);
            var inputUnitB = inputStructure.unitMap.get(bondedUnit.unitB);
            for (var _g = 0, _h = bondedUnit.connectedIndices; _g < _h.length; _g++) {
                var aI = _h[_g];
                // check if the element is in the expanded structure
                if (!SortedArray.has(unit.elements, inputUnitA.elements[aI]))
                    continue;
                for (var _k = 0, _l = bondedUnit.getEdges(aI); _k < _l.length; _k++) {
                    var bond = _l[_k];
                    var bElement = inputUnitB.elements[bond.indexB];
                    // Check if the element is already present:
                    if ((currentUnitB && SortedArray.has(currentUnitB.elements, bElement)) || builder.has(bondedUnit.unitB, bElement))
                        continue;
                    atomicBond.a.unit = inputUnitA;
                    atomicBond.aIndex = aI;
                    atomicBond.a.element = inputUnitA.elements[aI];
                    atomicBond.b.unit = inputUnitB;
                    atomicBond.bIndex = bond.indexB;
                    atomicBond.b.element = bElement;
                    atomicBond.type = bond.props.flag;
                    atomicBond.order = bond.props.order;
                    atomicBond.key = bond.props.key;
                    if (atomicBond.test(ctx, true)) {
                        builder.addToUnit(bondedUnit.unitB, bElement);
                    }
                }
            }
        }
    }
    return builder.getStructure();
}
/**
 * Includes expanded surrounding ligands based on radius from the source, struct_conn entries & pdbx_molecule entries.
 */
export function surroundingLigands(_a) {
    var query = _a.query, radius = _a.radius, includeWater = _a.includeWater;
    return function query_surroundingLigands(ctx) {
        var inner = StructureSelection.unionStructure(query(ctx));
        var surroundings = getWholeResidues(ctx, ctx.inputStructure, getIncludeSurroundings(ctx, ctx.inputStructure, inner, { radius: radius }));
        var prd = getPrdAsymIdx(ctx.inputStructure);
        var graph = getStructConnInfo(ctx.inputStructure);
        var l = StructureElement.Location.create(surroundings);
        var includedPrdChains = new Map();
        var componentResidues = new ResidueSet({ checkOperator: true });
        for (var _a = 0, _b = surroundings.units; _a < _b.length; _a++) {
            var unit = _b[_a];
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            var elements = unit.elements;
            var chainsIt = Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, elements);
            var residuesIt = Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
            while (chainsIt.hasNext) {
                var chainSegment = chainsIt.move();
                l.element = elements[chainSegment.start];
                var asym_id = StructureProperties.chain.label_asym_id(l);
                var op_name = StructureProperties.unit.operator_name(l);
                // check for PRD molecules
                if (prd.has(asym_id)) {
                    if (includedPrdChains.has(asym_id)) {
                        arraySetAdd(includedPrdChains.get(asym_id), op_name);
                    }
                    else {
                        includedPrdChains.set(asym_id, [op_name]);
                    }
                    continue;
                }
                var entityType = StructureProperties.entity.type(l);
                // test entity and chain
                if (entityType === 'water' || entityType === 'polymer')
                    continue;
                residuesIt.setSegment(chainSegment);
                while (residuesIt.hasNext) {
                    var residueSegment = residuesIt.move();
                    l.element = elements[residueSegment.start];
                    graph.addComponent(ResidueSet.getEntryFromLocation(l), componentResidues);
                }
            }
            ctx.throwIfTimedOut();
        }
        // assemble the core structure
        var builder = ctx.inputStructure.subsetBuilder(true);
        for (var _c = 0, _d = ctx.inputStructure.units; _c < _d.length; _c++) {
            var unit = _d[_c];
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            var elements = unit.elements;
            var chainsIt = Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, elements);
            var residuesIt = Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
            builder.beginUnit(unit.id);
            while (chainsIt.hasNext) {
                var chainSegment = chainsIt.move();
                l.element = elements[chainSegment.start];
                var asym_id = StructureProperties.chain.label_asym_id(l);
                var op_name = StructureProperties.unit.operator_name(l);
                if (includedPrdChains.has(asym_id) && includedPrdChains.get(asym_id).indexOf(op_name) >= 0) {
                    builder.addElementRange(elements, chainSegment.start, chainSegment.end);
                    continue;
                }
                if (!componentResidues.hasLabelAsymId(asym_id)) {
                    continue;
                }
                residuesIt.setSegment(chainSegment);
                while (residuesIt.hasNext) {
                    var residueSegment = residuesIt.move();
                    l.element = elements[residueSegment.start];
                    if (!componentResidues.has(l))
                        continue;
                    builder.addElementRange(elements, residueSegment.start, residueSegment.end);
                }
            }
            builder.commitUnit();
            ctx.throwIfTimedOut();
        }
        var components = structureUnion(ctx.inputStructure, [builder.getStructure(), inner]);
        // add water
        if (includeWater) {
            var finalBuilder = new StructureUniqueSubsetBuilder(ctx.inputStructure);
            var lookup = ctx.inputStructure.lookup3d;
            for (var _e = 0, _f = components.units; _e < _f.length; _e++) {
                var unit = _f[_e];
                var _g = unit.conformation, x = _g.x, y = _g.y, z = _g.z;
                var elements = unit.elements;
                for (var i = 0, _i = elements.length; i < _i; i++) {
                    var e = elements[i];
                    lookup.findIntoBuilderIf(x(e), y(e), z(e), radius, finalBuilder, testIsWater);
                    finalBuilder.addToUnit(unit.id, e);
                }
                ctx.throwIfTimedOut();
            }
            return StructureSelection.Sequence(ctx.inputStructure, [finalBuilder.getStructure()]);
        }
        else {
            return StructureSelection.Sequence(ctx.inputStructure, [components]);
        }
    };
}
var _entity_type = StructureProperties.entity.type;
function testIsWater(l) {
    return _entity_type(l) === 'water';
}
function getPrdAsymIdx(structure) {
    var model = structure.models[0];
    var ids = new Set();
    if (!MmcifFormat.is(model.sourceData))
        return ids;
    var _a = model.sourceData.data.db.pdbx_molecule, _rowCount = _a._rowCount, asym_id = _a.asym_id;
    for (var i = 0; i < _rowCount; i++) {
        ids.add(asym_id.value(i));
    }
    return ids;
}
function getStructConnInfo(structure) {
    var _a, _b;
    var model = structure.models[0];
    var graph = new StructConnGraph();
    if (!MmcifFormat.is(model.sourceData))
        return graph;
    var struct_conn = model.sourceData.data.db.struct_conn;
    var conn_type_id = struct_conn.conn_type_id;
    var ptnr1_label_asym_id = struct_conn.ptnr1_label_asym_id, ptnr1_label_comp_id = struct_conn.ptnr1_label_comp_id, ptnr1_label_seq_id = struct_conn.ptnr1_label_seq_id, ptnr1_symmetry = struct_conn.ptnr1_symmetry, pdbx_ptnr1_label_alt_id = struct_conn.pdbx_ptnr1_label_alt_id, pdbx_ptnr1_PDB_ins_code = struct_conn.pdbx_ptnr1_PDB_ins_code;
    var ptnr2_label_asym_id = struct_conn.ptnr2_label_asym_id, ptnr2_label_comp_id = struct_conn.ptnr2_label_comp_id, ptnr2_label_seq_id = struct_conn.ptnr2_label_seq_id, ptnr2_symmetry = struct_conn.ptnr2_symmetry, pdbx_ptnr2_label_alt_id = struct_conn.pdbx_ptnr2_label_alt_id, pdbx_ptnr2_PDB_ins_code = struct_conn.pdbx_ptnr2_PDB_ins_code;
    for (var i = 0; i < struct_conn._rowCount; i++) {
        var bondType = conn_type_id.value(i);
        if (bondType !== 'covale' && bondType !== 'metalc')
            continue;
        var a = {
            label_asym_id: ptnr1_label_asym_id.value(i),
            label_comp_id: ptnr1_label_comp_id.value(i),
            label_seq_id: ptnr1_label_seq_id.value(i),
            label_alt_id: pdbx_ptnr1_label_alt_id.value(i),
            ins_code: pdbx_ptnr1_PDB_ins_code.value(i),
            operator_name: (_a = ptnr1_symmetry.value(i)) !== null && _a !== void 0 ? _a : '1_555'
        };
        var b = {
            label_asym_id: ptnr2_label_asym_id.value(i),
            label_comp_id: ptnr2_label_comp_id.value(i),
            label_seq_id: ptnr2_label_seq_id.value(i),
            label_alt_id: pdbx_ptnr2_label_alt_id.value(i),
            ins_code: pdbx_ptnr2_PDB_ins_code.value(i),
            operator_name: (_b = ptnr2_symmetry.value(i)) !== null && _b !== void 0 ? _b : '1_555'
        };
        graph.addEdge(a, b);
    }
    return graph;
}
var StructConnGraph = /** @class */ (function () {
    function StructConnGraph() {
        this.vertices = new Map();
        this.edges = new Map();
    }
    StructConnGraph.prototype.addVertex = function (e, label) {
        if (this.vertices.has(label))
            return;
        this.vertices.set(label, e);
        this.edges.set(label, []);
    };
    StructConnGraph.prototype.addEdge = function (a, b) {
        var al = ResidueSet.getLabel(a);
        var bl = ResidueSet.getLabel(b);
        this.addVertex(a, al);
        this.addVertex(b, bl);
        arraySetAdd(this.edges.get(al), bl);
        arraySetAdd(this.edges.get(bl), al);
    };
    StructConnGraph.prototype.addComponent = function (start, set) {
        var startLabel = ResidueSet.getLabel(start);
        if (!this.vertices.has(startLabel)) {
            set.add(start);
            return;
        }
        var visited = new Set();
        var added = new Set();
        var stack = [startLabel];
        added.add(startLabel);
        set.add(start);
        while (stack.length > 0) {
            var a = stack.pop();
            visited.add(a);
            var u = this.vertices.get(a);
            for (var _a = 0, _b = this.edges.get(a); _a < _b.length; _a++) {
                var b = _b[_a];
                if (visited.has(b))
                    continue;
                stack.push(b);
                if (added.has(b))
                    continue;
                added.add(b);
                var v = this.vertices.get(b);
                if (u.operator_name === v.operator_name) {
                    set.add(__assign(__assign({}, v), { operator_name: start.operator_name }));
                }
                else {
                    set.add(v);
                }
            }
        }
    };
    return StructConnGraph;
}());
// TODO: unionBy (skip this one?), cluster
