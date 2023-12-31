/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __assign } from "tslib";
import { Unit, StructureElement } from '../../../../mol-model/structure';
import { Mat4, Vec3 } from '../../../../mol-math/linear-algebra';
import { createTransform } from '../../../../mol-geo/geometry/transform-data';
import { OrderedSet, SortedArray } from '../../../../mol-data/int';
import { EmptyLoci } from '../../../../mol-model/loci';
import { AtomicNumbers } from '../../../../mol-model/structure/model/properties/atomic';
import { fillSerial } from '../../../../mol-util/array';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { getBoundary } from '../../../../mol-math/geometry/boundary';
import { Box3D } from '../../../../mol-math/geometry';
import { hasPolarNeighbour } from '../../../../mol-model-props/computed/chemistry/functional-group';
/** Return a Loci for the elements of a whole residue the elementIndex belongs to. */
export function getResidueLoci(structure, unit, elementIndex) {
    var elements = unit.elements, model = unit.model;
    if (OrderedSet.indexOf(elements, elementIndex) !== -1) {
        var _a = model.atomicHierarchy.residueAtomSegments, index = _a.index, offsets = _a.offsets;
        var rI = index[elementIndex];
        var _indices = [];
        for (var i = offsets[rI], il = offsets[rI + 1]; i < il; ++i) {
            var unitIndex = OrderedSet.indexOf(elements, i);
            if (unitIndex !== -1)
                _indices.push(unitIndex);
        }
        var indices = OrderedSet.ofSortedArray(SortedArray.ofSortedArray(_indices));
        return StructureElement.Loci(structure, [{ unit: unit, indices: indices }]);
    }
    return EmptyLoci;
}
/**
 * Return a Loci for the elements of a whole residue the elementIndex belongs to but
 * restrict to elements that have the same label_alt_id or none
 */
export function getAltResidueLoci(structure, unit, elementIndex) {
    var elements = unit.elements, model = unit.model;
    var label_alt_id = model.atomicHierarchy.atoms.label_alt_id;
    var elementAltId = label_alt_id.value(elementIndex);
    if (OrderedSet.indexOf(elements, elementIndex) !== -1) {
        var index = model.atomicHierarchy.residueAtomSegments.index;
        var rI = index[elementIndex];
        return getAltResidueLociFromId(structure, unit, rI, elementAltId);
    }
    return StructureElement.Loci(structure, []);
}
export function getAltResidueLociFromId(structure, unit, residueIndex, elementAltId) {
    var elements = unit.elements, model = unit.model;
    var label_alt_id = model.atomicHierarchy.atoms.label_alt_id;
    var offsets = model.atomicHierarchy.residueAtomSegments.offsets;
    var _indices = [];
    for (var i = offsets[residueIndex], il = offsets[residueIndex + 1]; i < il; ++i) {
        var unitIndex = OrderedSet.indexOf(elements, i);
        if (unitIndex !== -1) {
            var altId = label_alt_id.value(i);
            if (elementAltId === altId || altId === '') {
                _indices.push(unitIndex);
            }
        }
    }
    var indices = OrderedSet.ofSortedArray(SortedArray.ofSortedArray(_indices));
    return StructureElement.Loci(structure, [{ unit: unit, indices: indices }]);
}
export function createUnitsTransform(structureGroup, includeParent, transformData) {
    var child = structureGroup.structure.child;
    var units = includeParent && child
        ? structureGroup.group.units.filter(function (u) { return child.unitMap.has(u.id); })
        : structureGroup.group.units;
    var unitCount = units.length;
    var n = unitCount * 16;
    var array = transformData && transformData.aTransform.ref.value.length >= n ? transformData.aTransform.ref.value : new Float32Array(n);
    for (var i = 0; i < unitCount; i++) {
        Mat4.toArray(units[i].conformation.operator.matrix, array, i * 16);
    }
    return createTransform(array, unitCount, transformData);
}
export var UnitKindInfo = {
    'atomic': {},
    'spheres': {},
    'gaussians': {},
};
export var UnitKindOptions = PD.objectToOptions(UnitKindInfo);
export function includesUnitKind(unitKinds, unit) {
    for (var i = 0, il = unitKinds.length; i < il; ++i) {
        if (Unit.isAtomic(unit) && unitKinds[i] === 'atomic')
            return true;
        if (Unit.isSpheres(unit) && unitKinds[i] === 'spheres')
            return true;
        if (Unit.isGaussians(unit) && unitKinds[i] === 'gaussians')
            return true;
    }
    return false;
}
//
var DefaultMaxCells = 500000000;
export function getVolumeSliceInfo(box, resolution, maxCells) {
    if (maxCells === void 0) { maxCells = DefaultMaxCells; }
    var size = Box3D.size(Vec3(), box);
    Vec3.ceil(size, size);
    size.sort(function (a, b) { return b - a; }); // descending
    var maxAreaCells = Math.floor(Math.cbrt(maxCells) * Math.cbrt(maxCells));
    var area = size[0] * size[1];
    var areaCells = Math.ceil(area / (resolution * resolution));
    return { area: area, areaCells: areaCells, maxAreaCells: maxAreaCells };
}
/**
 * Guard against overly high resolution for the given box size.
 * Internally it uses the largest 2d slice of the box to determine the
 * maximum resolution to account for the 2d texture layout on the GPU.
 */
