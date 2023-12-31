/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Structure, StructureElement } from '../../../mol-model/structure';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { createLinkCylinderMesh, LinkCylinderParams } from '../../../mol-repr/structure/visual/util/link';
import { ComplexMeshParams, ComplexMeshVisual } from '../../../mol-repr/structure/complex-visual';
import { EmptyLoci } from '../../../mol-model/loci';
import { Interval, OrderedSet, SortedArray } from '../../../mol-data/int';
import { Interactions } from '../interactions/interactions';
import { InteractionsProvider } from '../interactions';
import { LocationIterator } from '../../../mol-geo/util/location-iterator';
import { InteractionFlag, InteractionType } from '../interactions/common';
import { Unit } from '../../../mol-model/structure/structure';
import { Sphere3D } from '../../../mol-math/geometry';
import { assertUnreachable } from '../../../mol-util/type-helpers';
import { InteractionsSharedParams } from './shared';
import { eachBondedAtom } from '../chemistry/util';
import { isHydrogen } from '../../../mol-repr/structure/visual/util/common';
function createInterUnitInteractionCylinderMesh(ctx, structure, theme, props, mesh) {
    if (!structure.hasAtomic)
        return Mesh.createEmpty(mesh);
    var l = StructureElement.Location.create(structure);
    var interactions = InteractionsProvider.get(structure).value;
    var contacts = interactions.contacts, unitsFeatures = interactions.unitsFeatures;
    var edgeCount = contacts.edgeCount, edges = contacts.edges;
    var sizeFactor = props.sizeFactor, ignoreHydrogens = props.ignoreHydrogens, ignoreHydrogensVariant = props.ignoreHydrogensVariant, parentDisplay = props.parentDisplay;
    if (!edgeCount)
        return Mesh.createEmpty(mesh);
    var child = structure.child;
    var p = Vec3();
    var pA = Vec3();
    var pB = Vec3();
    var builderProps = {
        linkCount: edgeCount,
        position: function (posA, posB, edgeIndex) {
            var _a = edges[edgeIndex], unitA = _a.unitA, indexA = _a.indexA, unitB = _a.unitB, indexB = _a.indexB, t = _a.props.type;
            var fA = unitsFeatures.get(unitA);
            var fB = unitsFeatures.get(unitB);
            var uA = structure.unitMap.get(unitA);
            var uB = structure.unitMap.get(unitB);
            if ((!ignoreHydrogens || ignoreHydrogensVariant !== 'all') && (t === InteractionType.HydrogenBond || t === InteractionType.WeakHydrogenBond)) {
                var idxA = fA.members[fA.offsets[indexA]];
                var idxB = fB.members[fB.offsets[indexB]];
                uA.conformation.position(uA.elements[idxA], pA);
                uB.conformation.position(uB.elements[idxB], pB);
                var minDistA_1 = Vec3.distance(pA, pB);
                var minDistB_1 = minDistA_1;
                Vec3.copy(posA, pA);
                Vec3.copy(posB, pB);
                eachBondedAtom(structure, uA, idxA, function (u, idx) {
                    var eI = u.elements[idx];
                    if (isHydrogen(structure, u, eI, 'polar')) {
                        u.conformation.position(eI, p);
                        var dist = Vec3.distance(p, pB);
                        if (dist < minDistA_1) {
                            minDistA_1 = dist;
                            Vec3.copy(posA, p);
                        }
                    }
                });
                eachBondedAtom(structure, uB, idxB, function (u, idx) {
                    var eI = u.elements[idx];
                    if (isHydrogen(structure, u, eI, 'polar')) {
                        u.conformation.position(eI, p);
                        var dist = Vec3.distance(p, pA);
                        if (dist < minDistB_1) {
                            minDistB_1 = dist;
                            Vec3.copy(posB, p);
                        }
                    }
                });
            }
            else {
                Vec3.set(posA, fA.x[indexA], fA.y[indexA], fA.z[indexA]);
                Vec3.transformMat4(posA, posA, uA.conformation.operator.matrix);
                Vec3.set(posB, fB.x[indexB], fB.y[indexB], fB.z[indexB]);
                Vec3.transformMat4(posB, posB, uB.conformation.operator.matrix);
            }
        },
        style: function (edgeIndex) { return 1 /* LinkStyle.Dashed */; },
        radius: function (edgeIndex) {
            var b = edges[edgeIndex];
            var fA = unitsFeatures.get(b.unitA);
            l.unit = structure.unitMap.get(b.unitA);
            l.element = l.unit.elements[fA.members[fA.offsets[b.indexA]]];
            var sizeA = theme.size.size(l);
            var fB = unitsFeatures.get(b.unitB);
            l.unit = structure.unitMap.get(b.unitB);
            l.element = l.unit.elements[fB.members[fB.offsets[b.indexB]]];
            var sizeB = theme.size.size(l);
            return Math.min(sizeA, sizeB) * sizeFactor;
        },
        ignore: function (edgeIndex) {
            if (edges[edgeIndex].props.flag === InteractionFlag.Filtered)
                return true;
            if (child) {
                var b = edges[edgeIndex];
                if (parentDisplay === 'stub') {
                    var childUnitA = child.unitMap.get(b.unitA);
                    if (!childUnitA)
                        return true;
                    var unitA = structure.unitMap.get(b.unitA);
                    var _a = unitsFeatures.get(b.unitA), offsets = _a.offsets, members = _a.members;
                    for (var i = offsets[b.indexA], il = offsets[b.indexA + 1]; i < il; ++i) {
                        var eA = unitA.elements[members[i]];
                        if (!SortedArray.has(childUnitA.elements, eA))
                            return true;
                    }
                }
                else if (parentDisplay === 'full' || parentDisplay === 'between') {
                    var flagA = false;
                    var flagB = false;
                    var childUnitA = child.unitMap.get(b.unitA);
                    if (!childUnitA) {
                        flagA = true;
                    }
                    else {
                        var unitA = structure.unitMap.get(b.unitA);
                        var _b = unitsFeatures.get(b.unitA), offsets = _b.offsets, members = _b.members;
                        for (var i = offsets[b.indexA], il = offsets[b.indexA + 1]; i < il; ++i) {
                            var eA = unitA.elements[members[i]];
                            if (!SortedArray.has(childUnitA.elements, eA))
                                flagA = true;
                        }
                    }
                    var childUnitB = child.unitMap.get(b.unitB);
                    if (!childUnitB) {
                        flagB = true;
                    }
                    else {
                        var unitB = structure.unitMap.get(b.unitB);
                        var _c = unitsFeatures.get(b.unitB), offsets = _c.offsets, members = _c.members;
                        for (var i = offsets[b.indexB], il = offsets[b.indexB + 1]; i < il; ++i) {
                            var eB = unitB.elements[members[i]];
                            if (!SortedArray.has(childUnitB.elements, eB))
                                flagB = true;
                        }
                    }
                    return parentDisplay === 'full' ? flagA && flagB : flagA === flagB;
                }
                else {
                    assertUnreachable(parentDisplay);
                }
            }
            return false;
        }
    };
    var _a = createLinkCylinderMesh(ctx, builderProps, props, mesh), m = _a.mesh, boundingSphere = _a.boundingSphere;
    if (boundingSphere) {
        m.setBoundingSphere(boundingSphere);
    }
    else if (m.triangleCount > 0) {
        var child_1 = structure.child;
        var sphere = Sphere3D.expand(Sphere3D(), (child_1 !== null && child_1 !== void 0 ? child_1 : structure).boundary.sphere, 1 * sizeFactor);
        m.setBoundingSphere(sphere);
    }
    return m;
}
export var InteractionsInterUnitParams = __assign(__assign(__assign({}, ComplexMeshParams), LinkCylinderParams), InteractionsSharedParams);
export function InteractionsInterUnitVisual(materialId) {
    return ComplexMeshVisual({
        defaultProps: PD.getDefaultValues(InteractionsInterUnitParams),
        createGeometry: createInterUnitInteractionCylinderMesh,
        createLocationIterator: createInteractionsIterator,
        getLoci: getInteractionLoci,
        eachLocation: eachInteraction,
        setUpdateState: function (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.dashCount !== currentProps.dashCount ||
                newProps.dashScale !== currentProps.dashScale ||
                newProps.dashCap !== currentProps.dashCap ||
                newProps.radialSegments !== currentProps.radialSegments ||
                newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                newProps.parentDisplay !== currentProps.parentDisplay);
            var interactionsHash = InteractionsProvider.get(newStructure).version;
            if (state.info.interactionsHash !== interactionsHash) {
                state.createGeometry = true;
                state.updateTransform = true;
                state.updateColor = true;
                state.info.interactionsHash = interactionsHash;
            }
        }
    }, materialId);
}
function getInteractionLoci(pickingId, structure, id) {
    var objectId = pickingId.objectId, groupId = pickingId.groupId;
    if (id === objectId) {
        var interactions = InteractionsProvider.get(structure).value;
        var c = interactions.contacts.edges[groupId];
        var unitA = structure.unitMap.get(c.unitA);
        var unitB = structure.unitMap.get(c.unitB);
        return Interactions.Loci(structure, interactions, [
            { unitA: unitA, indexA: c.indexA, unitB: unitB, indexB: c.indexB },
            { unitA: unitB, indexA: c.indexB, unitB: unitA, indexB: c.indexA },
        ]);
    }
    return EmptyLoci;
}
var __unitMap = new Map();
var __contactIndicesSet = new Set();
function eachInteraction(loci, structure, apply, isMarking) {
    var changed = false;
    if (Interactions.isLoci(loci)) {
        if (!Structure.areEquivalent(loci.data.structure, structure))
            return false;
        var interactions = InteractionsProvider.get(structure).value;
        if (loci.data.interactions !== interactions)
            return false;
        var contacts = interactions.contacts;
        for (var _i = 0, _a = loci.elements; _i < _a.length; _i++) {
            var c = _a[_i];
            var idx = contacts.getEdgeIndex(c.indexA, c.unitA.id, c.indexB, c.unitB.id);
            if (idx !== -1) {
                if (apply(Interval.ofSingleton(idx)))
                    changed = true;
            }
        }
    }
    else if (StructureElement.Loci.is(loci)) {
        if (!Structure.areEquivalent(loci.structure, structure))
            return false;
        if (isMarking && loci.elements.length === 1)
            return false; // only a single unit
        var interactions = InteractionsProvider.get(structure).value;
        if (!interactions)
            return false;
        var contacts_1 = interactions.contacts, unitsFeatures_1 = interactions.unitsFeatures;
        for (var _b = 0, _c = loci.elements; _b < _c.length; _b++) {
            var e = _c[_b];
            __unitMap.set(e.unit.id, e.indices);
        }
        var _loop_1 = function (e) {
            var unit = e.unit;
            if (!Unit.isAtomic(unit))
                return "continue";
            OrderedSet.forEach(e.indices, function (v) {
                for (var _i = 0, _a = contacts_1.getContactIndicesForElement(v, unit); _i < _a.length; _i++) {
                    var idx = _a[_i];
                    __contactIndicesSet.add(idx);
                }
            });
        };
        for (var _d = 0, _e = loci.elements; _d < _e.length; _d++) {
            var e = _e[_d];
            _loop_1(e);
        }
        __contactIndicesSet.forEach(function (i) {
            if (isMarking) {
                var _a = contacts_1.edges[i], indexA = _a.indexA, unitA = _a.unitA, indexB = _a.indexB, unitB = _a.unitB;
                var indicesA = __unitMap.get(unitA);
                var indicesB = __unitMap.get(unitB);
                if (!indicesA || !indicesB)
                    return;
                var _b = unitsFeatures_1.get(unitA), offsetsA = _b.offsets, membersA = _b.members;
                for (var j = offsetsA[indexA], jl = offsetsA[indexA + 1]; j < jl; ++j) {
                    if (!OrderedSet.has(indicesA, membersA[j]))
                        return;
                }
                var _c = unitsFeatures_1.get(unitB), offsetsB = _c.offsets, membersB = _c.members;
                for (var j = offsetsB[indexB], jl = offsetsB[indexB + 1]; j < jl; ++j) {
                    if (!OrderedSet.has(indicesB, membersB[j]))
                        return;
                }
            }
            if (apply(Interval.ofSingleton(i)))
                changed = true;
        });
        __unitMap.clear();
        __contactIndicesSet.clear();
    }
    return changed;
}
function createInteractionsIterator(structure) {
    var interactions = InteractionsProvider.get(structure).value;
    var contacts = interactions.contacts;
    var groupCount = contacts.edgeCount;
    var instanceCount = 1;
    var location = Interactions.Location(interactions, structure);
    var element = location.element;
    var getLocation = function (groupIndex) {
        var c = contacts.edges[groupIndex];
        element.unitA = structure.unitMap.get(c.unitA);
        element.indexA = c.indexA;
        element.unitB = structure.unitMap.get(c.unitB);
        element.indexB = c.indexB;
        return location;
    };
    return LocationIterator(groupCount, instanceCount, 1, getLocation, true);
}
