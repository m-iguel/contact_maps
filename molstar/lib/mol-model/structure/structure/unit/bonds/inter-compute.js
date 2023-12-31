/**
 * Copyright (c) 2017-2023 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { Structure } from '../../structure';
import { Unit } from '../../unit';
import { getElementIdx, getElementThreshold, isHydrogen, MetalsSet, DefaultBondComputationProps, getPairingThreshold } from './common';
import { InterUnitBonds } from './data';
import { SortedArray } from '../../../../../mol-data/int';
import { Vec3, Mat4 } from '../../../../../mol-math/linear-algebra';
import { getInterBondOrderFromTable } from '../../../model/properties/atomic/bonds';
import { IndexPairBonds } from '../../../../../mol-model-formats/structure/property/bonds/index-pair';
import { InterUnitGraph } from '../../../../../mol-math/graph/inter-unit-graph';
import { StructConn } from '../../../../../mol-model-formats/structure/property/bonds/struct_conn';
import { equalEps } from '../../../../../mol-math/linear-algebra/3d/common';
import { Model } from '../../../model';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var v3distance = Vec3.distance;
var v3set = Vec3.set;
var v3squaredDistance = Vec3.squaredDistance;
var v3transformMat4 = Vec3.transformMat4;
var tmpDistVecA = Vec3();
var tmpDistVecB = Vec3();
function getDistance(unitA, indexA, unitB, indexB) {
    unitA.conformation.position(indexA, tmpDistVecA);
    unitB.conformation.position(indexB, tmpDistVecB);
    return v3distance(tmpDistVecA, tmpDistVecB);
}
var _imageTransform = Mat4();
var _imageA = Vec3();
function findPairBonds(unitA, unitB, props, builder) {
    var maxRadius = props.maxRadius;
    var atomsA = unitA.elements, residueIndexA = unitA.residueIndex;
    var _a = unitA.model.atomicConformation, xA = _a.x, yA = _a.y, zA = _a.z;
    var atomsB = unitB.elements, residueIndexB = unitB.residueIndex;
    var atomCount = unitA.elements.length;
    var _b = unitA.model.atomicHierarchy.atoms, type_symbolA = _b.type_symbol, label_alt_idA = _b.label_alt_id, label_atom_idA = _b.label_atom_id, label_comp_idA = _b.label_comp_id;
    var _c = unitB.model.atomicHierarchy.atoms, type_symbolB = _c.type_symbol, label_alt_idB = _c.label_alt_id, label_atom_idB = _c.label_atom_id, label_comp_idB = _c.label_comp_id;
    var auth_seq_idA = unitA.model.atomicHierarchy.residues.auth_seq_id;
    var auth_seq_idB = unitB.model.atomicHierarchy.residues.auth_seq_id;
    var occupancyA = unitA.model.atomicConformation.occupancy;
    var occupancyB = unitB.model.atomicConformation.occupancy;
    var hasOccupancy = occupancyA.isDefined && occupancyB.isDefined;
    var structConn = unitA.model === unitB.model && StructConn.Provider.get(unitA.model);
    var indexPairs = !props.forceCompute && unitA.model === unitB.model && IndexPairBonds.Provider.get(unitA.model);
    var sourceIndex = unitA.model.atomicHierarchy.atomSourceIndex;
    var invertedIndex = (indexPairs ? Model.getInvertedAtomSourceIndex(unitB.model) : { invertedIndex: void 0 }).invertedIndex;
    var structConnExhaustive = unitA.model === unitB.model && StructConn.isExhaustive(unitA.model);
    // the lookup queries need to happen in the "unitB space".
    // that means _imageA = inverseOperB(operA(aI))
    var imageTransform = Mat4.mul(_imageTransform, unitB.conformation.operator.inverse, unitA.conformation.operator.matrix);
    var isNotIdentity = !Mat4.isIdentity(imageTransform);
    var _d = unitB.boundary.sphere, bCenter = _d.center, bRadius = _d.radius;
    var testDistanceSq = (bRadius + maxRadius) * (bRadius + maxRadius);
    builder.startUnitPair(unitA.id, unitB.id);
    var opKeyA = unitA.conformation.operator.key;
    var opKeyB = unitB.conformation.operator.key;
    for (var _aI = 0; _aI < atomCount; _aI++) {
        var aI = atomsA[_aI];
        v3set(_imageA, xA[aI], yA[aI], zA[aI]);
        if (isNotIdentity)
            v3transformMat4(_imageA, _imageA, imageTransform);
        if (v3squaredDistance(_imageA, bCenter) > testDistanceSq)
            continue;
        if (!props.forceCompute && indexPairs) {
            var maxDistance = indexPairs.maxDistance;
            var _e = indexPairs.bonds, offset = _e.offset, b = _e.b, _f = _e.edgeProps, order = _f.order, distance = _f.distance, flag = _f.flag, key = _f.key, operatorA = _f.operatorA, operatorB = _f.operatorB;
            var srcA = sourceIndex.value(aI);
            var aeI_1 = getElementIdx(type_symbolA.value(aI));
            for (var i = offset[srcA], il = offset[srcA + 1]; i < il; ++i) {
                var bI = invertedIndex[b[i]];
                var _bI = SortedArray.indexOf(unitB.elements, bI);
                if (_bI < 0)
                    continue;
                var opA = operatorA[i];
                var opB = operatorB[i];
                if ((opA >= 0 && opA !== opKeyA && opA !== opKeyB) ||
                    (opB >= 0 && opB !== opKeyB && opB !== opKeyA))
                    continue;
                var beI = getElementIdx(type_symbolA.value(bI));
                var d = distance[i];
                var dist = getDistance(unitA, aI, unitB, bI);
                var add = false;
                if (d >= 0) {
                    add = equalEps(dist, d, 0.3);
                }
                else if (maxDistance >= 0) {
                    add = dist < maxDistance;
                }
                else {
                    var pairingThreshold = getPairingThreshold(aeI_1, beI, getElementThreshold(aeI_1), getElementThreshold(beI));
                    add = dist < pairingThreshold;
                    if (isHydrogen(aeI_1) && isHydrogen(beI)) {
                        // TODO handle molecular hydrogen
                        add = false;
                    }
                }
                if (add) {
                    builder.add(_aI, _bI, { order: order[i], flag: flag[i], key: key[i] });
                }
            }
            continue; // assume `indexPairs` supplies all bonds
        }
        var structConnEntries = props.forceCompute ? void 0 : structConn && structConn.byAtomIndex.get(aI);
        if (structConnEntries && structConnEntries.length) {
            var added = false;
            for (var _g = 0, structConnEntries_1 = structConnEntries; _g < structConnEntries_1.length; _g++) {
                var se = structConnEntries_1[_g];
                var partnerA = se.partnerA, partnerB = se.partnerB;
                var p = partnerA.atomIndex === aI ? partnerB : partnerA;
                var _bI = SortedArray.indexOf(unitB.elements, p.atomIndex);
                if (_bI < 0)
                    continue;
                // check if the bond is within MAX_RADIUS for this pair of units
                if (getDistance(unitA, aI, unitB, p.atomIndex) > maxRadius)
                    continue;
                builder.add(_aI, _bI, { order: se.order, flag: se.flags, key: se.rowIndex });
                added = true;
            }
            // assume, for an atom, that if any inter unit bond is given
            // all are given and thus we don't need to compute any other
            if (added)
                continue;
        }
        if (structConnExhaustive)
            continue;
        var occA = occupancyA.value(aI);
        var lookup3d = unitB.lookup3d;
        var _h = lookup3d.find(_imageA[0], _imageA[1], _imageA[2], maxRadius), indices = _h.indices, count = _h.count, squaredDistances = _h.squaredDistances;
        if (count === 0)
            continue;
        var aeI = getElementIdx(type_symbolA.value(aI));
        var isHa = isHydrogen(aeI);
        var thresholdA = getElementThreshold(aeI);
        var altA = label_alt_idA.value(aI);
        var metalA = MetalsSet.has(aeI);
        var atomIdA = label_atom_idA.value(aI);
        var compIdA = label_comp_idA.value(residueIndexA[aI]);
        for (var ni = 0; ni < count; ni++) {
            var _bI = indices[ni];
            var bI = atomsB[_bI];
            var altB = label_alt_idB.value(bI);
            if (altA && altB && altA !== altB)
                continue;
            // Do not include bonds between images of the same residue with partial occupancy.
            // TODO: is this condition good enough?
            // - It works for cases like 3WQJ (label_asym_id: I) which have partial occupancy.
            // - Does NOT work for cases like 1RB8 (DC 7) with full occupancy.
            if (hasOccupancy && occupancyB.value(bI) < 1 && occA < 1) {
                if (auth_seq_idA.value(aI) === auth_seq_idB.value(bI)) {
                    continue;
                }
            }
            var beI = getElementIdx(type_symbolB.value(bI));
            var isHb = isHydrogen(beI);
            if (isHa && isHb)
                continue;
            var isMetal = (metalA || MetalsSet.has(beI)) && !(isHa || isHb);
            var dist = Math.sqrt(squaredDistances[ni]);
            if (dist === 0)
                continue;
            var pairingThreshold = getPairingThreshold(aeI, beI, thresholdA, getElementThreshold(beI));
            if (dist <= pairingThreshold) {
                var atomIdB = label_atom_idB.value(bI);
                var compIdB = label_comp_idB.value(residueIndexB[bI]);
                builder.add(_aI, _bI, {
                    order: getInterBondOrderFromTable(compIdA, compIdB, atomIdA, atomIdB),
                    flag: (isMetal ? 2 /* BondType.Flag.MetallicCoordination */ : 1 /* BondType.Flag.Covalent */) | 32 /* BondType.Flag.Computed */,
                    key: -1
                });
            }
        }
    }
    builder.finishUnitPair();
}
var DefaultInterBondComputationProps = __assign(__assign({}, DefaultBondComputationProps), { ignoreWater: true, ignoreIon: true });
function findBonds(structure, props) {
    var builder = new InterUnitGraph.Builder();
    var hasIndexPairBonds = structure.models.some(function (m) { return IndexPairBonds.Provider.get(m); });
    var hasExhaustiveStructConn = structure.models.some(function (m) { return StructConn.isExhaustive(m); });
    if (props.noCompute || (structure.isCoarseGrained && !hasIndexPairBonds && !hasExhaustiveStructConn)) {
        return new InterUnitBonds(builder.getMap());
    }
    Structure.eachUnitPair(structure, function (unitA, unitB) {
        findPairBonds(unitA, unitB, props, builder);
    }, {
        maxRadius: props.maxRadius,
        validUnit: function (unit) { return props.validUnit(unit); },
        validUnitPair: function (unitA, unitB) { return props.validUnitPair(structure, unitA, unitB); }
    });
    return new InterUnitBonds(builder.getMap());
}
function computeInterUnitBonds(structure, props) {
    var p = __assign(__assign({}, DefaultInterBondComputationProps), props);
    return findBonds(structure, __assign(__assign({}, p), { validUnit: (props && props.validUnit) || (function (u) { return Unit.isAtomic(u); }), validUnitPair: (props && props.validUnitPair) || (function (s, a, b) {
            var isValidPair = Structure.validUnitPair(s, a, b);
            if (!isValidPair)
                return false;
            var mtA = a.model.atomicHierarchy.derived.residue.moleculeType;
            var mtB = b.model.atomicHierarchy.derived.residue.moleculeType;
            var notWater = ((!Unit.isAtomic(a) || mtA[a.residueIndex[a.elements[0]]] !== 2 /* MoleculeType.Water */) &&
                (!Unit.isAtomic(b) || mtB[b.residueIndex[b.elements[0]]] !== 2 /* MoleculeType.Water */));
            var notIonA = (!Unit.isAtomic(a) || mtA[a.residueIndex[a.elements[0]]] !== 3 /* MoleculeType.Ion */);
            var notIonB = (!Unit.isAtomic(b) || mtB[b.residueIndex[b.elements[0]]] !== 3 /* MoleculeType.Ion */);
            var notIon = notIonA && notIonB;
            var check = (notWater || !p.ignoreWater) && (notIon || !p.ignoreIon);
            if (!check) {
                // In case both units have a struct conn record, ignore other criteria
                return hasCommonStructConnRecord(a, b);
            }
            return true;
        }) }));
}
function hasCommonStructConnRecord(unitA, unitB) {
    if (unitA.model !== unitB.model || !Unit.isAtomic(unitA) || !Unit.isAtomic(unitB))
        return false;
    var structConn = StructConn.Provider.get(unitA.model);
    if (!structConn)
        return false;
    var smaller = unitA.elements.length < unitB.elements.length ? unitA : unitB;
    var bigger = unitA.elements.length >= unitB.elements.length ? unitA : unitB;
    var xs = smaller.elements;
    var ys = bigger.elements;
    var indexOf = SortedArray.indexOf;
    for (var i = 0, _i = xs.length; i < _i; i++) {
        var aI = xs[i];
        var entries = structConn.byAtomIndex.get(aI);
        if (!(entries === null || entries === void 0 ? void 0 : entries.length))
            continue;
        for (var _a = 0, entries_1 = entries; _a < entries_1.length; _a++) {
            var e = entries_1[_a];
            var bI = e.partnerA.atomIndex === aI ? e.partnerB.atomIndex : e.partnerA.atomIndex;
            if (indexOf(ys, bI) >= 0)
                return true;
        }
    }
    return false;
}
export { computeInterUnitBonds };
