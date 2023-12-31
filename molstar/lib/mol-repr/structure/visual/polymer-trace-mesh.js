/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Unit } from '../../../mol-model/structure';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../../mol-geo/geometry/mesh/mesh-builder';
import { createCurveSegmentState, PolymerTraceIterator, interpolateCurveSegment, interpolateSizes, PolymerLocationIterator, getPolymerElementLoci, eachPolymerElement, HelixTension, NucleicShift, StandardShift, StandardTension, OverhangFactor } from './util/polymer';
import { isNucleic, SecondaryStructureType } from '../../../mol-model/structure/model/types';
import { addSheet } from '../../../mol-geo/geometry/mesh/builder/sheet';
import { addTube } from '../../../mol-geo/geometry/mesh/builder/tube';
import { UnitsMeshParams, UnitsMeshVisual } from '../units-visual';
import { SecondaryStructureProvider } from '../../../mol-model-props/computed/secondary-structure';
import { addRibbon } from '../../../mol-geo/geometry/mesh/builder/ribbon';
import { addSphere } from '../../../mol-geo/geometry/mesh/builder/sphere';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
import { Sphere3D } from '../../../mol-math/geometry';
export var PolymerTraceMeshParams = {
    sizeFactor: PD.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    aspectRatio: PD.Numeric(5, { min: 0.1, max: 10, step: 0.1 }),
    arrowFactor: PD.Numeric(1.5, { min: 0, max: 3, step: 0.1 }, { description: 'Size factor for sheet arrows' }),
    tubularHelices: PD.Boolean(false, { description: 'Draw alpha helices as tubes' }),
    helixProfile: PD.Select('elliptical', PD.arrayToOptions(['elliptical', 'rounded', 'square']), { description: 'Protein helix trace profile' }),
    nucleicProfile: PD.Select('square', PD.arrayToOptions(['elliptical', 'rounded', 'square']), { description: 'Nucleic strand trace profile' }),
    detail: PD.Numeric(0, { min: 0, max: 3, step: 1 }, BaseGeometry.CustomQualityParamInfo),
    linearSegments: PD.Numeric(8, { min: 1, max: 48, step: 1 }, BaseGeometry.CustomQualityParamInfo),
    radialSegments: PD.Numeric(16, { min: 2, max: 56, step: 2 }, BaseGeometry.CustomQualityParamInfo)
};
export var DefaultPolymerTraceMeshProps = PD.getDefaultValues(PolymerTraceMeshParams);
var tmpV1 = Vec3();
function createPolymerTraceMesh(ctx, unit, structure, theme, props, mesh) {
    var polymerElementCount = unit.polymerElements.length;
    if (!polymerElementCount)
        return Mesh.createEmpty(mesh);
    var sizeFactor = props.sizeFactor, detail = props.detail, linearSegments = props.linearSegments, radialSegments = props.radialSegments, aspectRatio = props.aspectRatio, arrowFactor = props.arrowFactor, tubularHelices = props.tubularHelices, helixProfile = props.helixProfile, nucleicProfile = props.nucleicProfile;
    var vertexCount = linearSegments * radialSegments * polymerElementCount + (radialSegments + 1) * polymerElementCount * 2;
    var builderState = MeshBuilder.createState(vertexCount, vertexCount / 10, mesh);
    var isCoarse = Unit.isCoarse(unit);
    var state = createCurveSegmentState(linearSegments);
    var curvePoints = state.curvePoints, normalVectors = state.normalVectors, binormalVectors = state.binormalVectors, widthValues = state.widthValues, heightValues = state.heightValues;
    var i = 0;
    var polymerTraceIt = PolymerTraceIterator(unit, structure, { ignoreSecondaryStructure: false, useHelixOrientation: tubularHelices });
    while (polymerTraceIt.hasNext) {
        var v = polymerTraceIt.move();
        builderState.currentGroup = i;
        var isNucleicType = isNucleic(v.moleculeType);
        var isSheet = SecondaryStructureType.is(v.secStrucType, 4 /* SecondaryStructureType.Flag.Beta */);
        var isHelix = SecondaryStructureType.is(v.secStrucType, 2 /* SecondaryStructureType.Flag.Helix */);
        var tension = isHelix && !tubularHelices ? HelixTension : StandardTension;
        var shift = isNucleicType ? NucleicShift : StandardShift;
        interpolateCurveSegment(state, v, tension, shift);
        var w0 = theme.size.size(v.centerPrev) * sizeFactor;
        var w1 = theme.size.size(v.center) * sizeFactor;
        var w2 = theme.size.size(v.centerNext) * sizeFactor;
        if (isCoarse) {
            w0 *= aspectRatio / 2;
            w1 *= aspectRatio / 2;
            w2 *= aspectRatio / 2;
        }
        var startCap = v.secStrucFirst || v.coarseBackboneFirst || v.first;
        var endCap = v.secStrucLast || v.coarseBackboneLast || v.last;
        var segmentCount = linearSegments;
        if (v.initial) {
            segmentCount = Math.max(Math.round(linearSegments * shift), 1);
            var offset = linearSegments - segmentCount;
            curvePoints.copyWithin(0, offset * 3);
            binormalVectors.copyWithin(0, offset * 3);
            normalVectors.copyWithin(0, offset * 3);
            Vec3.fromArray(tmpV1, curvePoints, 3);
            Vec3.normalize(tmpV1, Vec3.sub(tmpV1, v.p2, tmpV1));
            Vec3.scaleAndAdd(tmpV1, v.p2, tmpV1, w1 * OverhangFactor);
            Vec3.toArray(tmpV1, curvePoints, 0);
        }
        else if (v.final) {
            segmentCount = Math.max(Math.round(linearSegments * (1 - shift)), 1);
            Vec3.fromArray(tmpV1, curvePoints, segmentCount * 3 - 3);
            Vec3.normalize(tmpV1, Vec3.sub(tmpV1, v.p2, tmpV1));
            Vec3.scaleAndAdd(tmpV1, v.p2, tmpV1, w1 * OverhangFactor);
            Vec3.toArray(tmpV1, curvePoints, segmentCount * 3);
        }
        if (v.initial === true && v.final === true) {
            addSphere(builderState, v.p2, w1 * 2, detail);
        }
        else if (isSheet) {
            var h0 = w0 * aspectRatio;
            var h1 = w1 * aspectRatio;
            var h2 = w2 * aspectRatio;
            var arrowHeight = v.secStrucLast ? h1 * arrowFactor : 0;
            interpolateSizes(state, w0, w1, w2, h0, h1, h2, shift);
            if (radialSegments === 2) {
                addRibbon(builderState, curvePoints, normalVectors, binormalVectors, segmentCount, widthValues, heightValues, arrowHeight);
            }
            else {
                addSheet(builderState, curvePoints, normalVectors, binormalVectors, segmentCount, widthValues, heightValues, arrowHeight, startCap, endCap);
            }
        }
        else {
            var h0 = void 0, h1 = void 0, h2 = void 0;
            if (isHelix && !v.isCoarseBackbone) {
                if (tubularHelices) {
                    w0 *= aspectRatio * 1.5;
                    w1 *= aspectRatio * 1.5;
                    w2 *= aspectRatio * 1.5;
                    h0 = w0;
                    h1 = w1;
                    h2 = w2;
                }
                else {
                    h0 = w0 * aspectRatio;
                    h1 = w1 * aspectRatio;
                    h2 = w2 * aspectRatio;
                }
            }
            else if (isNucleicType && !v.isCoarseBackbone) {
                h0 = w0 * aspectRatio;
                h1 = w1 * aspectRatio;
                h2 = w2 * aspectRatio;
            }
            else {
                h0 = w0;
                h1 = w1;
                h2 = w2;
            }
            interpolateSizes(state, w0, w1, w2, h0, h1, h2, shift);
            var _a = isNucleicType && !v.isCoarseBackbone ? [binormalVectors, normalVectors] : [normalVectors, binormalVectors], normals = _a[0], binormals = _a[1];
            if (isNucleicType && !v.isCoarseBackbone) {
                // TODO: find a cleaner way to swap normal and binormal for nucleic types
                for (var i_1 = 0, il = normals.length; i_1 < il; i_1++)
                    normals[i_1] *= -1;
            }
            var profile = isNucleicType ? nucleicProfile : helixProfile;
            if (radialSegments === 2) {
                if (isNucleicType && !v.isCoarseBackbone) {
                    addRibbon(builderState, curvePoints, normals, binormals, segmentCount, heightValues, widthValues, 0);
                }
                else {
                    addRibbon(builderState, curvePoints, normals, binormals, segmentCount, widthValues, heightValues, 0);
                }
            }
            else if (radialSegments === 4) {
                addSheet(builderState, curvePoints, normals, binormals, segmentCount, widthValues, heightValues, 0, startCap, endCap);
            }
            else if (h1 === w1) {
                addTube(builderState, curvePoints, normals, binormals, segmentCount, radialSegments, widthValues, heightValues, startCap, endCap, 'elliptical');
            }
            else if (profile === 'square') {
                addSheet(builderState, curvePoints, normals, binormals, segmentCount, widthValues, heightValues, 0, startCap, endCap);
            }
            else {
                addTube(builderState, curvePoints, normals, binormals, segmentCount, radialSegments, widthValues, heightValues, startCap, endCap, profile);
            }
        }
        ++i;
    }
    var m = MeshBuilder.getMesh(builderState);
    var sphere = Sphere3D.expand(Sphere3D(), unit.boundary.sphere, 1 * props.sizeFactor);
    m.setBoundingSphere(sphere);
    return m;
}
export var PolymerTraceParams = __assign(__assign({}, UnitsMeshParams), PolymerTraceMeshParams);
export function PolymerTraceVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(PolymerTraceParams),
        createGeometry: createPolymerTraceMesh,
        createLocationIterator: function (sg) { return PolymerLocationIterator.fromGroup(sg, true); },
        getLoci: getPolymerElementLoci,
        eachLocation: eachPolymerElement,
        setUpdateState: function (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.tubularHelices !== currentProps.tubularHelices ||
                newProps.detail !== currentProps.detail ||
                newProps.linearSegments !== currentProps.linearSegments ||
                newProps.radialSegments !== currentProps.radialSegments ||
                newProps.aspectRatio !== currentProps.aspectRatio ||
                newProps.arrowFactor !== currentProps.arrowFactor ||
                newProps.helixProfile !== currentProps.helixProfile ||
                newProps.nucleicProfile !== currentProps.nucleicProfile);
            var secondaryStructureHash = SecondaryStructureProvider.get(newStructureGroup.structure).version;
            if (state.info.secondaryStructureHash !== secondaryStructureHash) {
                if (state.info.secondaryStructureHash !== undefined)
                    state.createGeometry = true;
                state.info.secondaryStructureHash = secondaryStructureHash;
            }
        }
    }, materialId);
}
