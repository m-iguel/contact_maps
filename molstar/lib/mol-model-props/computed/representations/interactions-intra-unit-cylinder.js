/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { Unit, Structure, StructureElement } from '../../../mol-model/structure';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { EmptyLoci } from '../../../mol-model/loci';
import { Interval, OrderedSet, SortedArray } from '../../../mol-data/int';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { InteractionsProvider } from '../interactions';
import { createLinkCylinderMesh, LinkCylinderParams } from '../../../mol-repr/structure/visual/util/link';
import { UnitsMeshParams, UnitsMeshVisual } from '../../../mol-repr/structure/units-visual';
import { LocationIterator } from '../../../mol-geo/util/location-iterator';
import { Interactions } from '../interactions/interactions';
import { InteractionFlag } from '../interactions/common';
import { Sphere3D } from '../../../mol-math/geometry';
import { isHydrogen } from '../../../mol-repr/structure/visual/util/common';
import { assertUnreachable } from '../../../mol-util/type-helpers';
import { InteractionsSharedParams } from './shared';
import { InteractionType } from '../interactions/common';
import { eachIntraBondedAtom } from '../chemistry/util';
function createIntraUnitInteractionsCylinderMesh(ctx, unit, structure, theme, props, mesh) {
    return __awaiter(this, void 0, void 0, function () {
        var child, childUnit, location, interactions, features, contacts, x, y, z, members, offsets, edgeCount, a, b, _a, flag, type, sizeFactor, ignoreHydrogens, ignoreHydrogensVariant, parentDisplay, pos, elements, p, pA, pB, builderProps, _b, m, boundingSphere, sphere;
        return __generator(this, function (_c) {
            if (!Unit.isAtomic(unit))
                return [2 /*return*/, Mesh.createEmpty(mesh)];
            child = structure.child;
            childUnit = child === null || child === void 0 ? void 0 : child.unitMap.get(unit.id);
            if (child && !childUnit)
                return [2 /*return*/, Mesh.createEmpty(mesh)];
            location = StructureElement.Location.create(structure, unit);
            interactions = InteractionsProvider.get(structure).value;
            features = interactions.unitsFeatures.get(unit.id);
            contacts = interactions.unitsContacts.get(unit.id);
            x = features.x, y = features.y, z = features.z, members = features.members, offsets = features.offsets;
            edgeCount = contacts.edgeCount, a = contacts.a, b = contacts.b, _a = contacts.edgeProps, flag = _a.flag, type = _a.type;
            sizeFactor = props.sizeFactor, ignoreHydrogens = props.ignoreHydrogens, ignoreHydrogensVariant = props.ignoreHydrogensVariant, parentDisplay = props.parentDisplay;
            if (!edgeCount)
                return [2 /*return*/, Mesh.createEmpty(mesh)];
            pos = unit.conformation.invariantPosition;
            elements = unit.elements;
            p = Vec3();
            pA = Vec3();
            pB = Vec3();
            builderProps = {
                linkCount: edgeCount * 2,
                position: function (posA, posB, edgeIndex) {
                    var t = type[edgeIndex];
                    if ((!ignoreHydrogens || ignoreHydrogensVariant !== 'all') && (t === InteractionType.HydrogenBond || t === InteractionType.WeakHydrogenBond)) {
                        var idxA = members[offsets[a[edgeIndex]]];
                        var idxB = members[offsets[b[edgeIndex]]];
                        pos(elements[idxA], pA);
                        pos(elements[idxB], pB);
                        var minDistA_1 = Vec3.distance(pA, pB);
                        var minDistB_1 = minDistA_1;
                        Vec3.copy(posA, pA);
                        Vec3.copy(posB, pB);
                        eachIntraBondedAtom(unit, idxA, function (_, idx) {
                            if (isHydrogen(structure, unit, elements[idx], 'polar')) {
                                pos(elements[idx], p);
                                var dist = Vec3.distance(p, pB);
                                if (dist < minDistA_1) {
                                    minDistA_1 = dist;
                                    Vec3.copy(posA, p);
                                }
                            }
                        });
                        eachIntraBondedAtom(unit, idxB, function (_, idx) {
                            if (isHydrogen(structure, unit, elements[idx], 'polar')) {
                                pos(elements[idx], p);
                                var dist = Vec3.distance(p, pA);
                                if (dist < minDistB_1) {
                                    minDistB_1 = dist;
                                    Vec3.copy(posB, p);
                                }
                            }
                        });
                    }
                    else {
                        Vec3.set(posA, x[a[edgeIndex]], y[a[edgeIndex]], z[a[edgeIndex]]);
                        Vec3.set(posB, x[b[edgeIndex]], y[b[edgeIndex]], z[b[edgeIndex]]);
                    }
                },
                style: function (edgeIndex) { return 1 /* LinkStyle.Dashed */; },
                radius: function (edgeIndex) {
                    location.element = elements[members[offsets[a[edgeIndex]]]];
                    var sizeA = theme.size.size(location);
                    location.element = elements[members[offsets[b[edgeIndex]]]];
                    var sizeB = theme.size.size(location);
                    return Math.min(sizeA, sizeB) * sizeFactor;
                },
                ignore: function (edgeIndex) {
                    if (flag[edgeIndex] === InteractionFlag.Filtered)
                        return true;
                    if (childUnit) {
                        if (parentDisplay === 'stub') {
                            var f = a[edgeIndex];
                            for (var i = offsets[f], il = offsets[f + 1]; i < il; ++i) {
                                var e = elements[members[offsets[i]]];
                                if (!SortedArray.has(childUnit.elements, e))
                                    return true;
                            }
                        }
                        else if (parentDisplay === 'full' || parentDisplay === 'between') {
                            var flagA = false;
                            var flagB = false;
                            var fA = a[edgeIndex];
                            for (var i = offsets[fA], il = offsets[fA + 1]; i < il; ++i) {
                                var eA = elements[members[offsets[i]]];
                                if (!SortedArray.has(childUnit.elements, eA))
                                    flagA = true;
                            }
                            var fB = b[edgeIndex];
                            for (var i = offsets[fB], il = offsets[fB + 1]; i < il; ++i) {
                                var eB = elements[members[offsets[i]]];
                                if (!SortedArray.has(childUnit.elements, eB))
                                    flagB = true;
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
            _b = createLinkCylinderMesh(ctx, builderProps, props, mesh), m = _b.mesh, boundingSphere = _b.boundingSphere;
            if (boundingSphere) {
                m.setBoundingSphere(boundingSphere);
            }
            else if (m.triangleCount > 0) {
                sphere = Sphere3D.expand(Sphere3D(), (childUnit !== null && childUnit !== void 0 ? childUnit : unit).boundary.sphere, 1 * sizeFactor);
                m.setBoundingSphere(sphere);
            }
            return [2 /*return*/, m];
        });
    });
}
export var InteractionsIntraUnitParams = __assign(__assign(__assign({}, UnitsMeshParams), LinkCylinderParams), InteractionsSharedParams);
export function InteractionsIntraUnitVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(InteractionsIntraUnitParams),
        createGeometry: createIntraUnitInteractionsCylinderMesh,
        createLocationIterator: createInteractionsIterator,
        getLoci: getInteractionLoci,
        eachLocation: eachInteraction,
        setUpdateState: function (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.dashCount !== currentProps.dashCount ||
                newProps.dashScale !== currentProps.dashScale ||
                newProps.dashCap !== currentProps.dashCap ||
                newProps.radialSegments !== currentProps.radialSegments ||
                newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                newProps.parentDisplay !== currentProps.parentDisplay);
            var interactionsHash = InteractionsProvider.get(newStructureGroup.structure).version;
            if (state.info.interactionsHash !== interactionsHash) {
                state.createGeometry = true;
                state.updateTransform = true;
                state.updateColor = true;
                state.info.interactionsHash = interactionsHash;
            }
        }
    }, materialId);
}
function getInteractionLoci(pickingId, structureGroup, id) {
    var objectId = pickingId.objectId, instanceId = pickingId.instanceId, groupId = pickingId.groupId;
    if (id === objectId) {
        var structure = structureGroup.structure, group = structureGroup.group;
        var unit = structure.unitMap.get(group.units[instanceId].id);
        var interactions = InteractionsProvider.get(structure).value;
        var _a = interactions.unitsContacts.get(unit.id), a = _a.a, b = _a.b;
        return Interactions.Loci(structure, interactions, [
            { unitA: unit, indexA: a[groupId], unitB: unit, indexB: b[groupId] },
            { unitA: unit, indexA: b[groupId], unitB: unit, indexB: a[groupId] },
        ]);
    }
    return EmptyLoci;
}
var __contactIndicesSet = new Set();
function eachInteraction(loci, structureGroup, apply, isMarking) {
    var changed = false;
    if (Interactions.isLoci(loci)) {
        var structure = structureGroup.structure, group = structureGroup.group;
        if (!Structure.areEquivalent(loci.data.structure, structure))
            return false;
        var interactions = InteractionsProvider.get(structure).value;
        if (loci.data.interactions !== interactions)
            return false;
        var unit = group.units[0];
        var contacts = interactions.unitsContacts.get(unit.id);
        var groupCount = contacts.edgeCount * 2;
        for (var _i = 0, _a = loci.elements; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e.unitA !== e.unitB)
                continue;
            var unitIdx = group.unitIndexMap.get(e.unitA.id);
            if (unitIdx !== undefined) {
                var idx = contacts.getDirectedEdgeIndex(e.indexA, e.indexB);
                if (idx !== -1) {
                    if (apply(Interval.ofSingleton(unitIdx * groupCount + idx)))
                        changed = true;
                }
            }
        }
    }
    else if (StructureElement.Loci.is(loci)) {
        var structure = structureGroup.structure, group = structureGroup.group;
        if (!Structure.areEquivalent(loci.structure, structure))
            return false;
        var interactions = InteractionsProvider.get(structure).value;
        if (!interactions)
            return false;
        var unit = group.units[0];
        var contacts_1 = interactions.unitsContacts.get(unit.id);
        var features = interactions.unitsFeatures.get(unit.id);
        var groupCount_1 = contacts_1.edgeCount * 2;
        var offset_1 = contacts_1.offset;
        var _b = features.elementsIndex, fOffsets_1 = _b.offsets, fIndices_1 = _b.indices;
        var members_1 = features.members, offsets_1 = features.offsets;
        var _loop_1 = function (e) {
            var unitIdx = group.unitIndexMap.get(e.unit.id);
            if (unitIdx === undefined)
                return "continue";
            OrderedSet.forEach(e.indices, function (v) {
                for (var i = fOffsets_1[v], il = fOffsets_1[v + 1]; i < il; ++i) {
                    var fI = fIndices_1[i];
                    for (var j = offset_1[fI], jl = offset_1[fI + 1]; j < jl; ++j) {
                        __contactIndicesSet.add(j);
                    }
                }
            });
            __contactIndicesSet.forEach(function (i) {
                if (isMarking) {
                    var fA = contacts_1.a[i];
                    for (var j = offsets_1[fA], jl = offsets_1[fA + 1]; j < jl; ++j) {
                        if (!OrderedSet.has(e.indices, members_1[j]))
                            return;
                    }
                    var fB = contacts_1.b[i];
                    for (var j = offsets_1[fB], jl = offsets_1[fB + 1]; j < jl; ++j) {
                        if (!OrderedSet.has(e.indices, members_1[j]))
                            return;
                    }
                }
                if (apply(Interval.ofSingleton(unitIdx * groupCount_1 + i)))
                    changed = true;
            });
            __contactIndicesSet.clear();
        };
        for (var _c = 0, _d = loci.elements; _c < _d.length; _c++) {
            var e = _d[_c];
            _loop_1(e);
        }
    }
    return changed;
}
function createInteractionsIterator(structureGroup) {
    var structure = structureGroup.structure, group = structureGroup.group;
    var unit = group.units[0];
    var interactions = InteractionsProvider.get(structure).value;
    var contacts = interactions.unitsContacts.get(unit.id);
    var groupCount = contacts.edgeCount * 2;
    var instanceCount = group.units.length;
    var location = Interactions.Location(interactions, structure);
    var element = location.element;
    var getLocation = function (groupIndex, instanceIndex) {
        var instanceUnit = group.units[instanceIndex];
        element.unitA = instanceUnit;
        element.indexA = contacts.a[groupIndex];
        element.unitB = instanceUnit;
        element.indexB = contacts.b[groupIndex];
        return location;
    };
    return LocationIterator(groupCount, instanceCount, 1, getLocation);
}
