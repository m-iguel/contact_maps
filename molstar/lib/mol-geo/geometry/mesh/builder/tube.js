/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Vec3 } from '../../../../mol-math/linear-algebra';
import { cantorPairing, ChunkedArray } from '../../../../mol-data/util';
var normalVector = Vec3();
var surfacePoint = Vec3();
var controlPoint = Vec3();
var u = Vec3();
var v = Vec3();
function add2AndScale2(out, a, b, sa, sb) {
    out[0] = (a[0] * sa) + (b[0] * sb);
    out[1] = (a[1] * sa) + (b[1] * sb);
    out[2] = (a[2] * sa) + (b[2] * sb);
}
function add3AndScale2(out, a, b, c, sa, sb) {
    out[0] = (a[0] * sa) + (b[0] * sb) + c[0];
    out[1] = (a[1] * sa) + (b[1] * sb) + c[1];
    out[2] = (a[2] * sa) + (b[2] * sb) + c[2];
}
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var v3fromArray = Vec3.fromArray;
var v3normalize = Vec3.normalize;
var v3scaleAndAdd = Vec3.scaleAndAdd;
var v3cross = Vec3.cross;
var v3dot = Vec3.dot;
var v3unitX = Vec3.unitX;
var caAdd3 = ChunkedArray.add3;
var CosSinCache = new Map();
function getCosSin(radialSegments, shift) {
    var offset = shift ? 1 : 0;
    var hash = cantorPairing(radialSegments, offset);
    if (!CosSinCache.has(hash)) {
        var cos = [];
        var sin = [];
        for (var j = 0; j < radialSegments; ++j) {
            var t = (j * 2 + offset) / radialSegments * Math.PI;
            cos[j] = Math.cos(t);
            sin[j] = Math.sin(t);
        }
        CosSinCache.set(hash, { cos: cos, sin: sin });
    }
    return CosSinCache.get(hash);
}
export function addTube(state, controlPoints, normalVectors, binormalVectors, linearSegments, radialSegments, widthValues, heightValues, startCap, endCap, crossSection) {
    var currentGroup = state.currentGroup, vertices = state.vertices, normals = state.normals, indices = state.indices, groups = state.groups;
    var vertexCount = vertices.elementCount;
    var _a = getCosSin(radialSegments, crossSection === 'rounded'), cos = _a.cos, sin = _a.sin;
    var q1 = Math.round(radialSegments / 4);
    var q3 = q1 * 3;
    for (var i = 0; i <= linearSegments; ++i) {
        var i3 = i * 3;
        v3fromArray(u, normalVectors, i3);
        v3fromArray(v, binormalVectors, i3);
        v3fromArray(controlPoint, controlPoints, i3);
        var width = widthValues[i];
        var height = heightValues[i];
        var rounded = crossSection === 'rounded' && height > width;
        for (var j = 0; j < radialSegments; ++j) {
            if (rounded) {
                add3AndScale2(surfacePoint, u, v, controlPoint, width * cos[j], width * sin[j]);
                var h = v3dot(v, v3unitX) < 0
                    ? (j < q1 || j >= q3) ? height - width : -height + width
                    : (j >= q1 && j < q3) ? -height + width : height - width;
                v3scaleAndAdd(surfacePoint, surfacePoint, u, h);
                if (j === q1 || j === q1 - 1) {
                    add2AndScale2(normalVector, u, v, 0, 1);
                }
                else if (j === q3 || j === q3 - 1) {
                    add2AndScale2(normalVector, u, v, 0, -1);
                }
                else {
                    add2AndScale2(normalVector, u, v, cos[j], sin[j]);
                }
            }
            else {
                add3AndScale2(surfacePoint, u, v, controlPoint, height * cos[j], width * sin[j]);
                add2AndScale2(normalVector, u, v, width * cos[j], height * sin[j]);
            }
            v3normalize(normalVector, normalVector);
            caAdd3(vertices, surfacePoint[0], surfacePoint[1], surfacePoint[2]);
            caAdd3(normals, normalVector[0], normalVector[1], normalVector[2]);
        }
    }
    var radialSegmentsHalf = Math.round(radialSegments / 2);
    for (var i = 0; i < linearSegments; ++i) {
        // the triangles are arranged such that opposing triangles of the sheet align
        // which prevents triangle intersection within tight curves
        for (var j = 0; j < radialSegmentsHalf; ++j) {
            caAdd3(indices, vertexCount + i * radialSegments + (j + 1) % radialSegments, // a
            vertexCount + (i + 1) * radialSegments + (j + 1) % radialSegments, // c
            vertexCount + i * radialSegments + j // b
            );
            caAdd3(indices, vertexCount + (i + 1) * radialSegments + (j + 1) % radialSegments, // c
            vertexCount + (i + 1) * radialSegments + j, // d
            vertexCount + i * radialSegments + j // b
            );
        }
        for (var j = radialSegmentsHalf; j < radialSegments; ++j) {
            caAdd3(indices, vertexCount + i * radialSegments + (j + 1) % radialSegments, // a
            vertexCount + (i + 1) * radialSegments + j, // d
            vertexCount + i * radialSegments + j // b
            );
            caAdd3(indices, vertexCount + (i + 1) * radialSegments + (j + 1) % radialSegments, // c
            vertexCount + (i + 1) * radialSegments + j, // d
            vertexCount + i * radialSegments + (j + 1) % radialSegments);
        }
    }
    if (startCap) {
        var offset = 0;
        var centerVertex = vertices.elementCount;
        v3fromArray(u, normalVectors, offset);
        v3fromArray(v, binormalVectors, offset);
        v3fromArray(controlPoint, controlPoints, offset);
        v3cross(normalVector, v, u);
        caAdd3(vertices, controlPoint[0], controlPoint[1], controlPoint[2]);
        caAdd3(normals, normalVector[0], normalVector[1], normalVector[2]);
        var width = widthValues[0];
        var height = heightValues[0];
        var rounded = crossSection === 'rounded' && height > width;
        if (rounded)
            height -= width;
        vertexCount = vertices.elementCount;
        for (var i = 0; i < radialSegments; ++i) {
            if (rounded) {
                add3AndScale2(surfacePoint, u, v, controlPoint, width * cos[i], width * sin[i]);
                v3scaleAndAdd(surfacePoint, surfacePoint, u, (i < q1 || i >= q3) ? height : -height);
            }
            else {
                add3AndScale2(surfacePoint, u, v, controlPoint, height * cos[i], width * sin[i]);
            }
            caAdd3(vertices, surfacePoint[0], surfacePoint[1], surfacePoint[2]);
            caAdd3(normals, normalVector[0], normalVector[1], normalVector[2]);
            caAdd3(indices, vertexCount + (i + 1) % radialSegments, vertexCount + i, centerVertex);
        }
    }
    if (endCap) {
        var offset = linearSegments * 3;
        var centerVertex = vertices.elementCount;
        v3fromArray(u, normalVectors, offset);
        v3fromArray(v, binormalVectors, offset);
        v3fromArray(controlPoint, controlPoints, offset);
        v3cross(normalVector, u, v);
        caAdd3(vertices, controlPoint[0], controlPoint[1], controlPoint[2]);
        caAdd3(normals, normalVector[0], normalVector[1], normalVector[2]);
        var width = widthValues[linearSegments];
        var height = heightValues[linearSegments];
        var rounded = crossSection === 'rounded' && height > width;
        if (rounded)
            height -= width;
        vertexCount = vertices.elementCount;
        for (var i = 0; i < radialSegments; ++i) {
            if (rounded) {
                add3AndScale2(surfacePoint, u, v, controlPoint, width * cos[i], width * sin[i]);
                v3scaleAndAdd(surfacePoint, surfacePoint, u, (i < q1 || i >= q3) ? height : -height);
            }
            else {
                add3AndScale2(surfacePoint, u, v, controlPoint, height * cos[i], width * sin[i]);
            }
            caAdd3(vertices, surfacePoint[0], surfacePoint[1], surfacePoint[2]);
            caAdd3(normals, normalVector[0], normalVector[1], normalVector[2]);
            caAdd3(indices, vertexCount + i, vertexCount + (i + 1) % radialSegments, centerVertex);
        }
    }
    var addedVertexCount = (linearSegments + 1) * radialSegments + (startCap ? radialSegments + 1 : 0) + (endCap ? radialSegments + 1 : 0);
    ChunkedArray.addRepeat(groups, addedVertexCount, currentGroup);
}
