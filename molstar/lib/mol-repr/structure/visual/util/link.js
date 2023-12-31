/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Zhenyu Zhang <jump2cn@gmail.com>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { Vec3 } from '../../../../mol-math/linear-algebra';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { Mesh } from '../../../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../../../mol-geo/geometry/mesh/mesh-builder';
import { addFixedCountDashedCylinder, addCylinder, addDoubleCylinder } from '../../../../mol-geo/geometry/mesh/builder/cylinder';
import { BaseGeometry } from '../../../../mol-geo/geometry/base';
import { Lines } from '../../../../mol-geo/geometry/lines/lines';
import { LinesBuilder } from '../../../../mol-geo/geometry/lines/lines-builder';
import { Cylinders } from '../../../../mol-geo/geometry/cylinders/cylinders';
import { CylindersBuilder } from '../../../../mol-geo/geometry/cylinders/cylinders-builder';
import { Sphere3D } from '../../../../mol-math/geometry/primitives/sphere3d';
export var LinkCylinderParams = {
    linkScale: PD.Numeric(0.45, { min: 0, max: 1, step: 0.01 }),
    linkSpacing: PD.Numeric(1, { min: 0, max: 2, step: 0.01 }),
    linkCap: PD.Boolean(false),
    aromaticScale: PD.Numeric(0.3, { min: 0, max: 1, step: 0.01 }),
    aromaticSpacing: PD.Numeric(1.5, { min: 0, max: 3, step: 0.01 }),
    aromaticDashCount: PD.Numeric(2, { min: 1, max: 6, step: 1 }),
    dashCount: PD.Numeric(4, { min: 0, max: 10, step: 1 }),
    dashScale: PD.Numeric(0.8, { min: 0, max: 2, step: 0.1 }),
    dashCap: PD.Boolean(true),
    stubCap: PD.Boolean(true),
    radialSegments: PD.Numeric(16, { min: 2, max: 56, step: 2 }, BaseGeometry.CustomQualityParamInfo),
};
export var DefaultLinkCylinderProps = PD.getDefaultValues(LinkCylinderParams);
export var LinkLineParams = {
    linkScale: PD.Numeric(0.5, { min: 0, max: 1, step: 0.1 }),
    linkSpacing: PD.Numeric(0.1, { min: 0, max: 2, step: 0.01 }),
    aromaticDashCount: PD.Numeric(2, { min: 1, max: 6, step: 1 }),
    dashCount: PD.Numeric(4, { min: 0, max: 10, step: 1 }),
};
export var DefaultLinkLineProps = PD.getDefaultValues(LinkLineParams);
var tmpV12 = Vec3();
var tmpShiftV12 = Vec3();
var tmpShiftV13 = Vec3();
var up = Vec3.create(0, 1, 0);
/** Calculate 'shift' direction that is perpendiculat to v1 - v2 and goes through v3 */
export function calculateShiftDir(out, v1, v2, v3) {
    Vec3.normalize(tmpShiftV12, Vec3.sub(tmpShiftV12, v1, v2));
    if (v3 !== null) {
        Vec3.sub(tmpShiftV13, v1, v3);
    }
    else {
        Vec3.copy(tmpShiftV13, v1); // no reference point, use v1
    }
    Vec3.normalize(tmpShiftV13, tmpShiftV13);
    // ensure v13 and v12 are not colinear
    var dp = Vec3.dot(tmpShiftV12, tmpShiftV13);
    if (1 - Math.abs(dp) < 1e-5) {
        Vec3.set(tmpShiftV13, 1, 0, 0);
        dp = Vec3.dot(tmpShiftV12, tmpShiftV13);
        if (1 - Math.abs(dp) < 1e-5) {
            Vec3.set(tmpShiftV13, 0, 1, 0);
            dp = Vec3.dot(tmpShiftV12, tmpShiftV13);
        }
    }
    Vec3.setMagnitude(tmpShiftV12, tmpShiftV12, dp);
    Vec3.sub(tmpShiftV13, tmpShiftV13, tmpShiftV12);
    return Vec3.normalize(out, tmpShiftV13);
}
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var v3scale = Vec3.scale;
var v3add = Vec3.add;
var v3sub = Vec3.sub;
var v3setMagnitude = Vec3.setMagnitude;
var v3dot = Vec3.dot;
/**
 * Each edge is included twice to allow for coloring/picking
 * the half closer to the first vertex, i.e. vertex a.
 */
