/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { __assign } from "tslib";
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../../mol-geo/geometry/mesh/mesh-builder';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { PolymerGapIterator, PolymerGapLocationIterator, getPolymerGapElementLoci, eachPolymerGapElement } from './util/polymer';
import { addFixedCountDashedCylinder } from '../../../mol-geo/geometry/mesh/builder/cylinder';
import { UnitsMeshParams, UnitsMeshVisual } from '../units-visual';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
import { Sphere3D } from '../../../mol-math/geometry';
// import { TriangularPyramid } from '../../../mol-geo/primitive/pyramid';
var segmentCount = 10;
export var PolymerGapCylinderParams = {
    sizeFactor: PD.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    radialSegments: PD.Numeric(16, { min: 2, max: 56, step: 2 }, BaseGeometry.CustomQualityParamInfo),
};
export var DefaultPolymerGapCylinderProps = PD.getDefaultValues(PolymerGapCylinderParams);
// const triangularPyramid = TriangularPyramid()
// const t = Mat4.identity()
// const pd = Vec3.zero()
function createPolymerGapCylinderMesh(ctx, unit, structure, theme, props, mesh) {
    var polymerGapCount = unit.gapElements.length;
    if (!polymerGapCount)
        return Mesh.createEmpty(mesh);
    var sizeFactor = props.sizeFactor, radialSegments = props.radialSegments;
    var vertexCountEstimate = segmentCount * radialSegments * 2 * polymerGapCount * 2;
    var builderState = MeshBuilder.createState(vertexCountEstimate, vertexCountEstimate / 10, mesh);
    var pos = unit.conformation.invariantPosition;
    var pA = Vec3.zero();
    var pB = Vec3.zero();
    var cylinderProps = {
        radiusTop: 1, radiusBottom: 1, topCap: true, bottomCap: true,
        radialSegments: radialSegments
    };
    var i = 0;
    var polymerGapIt = PolymerGapIterator(structure, unit);
    while (polymerGapIt.hasNext) {
        var _a = polymerGapIt.move(), centerA = _a.centerA, centerB = _a.centerB;
        if (centerA.element === centerB.element) {
            // TODO
            // builderState.currentGroup = i
            // pos(centerA.element, pA)
            // Vec3.add(pd, pA, Vec3.create(1, 0, 0))
            // Mat4.targetTo(t, pA, pd, Vec3.create(0, 1, 0))
            // Mat4.setTranslation(t, pA)
            // Mat4.scale(t, t, Vec3.create(0.7, 0.7, 2.5))
            // MeshBuilder.addPrimitive(builderState, t, triangularPyramid)
        }
        else {
            pos(centerA.element, pA);
            pos(centerB.element, pB);
            cylinderProps.radiusTop = cylinderProps.radiusBottom = theme.size.size(centerA) * sizeFactor;
            builderState.currentGroup = i;
            addFixedCountDashedCylinder(builderState, pA, pB, 0.5, segmentCount, false, cylinderProps);
            cylinderProps.radiusTop = cylinderProps.radiusBottom = theme.size.size(centerB) * sizeFactor;
            builderState.currentGroup = i + 1;
            addFixedCountDashedCylinder(builderState, pB, pA, 0.5, segmentCount, false, cylinderProps);
        }
        i += 2;
    }
    var m = MeshBuilder.getMesh(builderState);
    var sphere = Sphere3D.expand(Sphere3D(), unit.boundary.sphere, 1 * props.sizeFactor);
    m.setBoundingSphere(sphere);
    return m;
}
export var PolymerGapParams = __assign(__assign({}, UnitsMeshParams), PolymerGapCylinderParams);
export function PolymerGapVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(PolymerGapParams),
        createGeometry: createPolymerGapCylinderMesh,
        createLocationIterator: PolymerGapLocationIterator.fromGroup,
        getLoci: getPolymerGapElementLoci,
        eachLocation: eachPolymerGapElement,
        setUpdateState: function (state, newProps, currentProps) {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.radialSegments !== currentProps.radialSegments);
        }
    }, materialId);
}
