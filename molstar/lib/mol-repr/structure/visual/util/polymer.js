/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Unit, StructureElement, Bond, Structure } from '../../../../mol-model/structure';
import { OrderedSet, Interval } from '../../../../mol-data/int';
import { EmptyLoci } from '../../../../mol-model/loci';
import { LocationIterator } from '../../../../mol-geo/util/location-iterator';
import { getResidueLoci } from './common';
export * from './polymer/backbone';
export * from './polymer/gap-iterator';
export * from './polymer/trace-iterator';
export * from './polymer/curve-segment';
export var StandardTension = 0.5;
export var HelixTension = 0.9;
export var StandardShift = 0.5;
export var NucleicShift = 0.3;
export var OverhangFactor = 2;
export function getPolymerRanges(unit) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */: return unit.model.atomicRanges.polymerRanges;
        case 1 /* Unit.Kind.Spheres */: return unit.model.coarseHierarchy.spheres.polymerRanges;
        case 2 /* Unit.Kind.Gaussians */: return unit.model.coarseHierarchy.gaussians.polymerRanges;
    }
}
export function getGapRanges(unit) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */: return unit.model.atomicRanges.gapRanges;
        case 1 /* Unit.Kind.Spheres */: return unit.model.coarseHierarchy.spheres.gapRanges;
        case 2 /* Unit.Kind.Gaussians */: return unit.model.coarseHierarchy.gaussians.gapRanges;
    }
}
export var PolymerLocationIterator;
(function (PolymerLocationIterator) {
    function fromGroup(structureGroup, asSecondary) {
        if (asSecondary === void 0) { asSecondary = false; }
        var group = structureGroup.group, structure = structureGroup.structure;
        var polymerElements = group.units[0].polymerElements;
        var groupCount = polymerElements.length;
        var instanceCount = group.units.length;
        var location = StructureElement.Location.create(structure);
        var getLocation = function (groupIndex, instanceIndex) {
            var unit = group.units[instanceIndex];
            location.unit = unit;
            location.element = polymerElements[groupIndex];
            return location;
        };
        function isSecondary(elementIndex, instanceIndex) {
            return asSecondary;
        }
        return LocationIterator(groupCount, instanceCount, 1, getLocation, false, isSecondary);
    }
    PolymerLocationIterator.fromGroup = fromGroup;
})(PolymerLocationIterator || (PolymerLocationIterator = {}));
export var PolymerGapLocationIterator;
(function (PolymerGapLocationIterator) {
    function fromGroup(structureGroup) {
        var group = structureGroup.group, structure = structureGroup.structure;
        var gapElements = group.units[0].gapElements;
        var groupCount = gapElements.length;
        var instanceCount = group.units.length;
        var location = StructureElement.Location.create(structure);
        var getLocation = function (groupIndex, instanceIndex) {
            var unit = group.units[instanceIndex];
            location.unit = unit;
            location.element = gapElements[groupIndex];
            return location;
        };
        return LocationIterator(groupCount, instanceCount, 1, getLocation);
    }
    PolymerGapLocationIterator.fromGroup = fromGroup;
})(PolymerGapLocationIterator || (PolymerGapLocationIterator = {}));
/** Return a Loci for the elements of the whole residue of a polymer element. */
export function getPolymerElementLoci(pickingId, structureGroup, id) {
    var objectId = pickingId.objectId, instanceId = pickingId.instanceId, groupId = pickingId.groupId;
    if (id === objectId) {
        var structure = structureGroup.structure, group = structureGroup.group;
        var unit = group.units[instanceId];
        if (Unit.isAtomic(unit)) {
            return getResidueLoci(structure, unit, unit.polymerElements[groupId]);
        }
        else {
            var elements = unit.elements;
            var elementIndex = unit.polymerElements[groupId];
            var unitIndex = OrderedSet.indexOf(elements, elementIndex);
            if (unitIndex !== -1) {
                var indices = OrderedSet.ofSingleton(unitIndex);
                return StructureElement.Loci(structure, [{ unit: unit, indices: indices }]);
            }
        }
    }
    return EmptyLoci;
}
function tryApplyResidueInterval(offset, elements, traceElementIndex, apply, r1, r2) {
    var start = -1, startIdx = -1;
    for (var rI = r1; rI <= r2; rI++) {
        var eI = traceElementIndex[rI];
        if (eI < 0)
            continue;
        start = OrderedSet.indexOf(elements, eI);
        if (start >= 0) {
            startIdx = rI;
            break;
        }
    }
    if (start < 0) {
        return false;
    }
    var end = start;
    for (var rI = r2; rI > startIdx; rI--) {
        var eI = traceElementIndex[rI];
        if (eI < 0)
            continue;
        var e = OrderedSet.indexOf(elements, eI);
        if (e >= 0) {
            end = e;
            break;
        }
    }
    return apply(Interval.ofRange(offset + start, offset + end));
}
export function eachAtomicUnitTracedElement(offset, groupSize, elementsSelector, apply, e) {
    var changed = false;
    var elements = e.unit.elements;
    var traceElementIndex = e.unit.model.atomicHierarchy.derived.residue.traceElementIndex;
    var resIndex = e.unit.model.atomicHierarchy.residueAtomSegments.index;
    var tracedElements = elementsSelector(e.unit);
    if (Interval.is(e.indices)) {
        if (Interval.start(e.indices) === 0 && Interval.end(e.indices) === e.unit.elements.length) {
            // full unit here
            changed = apply(Interval.ofBounds(offset, offset + groupSize)) || changed;
        }
        else {
            var r1 = resIndex[elements[Interval.min(e.indices)]];
            var r2 = resIndex[elements[Interval.max(e.indices)]];
            changed = tryApplyResidueInterval(offset, tracedElements, traceElementIndex, apply, r1, r2) || changed;
        }
    }
    else {
        var indices = e.indices;
        for (var i = 0, _i = indices.length; i < _i; i++) {
            var r1 = resIndex[elements[indices[i]]];
            var r2 = r1;
            var endI = i + 1;
            while (endI < _i) {
                var _r = resIndex[elements[indices[endI]]];
                if (_r - r2 > 1)
                    break;
                r2 = _r;
                endI++;
            }
            i = endI - 1;
            changed = tryApplyResidueInterval(offset, tracedElements, traceElementIndex, apply, r1, r2) || changed;
        }
    }
    return changed;
}
function selectPolymerElements(u) { return u.polymerElements; }
/** Mark a polymer element (e.g. part of a cartoon trace) */
export function eachPolymerElement(loci, structureGroup, apply) {
    var changed = false;
    if (!StructureElement.Loci.is(loci))
        return false;
    var structure = structureGroup.structure, group = structureGroup.group;
    if (!Structure.areEquivalent(loci.structure, structure))
        return false;
    var groupCount = group.units[0].polymerElements.length;
    for (var _a = 0, _b = loci.elements; _a < _b.length; _a++) {
        var e = _b[_a];
        if (!group.unitIndexMap.has(e.unit.id))
            continue;
        var offset = group.unitIndexMap.get(e.unit.id) * groupCount; // to target unit instance
        if (Unit.isAtomic(e.unit)) {
            changed = eachAtomicUnitTracedElement(offset, groupCount, selectPolymerElements, apply, e) || changed;
        }
        else {
            if (Interval.is(e.indices)) {
                var start = offset + Interval.start(e.indices);
                var end = offset + Interval.end(e.indices);
                changed = apply(Interval.ofBounds(start, end)) || changed;
            }
            else {
                for (var i = 0, _i = e.indices.length; i < _i; i++) {
                    var start = e.indices[i];
                    var endI = i + 1;
                    while (endI < _i && e.indices[endI] === start)
                        endI++;
                    i = endI - 1;
                    var end = e.indices[i];
                    changed = apply(Interval.ofRange(offset + start, offset + end)) || changed;
                }
            }
        }
    }
    return changed;
}
/** Return a Loci for both directions of the polymer gap element. */
export function getPolymerGapElementLoci(pickingId, structureGroup, id) {
    var objectId = pickingId.objectId, instanceId = pickingId.instanceId, groupId = pickingId.groupId;
    if (id === objectId) {
        var structure = structureGroup.structure, group = structureGroup.group;
        var unit = group.units[instanceId];
        var unitIndexA = OrderedSet.indexOf(unit.elements, unit.gapElements[groupId]);
        var unitIndexB = OrderedSet.indexOf(unit.elements, unit.gapElements[groupId % 2 ? groupId - 1 : groupId + 1]);
        if (unitIndexA !== -1 && unitIndexB !== -1) {
            return Bond.Loci(structure, [
                Bond.Location(structure, unit, unitIndexA, structure, unit, unitIndexB),
                Bond.Location(structure, unit, unitIndexB, structure, unit, unitIndexA)
            ]);
        }
    }
    return EmptyLoci;
}
export function eachPolymerGapElement(loci, structureGroup, apply) {
    var changed = false;
    if (Bond.isLoci(loci)) {
        var structure = structureGroup.structure, group = structureGroup.group;
        if (!Structure.areRootsEquivalent(loci.structure, structure))
            return false;
        loci = Bond.remapLoci(loci, structure);
        var groupCount = group.units[0].gapElements.length;
        for (var _a = 0, _b = loci.bonds; _a < _b.length; _a++) {
            var b = _b[_a];
            var unitIdx = group.unitIndexMap.get(b.aUnit.id);
            if (unitIdx !== undefined) {
                var idxA = OrderedSet.indexOf(b.aUnit.gapElements, b.aUnit.elements[b.aIndex]);
                var idxB = OrderedSet.indexOf(b.bUnit.gapElements, b.bUnit.elements[b.bIndex]);
                if (idxA !== -1 && idxB !== -1) {
                    if (apply(Interval.ofSingleton(unitIdx * groupCount + idxA)))
                        changed = true;
                }
            }
        }
    }
    else if (StructureElement.Loci.is(loci)) {
        var structure = structureGroup.structure, group = structureGroup.group;
        if (!Structure.areRootsEquivalent(loci.structure, structure))
            return false;
        loci = StructureElement.Loci.remap(loci, structure);
        var groupCount_1 = group.units[0].gapElements.length;
        var _loop_1 = function (e) {
            var unitIdx = group.unitIndexMap.get(e.unit.id);
            if (unitIdx !== undefined) {
                OrderedSet.forEach(e.indices, function (v) {
                    var idx = OrderedSet.indexOf(e.unit.gapElements, e.unit.elements[v]);
                    if (idx !== -1) {
                        if (apply(Interval.ofSingleton(unitIdx * groupCount_1 + idx)))
                            changed = true;
                    }
                });
            }
        };
        for (var _c = 0, _d = loci.elements; _c < _d.length; _c++) {
            var e = _d[_c];
            _loop_1(e);
        }
    }
    return changed;
}