export function createLinkCylinderMesh(ctx, linkBuilder, props, mesh) {
    var linkCount = linkBuilder.linkCount, referencePosition = linkBuilder.referencePosition, position = linkBuilder.position, style = linkBuilder.style, radius = linkBuilder.radius, ignore = linkBuilder.ignore, stub = linkBuilder.stub;
    if (!linkCount)
        return { mesh: Mesh.createEmpty(mesh) };
    var linkScale = props.linkScale, linkSpacing = props.linkSpacing, radialSegments = props.radialSegments, linkCap = props.linkCap, aromaticScale = props.aromaticScale, aromaticSpacing = props.aromaticSpacing, aromaticDashCount = props.aromaticDashCount, dashCount = props.dashCount, dashScale = props.dashScale, dashCap = props.dashCap, stubCap = props.stubCap;
    var vertexCountEstimate = radialSegments * 2 * linkCount * 2;
    var builderState = MeshBuilder.createState(vertexCountEstimate, vertexCountEstimate / 4, mesh);
    var va = Vec3();
    var vb = Vec3();
    var vShift = Vec3();
    var center = Vec3();
    var count = 0;
    var cylinderProps = {
        radiusTop: 1,
        radiusBottom: 1,
        radialSegments: radialSegments,
        topCap: linkCap,
        bottomCap: linkCap
    };
    for (var edgeIndex = 0, _eI = linkCount; edgeIndex < _eI; ++edgeIndex) {
        if (ignore && ignore(edgeIndex))
            continue;
        position(va, vb, edgeIndex);
        v3add(center, center, va);
        v3add(center, center, vb);
        count += 2;
        v3sub(tmpV12, vb, va);
        var dirFlag = v3dot(tmpV12, up) > 0;
        var linkRadius = radius(edgeIndex);
        var linkStyle = style ? style(edgeIndex) : 0 /* LinkStyle.Solid */;
        var linkStub = stubCap && (stub ? stub(edgeIndex) : false);
        var _a = dirFlag ? [linkStub, linkCap] : [linkCap, linkStub], topCap = _a[0], bottomCap = _a[1];
        builderState.currentGroup = edgeIndex;
        if (linkStyle === 0 /* LinkStyle.Solid */) {
            cylinderProps.radiusTop = cylinderProps.radiusBottom = linkRadius;
            cylinderProps.topCap = topCap;
            cylinderProps.bottomCap = bottomCap;
            addCylinder(builderState, va, vb, 0.5, cylinderProps);
        }
        else if (linkStyle === 1 /* LinkStyle.Dashed */) {
            cylinderProps.radiusTop = cylinderProps.radiusBottom = linkRadius * dashScale;
            cylinderProps.topCap = cylinderProps.bottomCap = dashCap;
            addFixedCountDashedCylinder(builderState, va, vb, 0.5, dashCount, linkStub, cylinderProps);
        }
        else if (linkStyle === 2 /* LinkStyle.Double */ || linkStyle === 3 /* LinkStyle.OffsetDouble */ || linkStyle === 4 /* LinkStyle.Triple */ || linkStyle === 5 /* LinkStyle.OffsetTriple */ || linkStyle === 7 /* LinkStyle.Aromatic */ || linkStyle === 8 /* LinkStyle.MirroredAromatic */) {
            var order = (linkStyle === 2 /* LinkStyle.Double */ || linkStyle === 3 /* LinkStyle.OffsetDouble */) ? 2 :
                (linkStyle === 4 /* LinkStyle.Triple */ || linkStyle === 5 /* LinkStyle.OffsetTriple */) ? 3 : 1.5;
            var multiRadius = linkRadius * (linkScale / (0.5 * order));
            var absOffset = (linkRadius - multiRadius) * linkSpacing;
            calculateShiftDir(vShift, va, vb, referencePosition ? referencePosition(edgeIndex) : null);
            cylinderProps.topCap = topCap;
            cylinderProps.bottomCap = bottomCap;
            if (linkStyle === 7 /* LinkStyle.Aromatic */ || linkStyle === 8 /* LinkStyle.MirroredAromatic */) {
                cylinderProps.radiusTop = cylinderProps.radiusBottom = linkRadius;
                addCylinder(builderState, va, vb, 0.5, cylinderProps);
                var aromaticOffset = linkRadius + aromaticScale * linkRadius + aromaticScale * linkRadius * aromaticSpacing;
                v3setMagnitude(tmpV12, v3sub(tmpV12, vb, va), linkRadius * 0.5);
                v3add(va, va, tmpV12);
                v3sub(vb, vb, tmpV12);
                cylinderProps.radiusTop = cylinderProps.radiusBottom = linkRadius * aromaticScale;
                cylinderProps.topCap = cylinderProps.bottomCap = dashCap;
                v3setMagnitude(vShift, vShift, aromaticOffset);
                v3sub(va, va, vShift);
                v3sub(vb, vb, vShift);
                addFixedCountDashedCylinder(builderState, va, vb, 0.5, aromaticDashCount, linkStub, cylinderProps);
                if (linkStyle === 8 /* LinkStyle.MirroredAromatic */) {
                    v3setMagnitude(vShift, vShift, aromaticOffset * 2);
                    v3add(va, va, vShift);
                    v3add(vb, vb, vShift);
                    addFixedCountDashedCylinder(builderState, va, vb, 0.5, aromaticDashCount, linkStub, cylinderProps);
                }
            }
            else if (linkStyle === 3 /* LinkStyle.OffsetDouble */ || linkStyle === 5 /* LinkStyle.OffsetTriple */) {
                var multipleOffset = linkRadius + multiRadius + linkScale * linkRadius * linkSpacing;
                v3setMagnitude(vShift, vShift, multipleOffset);
                cylinderProps.radiusTop = cylinderProps.radiusBottom = linkRadius;
                addCylinder(builderState, va, vb, 0.5, cylinderProps);
                v3scale(tmpV12, tmpV12, linkSpacing * linkScale * 0.2);
                v3add(va, va, tmpV12);
                v3sub(vb, vb, tmpV12);
                cylinderProps.radiusTop = cylinderProps.radiusBottom = multiRadius;
                cylinderProps.topCap = dirFlag ? linkStub : dashCap;
                cylinderProps.bottomCap = dirFlag ? dashCap : linkStub;
                v3setMagnitude(vShift, vShift, multipleOffset);
                v3sub(va, va, vShift);
                v3sub(vb, vb, vShift);
                addCylinder(builderState, va, vb, 0.5, cylinderProps);
                if (order === 3) {
                    v3setMagnitude(vShift, vShift, multipleOffset * 2);
                    v3add(va, va, vShift);
                    v3add(vb, vb, vShift);
                    addCylinder(builderState, va, vb, 0.5, cylinderProps);
                }
            }
            else {
                v3setMagnitude(vShift, vShift, absOffset);
                cylinderProps.radiusTop = cylinderProps.radiusBottom = multiRadius;
                if (order === 3)
                    addCylinder(builderState, va, vb, 0.5, cylinderProps);
                addDoubleCylinder(builderState, va, vb, 0.5, vShift, cylinderProps);
            }
        }
        else if (linkStyle === 6 /* LinkStyle.Disk */) {
            v3scale(tmpV12, tmpV12, 0.475);
            v3add(va, va, tmpV12);
            v3sub(vb, vb, tmpV12);
            cylinderProps.radiusTop = cylinderProps.radiusBottom = linkRadius;
            cylinderProps.topCap = topCap;
            cylinderProps.bottomCap = bottomCap;
            addCylinder(builderState, va, vb, 0.5, cylinderProps);
        }
    }
    var oldBoundingSphere = mesh ? Sphere3D.clone(mesh.boundingSphere) : undefined;
    var m = MeshBuilder.getMesh(builderState);
    if (count === 0)
        return { mesh: m };
    // re-use boundingSphere if it has not changed much
    Vec3.scale(center, center, 1 / count);
    if (oldBoundingSphere && Vec3.distance(center, oldBoundingSphere.center) / oldBoundingSphere.radius < 1.0) {
        return { mesh: m, boundingSphere: oldBoundingSphere };
    }
    else {
        return { mesh: m };
    }
}
/**
 * Each edge is included twice to allow for coloring/picking
 * the half closer to the first vertex, i.e. vertex a.
 */
