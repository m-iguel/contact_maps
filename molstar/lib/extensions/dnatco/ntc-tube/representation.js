/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { NtCTubeProvider } from './property';
import { NtCTubeSegmentsIterator } from './util';
import { NtCTubeTypes as NTT } from './types';
import { Dnatco } from '../property';
import { DnatcoUtil } from '../util';
import { Interval } from '../../../mol-data/int';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { addFixedCountDashedCylinder } from '../../../mol-geo/geometry/mesh/builder/cylinder';
import { MeshBuilder } from '../../../mol-geo/geometry/mesh/mesh-builder';
import { addTube } from '../../../mol-geo/geometry/mesh/builder/tube';
import { LocationIterator } from '../../../mol-geo/util/location-iterator';
import { Sphere3D } from '../../../mol-math/geometry/primitives/sphere3d';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { smoothstep } from '../../../mol-math/interpolate';
import { NullLocation } from '../../../mol-model/location';
import { EmptyLoci } from '../../../mol-model/loci';
import { Structure, StructureElement, Unit } from '../../../mol-model/structure';
import { structureUnion } from '../../../mol-model/structure/query/utils/structure-set';
import { Representation } from '../../../mol-repr/representation';
import { StructureRepresentationProvider, StructureRepresentationStateBuilder, UnitsRepresentation } from '../../../mol-repr/structure/representation';
import { UnitsMeshParams, UnitsMeshVisual } from '../../../mol-repr/structure/units-visual';
import { createCurveSegmentState } from '../../../mol-repr/structure/visual/util/polymer';
import { getStructureQuality } from '../../../mol-repr/util';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
var v3add = Vec3.add;
var v3copy = Vec3.copy;
var v3cross = Vec3.cross;
var v3fromArray = Vec3.fromArray;
var v3matchDirection = Vec3.matchDirection;
var v3normalize = Vec3.normalize;
var v3orthogonalize = Vec3.orthogonalize;
var v3scale = Vec3.scale;
var v3slerp = Vec3.slerp;
var v3spline = Vec3.spline;
var v3sub = Vec3.sub;
var v3toArray = Vec3.toArray;
var NtCTubeMeshParams = __assign(__assign({}, UnitsMeshParams), { linearSegments: PD.Numeric(4, { min: 2, max: 8, step: 1 }, BaseGeometry.CustomQualityParamInfo), radialSegments: PD.Numeric(22, { min: 4, max: 56, step: 2 }, BaseGeometry.CustomQualityParamInfo), residueMarkerWidth: PD.Numeric(0.05, { min: 0.01, max: 0.25, step: 0.01 }), segmentBoundaryWidth: PD.Numeric(0.05, { min: 0.01, max: 0.25, step: 0.01 }) });
var LinearSegmentCount = {
    highest: 6,
    higher: 6,
    high: 4,
    medium: 4,
    low: 3,
    lower: 3,
    lowest: 2,
};
var RadialSegmentCount = {
    highest: 32,
    higher: 26,
    high: 22,
    medium: 18,
    low: 14,
    lower: 10,
    lowest: 6,
};
var _curvePoint = Vec3();
var _tanA = Vec3();
var _tanB = Vec3();
var _firstTangentVec = Vec3();
var _lastTangentVec = Vec3();
var _firstNormalVec = Vec3();
var _lastNormalVec = Vec3();
var _tmpNormal = Vec3();
var _tangentVec = Vec3();
var _normalVec = Vec3();
var _binormalVec = Vec3();
var _prevNormal = Vec3();
var _nextNormal = Vec3();
function interpolatePointsAndTangents(state, p0, p1, p2, p3, tRange) {
    var curvePoints = state.curvePoints, tangentVectors = state.tangentVectors, linearSegments = state.linearSegments;
    var tension = 0.5;
    var r = tRange[1] - tRange[0];
    for (var j = 0; j <= linearSegments; ++j) {
        var t = j * r / linearSegments + tRange[0];
        v3spline(_curvePoint, p0, p1, p2, p3, t, tension);
        v3spline(_tanA, p0, p1, p2, p3, t - 0.01, tension);
        v3spline(_tanB, p0, p1, p2, p3, t + 0.01, tension);
        v3toArray(_curvePoint, curvePoints, j * 3);
        v3normalize(_tangentVec, v3sub(_tangentVec, _tanA, _tanB));
        v3toArray(_tangentVec, tangentVectors, j * 3);
    }
}
function interpolateNormals(state, firstDirection, lastDirection) {
    var curvePoints = state.curvePoints, tangentVectors = state.tangentVectors, normalVectors = state.normalVectors, binormalVectors = state.binormalVectors;
    var n = curvePoints.length / 3;
    v3fromArray(_firstTangentVec, tangentVectors, 0);
    v3fromArray(_lastTangentVec, tangentVectors, (n - 1) * 3);
    v3orthogonalize(_firstNormalVec, _firstTangentVec, firstDirection);
    v3orthogonalize(_lastNormalVec, _lastTangentVec, lastDirection);
    v3matchDirection(_lastNormalVec, _lastNormalVec, _firstNormalVec);
    v3copy(_prevNormal, _firstNormalVec);
    var n1 = n - 1;
    for (var i = 0; i < n; ++i) {
        var j = smoothstep(0, n1, i) * n1;
        var t = i === 0 ? 0 : 1 / (n - j);
        v3fromArray(_tangentVec, tangentVectors, i * 3);
        v3orthogonalize(_normalVec, _tangentVec, v3slerp(_tmpNormal, _prevNormal, _lastNormalVec, t));
        v3toArray(_normalVec, normalVectors, i * 3);
        v3copy(_prevNormal, _normalVec);
        v3normalize(_binormalVec, v3cross(_binormalVec, _tangentVec, _normalVec));
        v3toArray(_binormalVec, binormalVectors, i * 3);
    }
    for (var i = 1; i < n1; ++i) {
        v3fromArray(_prevNormal, normalVectors, (i - 1) * 3);
        v3fromArray(_normalVec, normalVectors, i * 3);
        v3fromArray(_nextNormal, normalVectors, (i + 1) * 3);
        v3scale(_normalVec, v3add(_normalVec, _prevNormal, v3add(_normalVec, _nextNormal, _normalVec)), 1 / 3);
        v3toArray(_normalVec, normalVectors, i * 3);
        v3fromArray(_tangentVec, tangentVectors, i * 3);
        v3normalize(_binormalVec, v3cross(_binormalVec, _tangentVec, _normalVec));
        v3toArray(_binormalVec, binormalVectors, i * 3);
    }
}
function interpolate(state, p0, p1, p2, p3, firstDir, lastDir, tRange) {
    if (tRange === void 0) { tRange = [0, 1]; }
    interpolatePointsAndTangents(state, p0, p1, p2, p3, tRange);
    interpolateNormals(state, firstDir, lastDir);
}
function createNtCTubeSegmentsIterator(structureGroup) {
    var _a, _b;
    var structure = structureGroup.structure, group = structureGroup.group;
    var instanceCount = group.units.length;
    var data = (_b = (_a = NtCTubeProvider.get(structure.model)) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.data;
    if (!data)
        return LocationIterator(0, 1, 1, function () { return NullLocation; });
    var numBlocks = data.data.steps.length * 4;
    var getLocation = function (groupId, instanceId) {
        if (groupId > numBlocks)
            return NullLocation;
        var stepIdx = Math.floor(groupId / 4);
        var step = data.data.steps[stepIdx];
        var r = groupId % 4;
        var kind = r === 0 ? 'upper' :
            r === 1 ? 'lower' :
                r === 2 ? 'residue-boundary' : 'segment-boundary';
        return NTT.Location({ step: step, kind: kind });
    };
    return LocationIterator(totalMeshGroupsCount(data.data.steps) + 1, instanceCount, 1, getLocation);
}
function segmentCount(structure, props) {
    var quality = props.quality;
    if (quality === 'custom')
        return { linear: props.linearSegments, radial: props.radialSegments };
    else if (quality === 'auto') {
        var autoQuality = getStructureQuality(structure);
        return { linear: LinearSegmentCount[autoQuality], radial: RadialSegmentCount[autoQuality] };
    }
    else
        return { linear: LinearSegmentCount[quality], radial: RadialSegmentCount[quality] };
}
function stepBoundingSphere(step, struLoci) {
    var one = DnatcoUtil.residueToLoci(step.auth_asym_id_1, step.auth_seq_id_1, step.label_alt_id_1, step.PDB_ins_code_1, struLoci, 'auth');
    var two = DnatcoUtil.residueToLoci(step.auth_asym_id_2, step.auth_seq_id_2, step.label_alt_id_2, step.PDB_ins_code_2, struLoci, 'auth');
    if (StructureElement.Loci.is(one) && StructureElement.Loci.is(two)) {
        var union = structureUnion(struLoci.structure, [StructureElement.Loci.toStructure(one), StructureElement.Loci.toStructure(two)]);
        return union.boundary.sphere;
    }
    return void 0;
}
function totalMeshGroupsCount(steps) {
    // Each segment has two blocks, Residue Boundary marker and a Segment Boundary marker
    return steps.length * 4 - 1; // Subtract one because the last Segment Boundary marker is not drawn
}
function createNtCTubeMesh(ctx, unit, structure, theme, props, mesh) {
    if (!Unit.isAtomic(unit))
        return Mesh.createEmpty(mesh);
    var prop = NtCTubeProvider.get(structure.model).value;
    if (prop === undefined || prop.data === undefined)
        return Mesh.createEmpty(mesh);
    var data = prop.data.data;
    if (data.steps.length === 0)
        return Mesh.createEmpty(mesh);
    var MarkerLinearSegmentCount = 2;
    var segCount = segmentCount(structure, props);
    var vertexCount = Math.floor((segCount.linear * 4 * data.steps.length / structure.model.atomicHierarchy.chains._rowCount) * segCount.radial);
    var chunkSize = Math.floor(vertexCount / 3);
    var diameter = 1.0 * theme.size.props.value;
    var mb = MeshBuilder.createState(vertexCount, chunkSize, mesh);
    var state = createCurveSegmentState(segCount.linear);
    var curvePoints = state.curvePoints, normalVectors = state.normalVectors, binormalVectors = state.binormalVectors, widthValues = state.widthValues, heightValues = state.heightValues;
    for (var idx = 0; idx <= segCount.linear; idx++) {
        widthValues[idx] = diameter;
        heightValues[idx] = diameter;
    }
    var _a = [binormalVectors, normalVectors], normals = _a[0], binormals = _a[1]; // Needed so that the tube is not drawn from inside out
    var markerState = createCurveSegmentState(MarkerLinearSegmentCount);
    var mCurvePoints = markerState.curvePoints, mNormalVectors = markerState.normalVectors, mBinormalVectors = markerState.binormalVectors, mWidthValues = markerState.widthValues, mHeightValues = markerState.heightValues;
    for (var idx = 0; idx <= MarkerLinearSegmentCount; idx++) {
        mWidthValues[idx] = diameter;
        mHeightValues[idx] = diameter;
    }
    var _b = [mBinormalVectors, mNormalVectors], mNormals = _b[0], mBinormals = _b[1];
    var firstDir = Vec3();
    var lastDir = Vec3();
    var markerDir = Vec3();
    var residueMarkerWidth = props.residueMarkerWidth / 2;
    var it = new NtCTubeSegmentsIterator(structure, unit);
    while (it.hasNext) {
        var segment = it.move();
        if (!segment)
            continue;
        var p_1 = segment.p_1, p0 = segment.p0, p1 = segment.p1, p2 = segment.p2, p3 = segment.p3, p4 = segment.p4, pP = segment.pP;
        var FirstBlockId = segment.stepIdx * 4;
        var SecondBlockId = FirstBlockId + 1;
        var ResidueMarkerId = FirstBlockId + 2;
        var SegmentBoundaryMarkerId = FirstBlockId + 3;
        var _c = calcResidueMarkerShift(p2, p3, pP), rmShift = _c.rmShift, rmPos = _c.rmPos;
        if (segment.firstInChain) {
            v3normalize(firstDir, v3sub(firstDir, p2, p1));
            v3normalize(lastDir, v3sub(lastDir, rmPos, p2));
        }
        else {
            v3copy(firstDir, lastDir);
            v3normalize(lastDir, v3sub(lastDir, rmPos, p2));
        }
        // C5' -> O3' block
        interpolate(state, p0, p1, p2, p3, firstDir, lastDir);
        mb.currentGroup = FirstBlockId;
        addTube(mb, curvePoints, normals, binormals, segCount.linear, segCount.radial, widthValues, heightValues, segment.firstInChain || segment.followsGap, false, 'rounded');
        // O3' -> C5' block
        v3copy(firstDir, lastDir);
        v3normalize(markerDir, v3sub(markerDir, p3, rmPos));
        v3normalize(lastDir, v3sub(lastDir, p4, p3));
        // From O3' to the residue marker
        interpolate(state, p1, p2, p3, p4, firstDir, markerDir, [0, rmShift - residueMarkerWidth]);
        mb.currentGroup = SecondBlockId;
        addTube(mb, curvePoints, normals, binormals, segCount.linear, segCount.radial, widthValues, heightValues, false, false, 'rounded');
        // Residue marker
        interpolate(markerState, p1, p2, p3, p4, markerDir, markerDir, [rmShift - residueMarkerWidth, rmShift + residueMarkerWidth]);
        mb.currentGroup = ResidueMarkerId;
        addTube(mb, mCurvePoints, mNormals, mBinormals, MarkerLinearSegmentCount, segCount.radial, mWidthValues, mHeightValues, false, false, 'rounded');
        if (segment.capEnd) {
            // From the residue marker to C5' of the end
            interpolate(state, p1, p2, p3, p4, markerDir, lastDir, [rmShift + residueMarkerWidth, 1]);
            mb.currentGroup = SecondBlockId;
            addTube(mb, curvePoints, normals, binormals, segCount.linear, segCount.radial, widthValues, heightValues, false, true, 'rounded');
        }
        else {
            // From the residue marker to C5' of the step boundary marker
            interpolate(state, p1, p2, p3, p4, markerDir, lastDir, [rmShift + residueMarkerWidth, 1 - props.segmentBoundaryWidth]);
            mb.currentGroup = SecondBlockId;
            addTube(mb, curvePoints, normals, binormals, segCount.linear, segCount.radial, widthValues, heightValues, false, false, 'rounded');
            // Step boundary marker
            interpolate(markerState, p1, p2, p3, p4, lastDir, lastDir, [1 - props.segmentBoundaryWidth, 1]);
            mb.currentGroup = SegmentBoundaryMarkerId;
            addTube(mb, mCurvePoints, mNormals, mBinormals, MarkerLinearSegmentCount, segCount.radial, mWidthValues, mHeightValues, false, false, 'rounded');
        }
        if (segment.followsGap) {
            var cylinderProps = {
                radiusTop: diameter / 2, radiusBottom: diameter / 2, topCap: true, bottomCap: true, radialSegments: segCount.radial,
            };
            mb.currentGroup = FirstBlockId;
            addFixedCountDashedCylinder(mb, p_1, p1, 1, 2 * segCount.linear, false, cylinderProps);
        }
    }
    var boundingSphere = Sphere3D.expand(Sphere3D(), unit.boundary.sphere, 1.05);
    var m = MeshBuilder.getMesh(mb);
    m.setBoundingSphere(boundingSphere);
    return m;
}
var _rmvCO = Vec3();
var _rmvPO = Vec3();
var _rmPos = Vec3();
var _HalfPi = Math.PI / 2;
function calcResidueMarkerShift(pO, pC, pP) {
    v3sub(_rmvCO, pC, pO);
    v3sub(_rmvPO, pP, pO);
    // Project position of P atom on the O3' -> C5' vector
    var beta = Vec3.angle(_rmvPO, _rmvCO);
    var alpha = _HalfPi - Math.abs(beta);
    var lengthMO = Math.cos(alpha) * Vec3.magnitude(_rmvPO);
    var shift = lengthMO / Vec3.magnitude(_rmvCO);
    v3scale(_rmvCO, _rmvCO, shift);
    v3add(_rmPos, _rmvCO, pO);
    return { rmShift: shift, rmPos: _rmPos };
}
function getNtCTubeSegmentLoci(pickingId, structureGroup, id) {
    var _a, _b, _c;
    var groupId = pickingId.groupId, objectId = pickingId.objectId, instanceId = pickingId.instanceId;
    if (objectId !== id)
        return EmptyLoci;
    var structure = structureGroup.structure;
    var unit = structureGroup.group.units[instanceId];
    if (!Unit.isAtomic(unit))
        return EmptyLoci;
    var data = (_c = (_b = (_a = NtCTubeProvider.get(structure.model)) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : undefined;
    if (!data)
        return EmptyLoci;
    var MeshGroupsCount = totalMeshGroupsCount(data.data.steps);
    if (groupId > MeshGroupsCount)
        return EmptyLoci;
    var stepIdx = Math.floor(groupId / 4);
    var bs = stepBoundingSphere(data.data.steps[stepIdx], Structure.toStructureElementLoci(structure));
    /*
     * NOTE 1) Each step is drawn with 4 mesh groups. We need to divide/multiply by 4 to convert between steps and mesh groups.
     * NOTE 2) Molstar will create a mesh only for the asymmetric unit. When the entire biological assembly
     *         is displayed, Molstar just copies and transforms the mesh. This means that even though the mesh
     *         might be displayed multiple times, groupIds of the individual blocks in the mesh will be the same.
     *         If there are multiple copies of a mesh, Molstar needs to be able to tell which block belongs to which copy of the mesh.
     *         To do that, Molstar adds an offset to groupIds of the copied meshes. Offset is calculated as follows:
     *
     *         offset = NumberOfBlocks * UnitIndex
     *
     *         "NumberOfBlocks" is the number of valid Location objects got from LocationIterator *or* the greatest groupId set by
     *         the mesh generator - whichever is smaller.
     *
     *         UnitIndex is the index of the Unit the mesh belongs to, starting from 0. (See "unitMap" in the Structure object).
     *         We can also get this index from the value "instanceId" of the "pickingId" object.
     *
     *         If this offset is not applied, picking a piece of one of the copied meshes would actually pick that piece in the original mesh.
     *         This is particularly apparent with highlighting - hovering over items in a copied mesh incorrectly highlights those items in the source mesh.
     *
     *         Molstar can take advantage of the fact that ElementLoci has a reference to the Unit object attached to it. Since we cannot attach ElementLoci
     *         to a step, we need to calculate the offseted groupId here and pass it as part of the DataLoci.
     */
    var offsetGroupId = stepIdx * 4 + (MeshGroupsCount + 1) * instanceId;
    return NTT.Loci(data.data.steps, [stepIdx], [offsetGroupId], bs);
}
function eachNtCTubeSegment(loci, structureGroup, apply) {
    if (NTT.isLoci(loci)) {
        var offsetGroupId = loci.elements[0];
        return apply(Interval.ofBounds(offsetGroupId, offsetGroupId + 4));
    }
    return false;
}
function NtCTubeVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(NtCTubeMeshParams),
        createGeometry: createNtCTubeMesh,
        createLocationIterator: createNtCTubeSegmentsIterator,
        getLoci: getNtCTubeSegmentLoci,
        eachLocation: eachNtCTubeSegment,
        setUpdateState: function (state, newProps, currentProps) {
            state.createGeometry = (newProps.quality !== currentProps.quality ||
                newProps.residueMarkerWidth !== currentProps.residueMarkerWidth ||
                newProps.segmentBoundaryWidth !== currentProps.segmentBoundaryWidth ||
                newProps.doubleSided !== currentProps.doubleSided ||
                newProps.alpha !== currentProps.alpha ||
                newProps.linearSegments !== currentProps.linearSegments ||
                newProps.radialSegments !== currentProps.radialSegments);
        }
    }, materialId);
}
var NtCTubeVisuals = {
    'ntc-tube-symbol': function (ctx, getParams) { return UnitsRepresentation('NtC Tube Mesh', ctx, getParams, NtCTubeVisual); },
};
export var NtCTubeParams = __assign({}, NtCTubeMeshParams);
export function getNtCTubeParams(ctx, structure) {
    return PD.clone(NtCTubeParams);
}
export function NtCTubeRepresentation(ctx, getParams) {
    return Representation.createMulti('NtC Tube', ctx, getParams, StructureRepresentationStateBuilder, NtCTubeVisuals);
}
export var NtCTubeRepresentationProvider = StructureRepresentationProvider({
    name: 'ntc-tube',
    label: 'NtC Tube',
    description: 'Displays schematic representation of NtC conformers',
    factory: NtCTubeRepresentation,
    getParams: getNtCTubeParams,
    defaultValues: PD.getDefaultValues(NtCTubeParams),
    defaultColorTheme: { name: 'ntc-tube' },
    defaultSizeTheme: { name: 'uniform', props: { value: 2.0 } },
    isApplicable: function (structure) { return structure.models.every(function (m) { return Dnatco.isApplicable(m); }); },
    ensureCustomProperties: {
        attach: function (ctx, structure) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, structure.models.forEach(function (m) { return NtCTubeProvider.attach(ctx, m, void 0, true); })];
        }); }); },
        detach: function (data) { return data.models.forEach(function (m) { return NtCTubeProvider.ref(m, false); }); },
    },
});
