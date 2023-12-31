/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../../mol-geo/geometry/mesh/mesh-builder';
import { createCurveSegmentState, PolymerTraceIterator, interpolateCurveSegment, interpolateSizes, PolymerLocationIterator, getPolymerElementLoci, eachPolymerElement, StandardTension, StandardShift, NucleicShift, OverhangFactor } from './util/polymer';
import { isNucleic } from '../../../mol-model/structure/model/types';
import { addTube } from '../../../mol-geo/geometry/mesh/builder/tube';
import { UnitsMeshParams, UnitsMeshVisual } from '../units-visual';
import { addSheet } from '../../../mol-geo/geometry/mesh/builder/sheet';
import { addRibbon } from '../../../mol-geo/geometry/mesh/builder/ribbon';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { addSphere } from '../../../mol-geo/geometry/mesh/builder/sphere';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
import { Sphere3D } from '../../../mol-math/geometry';
export var PolymerTubeMeshParams = {
    sizeFactor: PD.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    detail: PD.Numeric(0, { min: 0, max: 3, step: 1 }, BaseGeometry.CustomQualityParamInfo),
    linearSegments: PD.Numeric(8, { min: 1, max: 48, step: 1 }, BaseGeometry.CustomQualityParamInfo),
    radialSegments: PD.Numeric(16, { min: 2, max: 56, step: 2 }, BaseGeometry.CustomQualityParamInfo),
};
export var DefaultPolymerTubeMeshProps = PD.getDefaultValues(PolymerTubeMeshParams);
var tmpV1 = Vec3();
function createPolymerTubeMesh(ctx, unit, structure, theme, props, mesh) {
    var polymerElementCount = unit.polymerElements.length;
    if (!polymerElementCount)
        return Mesh.createEmpty(mesh);
    var sizeFactor = props.sizeFactor, detail = props.detail, linearSegments = props.linearSegments, radialSegments = props.radialSegments;
    var vertexCount = linearSegments * radialSegments * polymerElementCount + (radialSegments + 1) * polymerElementCount * 2;
    var builderState = MeshBuilder.createState(vertexCount, vertexCount / 10, mesh);
    var state = createCurveSegmentState(linearSegments);
    var curvePoints = state.curvePoints, normalVectors = state.normalVectors, binormalVectors = state.binormalVectors, widthValues = state.widthValues, heightValues = state.heightValues;
    var i = 0;
    var polymerTraceIt = PolymerTraceIterator(unit, structure, { ignoreSecondaryStructure: true });
    while (polymerTraceIt.hasNext) {
        var v = polymerTraceIt.move();
        builderState.currentGroup = i;
        var isNucleicType = isNucleic(v.moleculeType);
        var shift = isNucleicType ? NucleicShift : StandardShift;
        interpolateCurveSegment(state, v, StandardTension, shift);
        var startCap = v.coarseBackboneFirst || v.first;
        var endCap = v.coarseBackboneLast || v.last;
        var s0 = theme.size.size(v.centerPrev) * sizeFactor;
        var s1 = theme.size.size(v.center) * sizeFactor;
        var s2 = theme.size.size(v.centerNext) * sizeFactor;
        interpolateSizes(state, s0, s1, s2, s0, s1, s2, shift);
        var segmentCount = linearSegments;
        if (v.initial) {
            segmentCount = Math.max(Math.round(linearSegments * shift), 1);
            var offset = linearSegments - segmentCount;
            curvePoints.copyWithin(0, offset * 3);
            binormalVectors.copyWithin(0, offset * 3);
            normalVectors.copyWithin(0, offset * 3);
            widthValues.copyWithin(0, offset * 3);
            heightValues.copyWithin(0, offset * 3);
            Vec3.fromArray(tmpV1, curvePoints, 3);
            Vec3.normalize(tmpV1, Vec3.sub(tmpV1, v.p2, tmpV1));
            Vec3.scaleAndAdd(tmpV1, v.p2, tmpV1, s1 * OverhangFactor);
            Vec3.toArray(tmpV1, curvePoints, 0);
        }
        else if (v.final) {
            segmentCount = Math.max(Math.round(linearSegments * (1 - shift)), 1);
            Vec3.fromArray(tmpV1, curvePoints, segmentCount * 3 - 3);
            Vec3.normalize(tmpV1, Vec3.sub(tmpV1, v.p2, tmpV1));
            Vec3.scaleAndAdd(tmpV1, v.p2, tmpV1, s1 * OverhangFactor);
            Vec3.toArray(tmpV1, curvePoints, segmentCount * 3);
        }
        if (v.initial === true && v.final === true) {
            addSphere(builderState, v.p2, s1 * 2, detail);
        }
        else if (radialSegments === 2) {
            addRibbon(builderState, curvePoints, normalVectors, binormalVectors, segmentCount, widthValues, heightValues, 0);
        }
        else if (radialSegments === 4) {
            addSheet(builderState, curvePoints, normalVectors, binormalVectors, segmentCount, widthValues, heightValues, 0, startCap, endCap);
        }
        else {
            addTube(builderState, curvePoints, normalVectors, binormalVectors, segmentCount, radialSegments, widthValues, heightValues, startCap, endCap, 'elliptical');
        }
        ++i;
    }
    var m = MeshBuilder.getMesh(builderState);
    var sphere = Sphere3D.expand(Sphere3D(), unit.boundary.sphere, 1 * props.sizeFactor);
    m.setBoundingSphere(sphere);
    return m;
}
export var PolymerTubeParams = __assign(__assign({}, UnitsMeshParams), PolymerTubeMeshParams);
export function PolymerTubeVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(PolymerTubeParams),
        createGeometry: createPolymerTubeMesh,
        createLocationIterator: function (sg) { return PolymerLocationIterator.fromGroup(sg, true); },
        getLoci: getPolymerElementLoci,
        eachLocation: eachPolymerElement,
        setUpdateState: function (state, newProps, currentProps) {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.detail !== currentProps.detail ||
                newProps.linearSegments !== currentProps.linearSegments ||
                newProps.radialSegments !== currentProps.radialSegments);
        }
    }, materialId);
}