export function createLinkCylinderImpostors(ctx, linkBuilder, props, cylinders) {
    var linkCount = linkBuilder.linkCount, referencePosition = linkBuilder.referencePosition, position = linkBuilder.position, style = linkBuilder.style, radius = linkBuilder.radius, ignore = linkBuilder.ignore, stub = linkBuilder.stub;
    if (!linkCount)
        return { cylinders: Cylinders.createEmpty(cylinders) };
    var linkScale = props.linkScale, linkSpacing = props.linkSpacing, linkCap = props.linkCap, aromaticScale = props.aromaticScale, aromaticSpacing = props.aromaticSpacing, aromaticDashCount = props.aromaticDashCount, dashCount = props.dashCount, dashScale = props.dashScale, dashCap = props.dashCap, stubCap = props.stubCap;
    var cylindersCountEstimate = linkCount * 2;
    var builder = CylindersBuilder.create(cylindersCountEstimate, cylindersCountEstimate / 4, cylinders);
    var va = Vec3();
    var vb = Vec3();
    var vm = Vec3();
    var vShift = Vec3();
    var center = Vec3();
    var count = 0;
    for (var edgeIndex = 0, _eI = linkCount; edgeIndex < _eI; ++edgeIndex) {
        if (ignore && ignore(edgeIndex))
            continue;
        position(va, vb, edgeIndex);
        v3add(center, center, va);
        v3add(center, center, vb);
        count += 2;
        var linkRadius = radius(edgeIndex);
        var linkStyle = style ? style(edgeIndex) : 0 /* LinkStyle.Solid */;
        var linkStub = stubCap && (stub ? stub(edgeIndex) : false);
        if (linkStyle === 0 /* LinkStyle.Solid */) {
            v3scale(vm, v3add(vm, va, vb), 0.5);
            builder.add(va[0], va[1], va[2], vm[0], vm[1], vm[2], 1, linkCap, linkStub, edgeIndex);
        }
        else if (linkStyle === 1 /* LinkStyle.Dashed */) {
            v3scale(vm, v3add(vm, va, vb), 0.5);
            builder.addFixedCountDashes(va, vm, dashCount, dashScale, dashCap, dashCap, linkStub, edgeIndex);
        }
        else if (linkStyle === 2 /* LinkStyle.Double */ || linkStyle === 3 /* LinkStyle.OffsetDouble */ || linkStyle === 4 /* LinkStyle.Triple */ || linkStyle === 5 /* LinkStyle.OffsetTriple */ || linkStyle === 7 /* LinkStyle.Aromatic */ || linkStyle === 8 /* LinkStyle.MirroredAromatic */) {
            var order = (linkStyle === 2 /* LinkStyle.Double */ || linkStyle === 3 /* LinkStyle.OffsetDouble */) ? 2 :
                (linkStyle === 4 /* LinkStyle.Triple */ || linkStyle === 5 /* LinkStyle.OffsetTriple */) ? 3 : 1.5;
            var multiScale = linkScale / (0.5 * order);
            var absOffset = (linkRadius - multiScale * linkRadius) * linkSpacing;
            v3scale(vm, v3add(vm, va, vb), 0.5);
            calculateShiftDir(vShift, va, vb, referencePosition ? referencePosition(edgeIndex) : null);
            if (linkStyle === 7 /* LinkStyle.Aromatic */ || linkStyle === 8 /* LinkStyle.MirroredAromatic */) {
                builder.add(va[0], va[1], va[2], vm[0], vm[1], vm[2], 1, linkCap, linkStub, edgeIndex);
                var aromaticOffset = linkRadius + aromaticScale * linkRadius + aromaticScale * linkRadius * aromaticSpacing;
                v3setMagnitude(tmpV12, v3sub(tmpV12, vb, va), linkRadius * 0.5);
                v3add(va, va, tmpV12);
                v3setMagnitude(vShift, vShift, aromaticOffset);
                v3sub(va, va, vShift);
                v3sub(vm, vm, vShift);
                builder.addFixedCountDashes(va, vm, aromaticDashCount, aromaticScale, dashCap, dashCap, linkStub, edgeIndex);
                if (linkStyle === 8 /* LinkStyle.MirroredAromatic */) {
                    v3setMagnitude(vShift, vShift, aromaticOffset * 2);
                    v3add(va, va, vShift);
                    v3add(vm, vm, vShift);
                    builder.addFixedCountDashes(va, vm, aromaticDashCount, aromaticScale, dashCap, dashCap, linkStub, edgeIndex);
                }
            }
            else if (linkStyle === 3 /* LinkStyle.OffsetDouble */ || linkStyle === 5 /* LinkStyle.OffsetTriple */) {
                var multipleOffset = linkRadius + multiScale * linkRadius + linkScale * linkRadius * linkSpacing;
                v3setMagnitude(vShift, vShift, multipleOffset);
                builder.add(va[0], va[1], va[2], vm[0], vm[1], vm[2], 1, linkCap, linkStub, edgeIndex);
                v3setMagnitude(tmpV12, v3sub(tmpV12, va, vm), linkRadius / 1.5);
                v3sub(va, va, tmpV12);
                if (order === 3)
                    builder.add(va[0] + vShift[0], va[1] + vShift[1], va[2] + vShift[2], vm[0] + vShift[0], vm[1] + vShift[1], vm[2] + vShift[2], multiScale, linkCap, linkStub, edgeIndex);
                builder.add(va[0] - vShift[0], va[1] - vShift[1], va[2] - vShift[2], vm[0] - vShift[0], vm[1] - vShift[1], vm[2] - vShift[2], multiScale, dashCap, linkStub, edgeIndex);
            }
            else {
                v3setMagnitude(vShift, vShift, absOffset);
                if (order === 3)
                    builder.add(va[0], va[1], va[2], vm[0], vm[1], vm[2], multiScale, linkCap, linkStub, edgeIndex);
                builder.add(va[0] + vShift[0], va[1] + vShift[1], va[2] + vShift[2], vm[0] + vShift[0], vm[1] + vShift[1], vm[2] + vShift[2], multiScale, linkCap, linkStub, edgeIndex);
                builder.add(va[0] - vShift[0], va[1] - vShift[1], va[2] - vShift[2], vm[0] - vShift[0], vm[1] - vShift[1], vm[2] - vShift[2], multiScale, linkCap, linkStub, edgeIndex);
            }
        }
        else if (linkStyle === 6 /* LinkStyle.Disk */) {
            v3scale(tmpV12, v3sub(tmpV12, vm, va), 0.475);
            v3add(va, va, tmpV12);
            v3sub(vm, vm, tmpV12);
            builder.add(va[0], va[1], va[2], vm[0], vm[1], vm[2], 1, linkCap, linkStub, edgeIndex);
        }
    }
    var oldBoundingSphere = cylinders ? Sphere3D.clone(cylinders.boundingSphere) : undefined;
    var c = builder.getCylinders();
    if (count === 0)
        return { cylinders: c };
    // re-use boundingSphere if it has not changed much
    Vec3.scale(center, center, 1 / count);
    if (oldBoundingSphere && Vec3.distance(center, oldBoundingSphere.center) / oldBoundingSphere.radius < 1.0) {
        return { cylinders: c, boundingSphere: oldBoundingSphere };
    }
    else {
        return { cylinders: c };
    }
}
/**
 * Each edge is included twice to allow for coloring/picking
 * the half closer to the first vertex, i.e. vertex a.
 */