export function ensureReasonableResolution(box, props, maxCells) {
    if (maxCells === void 0) { maxCells = DefaultMaxCells; }
    var _a = getVolumeSliceInfo(box, props.resolution, maxCells), area = _a.area, areaCells = _a.areaCells, maxAreaCells = _a.maxAreaCells;
    var resolution = areaCells > maxAreaCells ? Math.sqrt(area / maxAreaCells) : props.resolution;
    return __assign(__assign({}, props), { resolution: resolution });
}
export function getConformation(unit) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */: return unit.model.atomicConformation;
        case 1 /* Unit.Kind.Spheres */: return unit.model.coarseConformation.spheres;
        case 2 /* Unit.Kind.Gaussians */: return unit.model.coarseConformation.gaussians;
    }
}
export var CommonSurfaceParams = {
    ignoreHydrogens: PD.Boolean(false, { description: 'Whether or not to include hydrogen atoms in the surface calculation.' }),
    ignoreHydrogensVariant: PD.Select('all', PD.arrayToOptions(['all', 'non-polar'])),
    traceOnly: PD.Boolean(false, { description: 'Whether or not to only use trace atoms in the surface calculation.' }),
    includeParent: PD.Boolean(false, { description: 'Include elements of the parent structure in surface calculation to get a surface patch of the current structure.' }),
};
export var DefaultCommonSurfaceProps = PD.getDefaultValues(CommonSurfaceParams);
var v = Vec3();
function squaredDistance(x, y, z, center) {
    return Vec3.squaredDistance(Vec3.set(v, x, y, z), center);
}
/** marks `indices` for filtering/ignoring in `id` when not in `elements` */
function filterUnitId(id, elements, indices) {
    var start = 0;
    var end = elements.length;
    for (var i = 0, il = indices.length; i < il; ++i) {
        var idx = SortedArray.indexOfInRange(elements, indices[i], start, end);
        if (idx === -1) {
            id[i] = -2;
        }
        else {
            id[i] = idx;
            start = idx;
        }
    }
}
export function getUnitConformationAndRadius(structure, unit, sizeTheme, props) {
    var ignoreHydrogens = props.ignoreHydrogens, ignoreHydrogensVariant = props.ignoreHydrogensVariant, traceOnly = props.traceOnly, includeParent = props.includeParent;
    var rootUnit = includeParent ? structure.root.unitMap.get(unit.id) : unit;
    var differentRoot = includeParent && rootUnit !== unit;
    var _a = getConformation(rootUnit), x = _a.x, y = _a.y, z = _a.z;
    var elements = rootUnit.elements;
    var _b = unit.boundary.sphere, center = _b.center, sphereRadius = _b.radius;
    var extraRadius = (4 + 1.5) * 2; // TODO should be twice (the max vdW/sphere radius plus the probe radius)
    var radiusSq = (sphereRadius + extraRadius) * (sphereRadius + extraRadius);
    var indices;
    var id;
    if (ignoreHydrogens || traceOnly || differentRoot) {
        var _indices = [];
        var _id = [];
        for (var i = 0, il = elements.length; i < il; ++i) {
            var eI = elements[i];
            if (ignoreHydrogens && isHydrogen(structure, rootUnit, eI, ignoreHydrogensVariant))
                continue;
            if (traceOnly && !isTrace(rootUnit, eI))
                continue;
            if (differentRoot && squaredDistance(x[eI], y[eI], z[eI], center) > radiusSq)
                continue;
            _indices.push(eI);
            _id.push(i);
        }
        indices = SortedArray.ofSortedArray(_indices);
        id = _id;
    }
    else {
        indices = elements;
        id = fillSerial(new Int32Array(indices.length));
    }
    if (includeParent && rootUnit !== unit) {
        filterUnitId(id, unit.elements, indices);
    }
    var position = { indices: indices, x: x, y: y, z: z, id: id };
    var boundary = differentRoot ? getBoundary(position) : unit.boundary;
    var l = StructureElement.Location.create(structure, rootUnit);
    var radius = function (index) {
        l.element = index;
        return sizeTheme.size(l);
    };
    return { position: position, boundary: boundary, radius: radius };
}
export function getStructureConformationAndRadius(structure, sizeTheme, props) {
    var ignoreHydrogens = props.ignoreHydrogens, ignoreHydrogensVariant = props.ignoreHydrogensVariant, traceOnly = props.traceOnly, includeParent = props.includeParent;
    var differentRoot = includeParent && !!structure.parent;
    var l = StructureElement.Location.create(structure.root);
    var _a = structure.boundary.sphere, center = _a.center, sphereRadius = _a.radius;
    var extraRadius = (4 + 1.5) * 2; // TODO should be twice (the max vdW/sphere radius plus the probe radius)
    var radiusSq = (sphereRadius + extraRadius) * (sphereRadius + extraRadius);
    var xs;
    var ys;
    var zs;
    var rs;
    var id;
    var indices;
    if (ignoreHydrogens || traceOnly || differentRoot) {
        var getSerialIndex = structure.serialMapping.getSerialIndex;
        var units = differentRoot ? structure.root.units : structure.units;
        var _xs = [];
        var _ys = [];
        var _zs = [];
        var _rs = [];
        var _id = [];
        for (var i = 0, il = units.length; i < il; ++i) {
            var unit = units[i];
            var elements = unit.elements;
            var _b = unit.conformation, x = _b.x, y = _b.y, z = _b.z;
            var childUnit = structure.unitMap.get(unit.id);
            l.unit = unit;
            for (var j = 0, jl = elements.length; j < jl; ++j) {
                var eI = elements[j];
                if (ignoreHydrogens && isHydrogen(structure, unit, eI, ignoreHydrogensVariant))
                    continue;
                if (traceOnly && !isTrace(unit, eI))
                    continue;
                var _x = x(eI), _y = y(eI), _z = z(eI);
                if (differentRoot && squaredDistance(_x, _y, _z, center) > radiusSq)
                    continue;
                _xs.push(_x);
                _ys.push(_y);
                _zs.push(_z);
                l.element = eI;
                _rs.push(sizeTheme.size(l));
                if (differentRoot) {
                    var idx = childUnit ? SortedArray.indexOf(childUnit.elements, eI) : -1;
                    if (idx === -1) {
                        _id.push(-2); // mark for filtering/ignoring when not in `elements`
                    }
                    else {
                        _id.push(getSerialIndex(childUnit, eI));
                    }
                }
                else {
                    _id.push(getSerialIndex(unit, eI));
                }
            }
        }
        xs = _xs, ys = _ys, zs = _zs, rs = _rs;
        id = _id;
        indices = OrderedSet.ofRange(0, id.length);
    }
    else {
        var elementCount = structure.elementCount;
        var _xs = new Float32Array(elementCount);
        var _ys = new Float32Array(elementCount);
        var _zs = new Float32Array(elementCount);
        var _rs = new Float32Array(elementCount);
        for (var i = 0, m = 0, il = structure.units.length; i < il; ++i) {
            var unit = structure.units[i];
            var elements = unit.elements;
            var _c = unit.conformation, x = _c.x, y = _c.y, z = _c.z;
            l.unit = unit;
            for (var j = 0, jl = elements.length; j < jl; ++j) {
                var eI = elements[j];
                var mj = m + j;
                _xs[mj] = x(eI);
                _ys[mj] = y(eI);
                _zs[mj] = z(eI);
                l.element = eI;
                _rs[mj] = sizeTheme.size(l);
            }
            m += elements.length;
        }
        xs = _xs, ys = _ys, zs = _zs, rs = _rs;
        id = fillSerial(new Uint32Array(elementCount));
        indices = OrderedSet.ofRange(0, id.length);
    }
    var position = { indices: indices, x: xs, y: ys, z: zs, id: id };
    var boundary = differentRoot ? getBoundary(position) : structure.boundary;
    var radius = function (index) { return rs[index]; };
    return { position: position, boundary: boundary, radius: radius };
}
var _H = AtomicNumbers['H'];
export function isHydrogen(structure, unit, element, variant) {
    if (Unit.isCoarse(unit))
        return false;
    if (unit.model.atomicHierarchy.derived.atom.atomicNumber[element] !== _H)
        return false;
    if (variant === 'all')
        return true;
    var polar = hasPolarNeighbour(structure, unit, SortedArray.indexOf(unit.elements, element));
    if (polar && variant === 'polar')
        return true;
    if (!polar && variant === 'non-polar')
        return true;
    return false;
}
export function isH(atomicNumber, element) {
    return atomicNumber[element] === _H;
}
export function isTrace(unit, element) {
    if (Unit.isCoarse(unit))
        return true;
    var atomId = unit.model.atomicHierarchy.atoms.label_atom_id.value(element);
    if (atomId === 'CA' || atomId === 'BB' || atomId === 'P')
        return true;
    return false;
}