export function createLinkLines(ctx, linkBuilder, props, lines) {
    var linkCount = linkBuilder.linkCount, referencePosition = linkBuilder.referencePosition, position = linkBuilder.position, style = linkBuilder.style, ignore = linkBuilder.ignore;
    if (!linkCount)
        return { lines: Lines.createEmpty(lines) };
    var linkScale = props.linkScale, linkSpacing = props.linkSpacing, aromaticDashCount = props.aromaticDashCount, dashCount = props.dashCount;
    var linesCountEstimate = linkCount * 2;
    var builder = LinesBuilder.create(linesCountEstimate, linesCountEstimate / 4, lines);
    var va = Vec3();
    var vb = Vec3();
    var vm = Vec3();
    var vShift = Vec3();
    var center = Vec3();
    var count = 0;
    var aromaticOffsetFactor = 4.5;
    var multipleOffsetFactor = 3;
    for (var edgeIndex = 0, _eI = linkCount; edgeIndex < _eI; ++edgeIndex) {
        if (ignore && ignore(edgeIndex))
            continue;
        position(va, vb, edgeIndex);
        v3add(center, center, va);
        v3add(center, center, vb);
        count += 2;
        var linkStyle = style ? style(edgeIndex) : 0 /* LinkStyle.Solid */;
        if (linkStyle === 0 /* LinkStyle.Solid */) {
            v3scale(vm, v3add(vm, va, vb), 0.5);
            builder.add(va[0], va[1], va[2], vm[0], vm[1], vm[2], edgeIndex);
        }
        else if (linkStyle === 1 /* LinkStyle.Dashed */) {
            v3scale(vm, v3add(vm, va, vb), 0.5);
            builder.addFixedCountDashes(va, vm, dashCount, edgeIndex);
        }
        else if (linkStyle === 2 /* LinkStyle.Double */ || linkStyle === 3 /* LinkStyle.OffsetDouble */ || linkStyle === 4 /* LinkStyle.Triple */ || linkStyle === 5 /* LinkStyle.OffsetTriple */ || linkStyle === 7 /* LinkStyle.Aromatic */ || linkStyle === 8 /* LinkStyle.MirroredAromatic */) {
            var order = linkStyle === 2 /* LinkStyle.Double */ || linkStyle === 3 /* LinkStyle.OffsetDouble */ ? 2 :
                linkStyle === 4 /* LinkStyle.Triple */ || linkStyle === 5 /* LinkStyle.OffsetTriple */ ? 3 : 1.5;
            var multiRadius = 1 * (linkScale / (0.5 * order));
            var absOffset = (1 - multiRadius) * linkSpacing;
            v3scale(vm, v3add(vm, va, vb), 0.5);
            calculateShiftDir(vShift, va, vb, referencePosition ? referencePosition(edgeIndex) : null);
            if (linkStyle === 7 /* LinkStyle.Aromatic */ || linkStyle === 8 /* LinkStyle.MirroredAromatic */) {
                builder.add(va[0], va[1], va[2], vm[0], vm[1], vm[2], edgeIndex);
                var aromaticOffset = absOffset * aromaticOffsetFactor;
                v3setMagnitude(tmpV12, v3sub(tmpV12, vb, va), aromaticOffset * 0.5);
                v3add(va, va, tmpV12);
                v3setMagnitude(vShift, vShift, aromaticOffset);
                v3sub(va, va, vShift);
                v3sub(vm, vm, vShift);
                builder.addFixedCountDashes(va, vm, aromaticDashCount, edgeIndex);
                if (linkStyle === 8 /* LinkStyle.MirroredAromatic */) {
                    v3setMagnitude(vShift, vShift, aromaticOffset * 2);
                    v3add(va, va, vShift);
                    v3add(vm, vm, vShift);
                    builder.addFixedCountDashes(va, vm, aromaticDashCount, edgeIndex);
                }
            }
            else if (linkStyle === 3 /* LinkStyle.OffsetDouble */ || linkStyle === 5 /* LinkStyle.OffsetTriple */) {
                v3setMagnitude(vShift, vShift, absOffset * multipleOffsetFactor);
                builder.add(va[0], va[1], va[2], vm[0], vm[1], vm[2], edgeIndex);
                v3scale(tmpV12, v3sub(tmpV12, va, vm), linkSpacing * linkScale);
                v3sub(va, va, tmpV12);
                if (order === 3)
                    builder.add(va[0] + vShift[0], va[1] + vShift[1], va[2] + vShift[2], vm[0] + vShift[0], vm[1] + vShift[1], vm[2] + vShift[2], edgeIndex);
                builder.add(va[0] - vShift[0], va[1] - vShift[1], va[2] - vShift[2], vm[0] - vShift[0], vm[1] - vShift[1], vm[2] - vShift[2], edgeIndex);
            }
            else {
                v3setMagnitude(vShift, vShift, absOffset * 1.5);
                if (order === 3)
                    builder.add(va[0], va[1], va[2], vm[0], vm[1], vm[2], edgeIndex);
                builder.add(va[0] + vShift[0], va[1] + vShift[1], va[2] + vShift[2], vm[0] + vShift[0], vm[1] + vShift[1], vm[2] + vShift[2], edgeIndex);
                builder.add(va[0] - vShift[0], va[1] - vShift[1], va[2] - vShift[2], vm[0] - vShift[0], vm[1] - vShift[1], vm[2] - vShift[2], edgeIndex);
            }
        }
        else if (linkStyle === 6 /* LinkStyle.Disk */) {
            v3scale(tmpV12, v3sub(tmpV12, vm, va), 0.475);
            v3add(va, va, tmpV12);
            v3sub(vm, vm, tmpV12);
            // TODO what to do here? Line as disk doesn't work well.
            builder.add(va[0], va[1], va[2], vm[0], vm[1], vm[2], edgeIndex);
        }
    }
    var oldBoundingSphere = lines ? Sphere3D.clone(lines.boundingSphere) : undefined;
    var l = builder.getLines();
    if (count === 0)
        return { lines: l };
    // re-use boundingSphere if it has not changed much
    Vec3.scale(center, center, 1 / count);
    if (oldBoundingSphere && Vec3.distance(center, oldBoundingSphere.center) / oldBoundingSphere.radius < 1.0) {
        return { lines: l, boundingSphere: oldBoundingSphere };
    }
    else {
        return { lines: l };
    }
}
