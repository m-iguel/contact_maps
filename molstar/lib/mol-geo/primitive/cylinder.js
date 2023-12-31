/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
// adapted from three.js, MIT License Copyright 2010-2018 three.js authors
import { Vec3 } from '../../mol-math/linear-algebra';
export var DefaultCylinderProps = {
    radiusTop: 1,
    radiusBottom: 1,
    height: 1,
    radialSegments: 8,
    heightSegments: 1,
    topCap: false,
    bottomCap: false,
    thetaStart: 0.0,
    thetaLength: Math.PI * 2
};
export function Cylinder(props) {
    var _a = __assign(__assign({}, DefaultCylinderProps), props), radiusTop = _a.radiusTop, radiusBottom = _a.radiusBottom, height = _a.height, radialSegments = _a.radialSegments, heightSegments = _a.heightSegments, topCap = _a.topCap, bottomCap = _a.bottomCap, thetaStart = _a.thetaStart, thetaLength = _a.thetaLength;
    // buffers
    var indices = [];
    var vertices = [];
    var normals = [];
    // helper variables
    var index = 0;
    var indexArray = [];
    var halfHeight = height / 2;
    // generate geometry
    generateTorso();
    if (topCap && radiusTop > 0)
        generateCap(true);
    if (bottomCap && radiusBottom > 0)
        generateCap(false);
    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint32Array(indices)
    };
    function generateTorso() {
        var normal = Vec3.zero();
        // this will be used to calculate the normal
        var slope = (radiusBottom - radiusTop) / height;
        // generate vertices, normals and uvs
        for (var y = 0; y <= heightSegments; ++y) {
            var indexRow = [];
            var v = y / heightSegments;
            // calculate the radius of the current row
            var radius = v * (radiusBottom - radiusTop) + radiusTop;
            for (var x = 0; x <= radialSegments; ++x) {
                var u = x / radialSegments;
                var theta = u * thetaLength + thetaStart;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);
                // vertex
                vertices.push(radius * sinTheta, -v * height + halfHeight, radius * cosTheta);
                // normal
                Vec3.normalize(normal, Vec3.set(normal, sinTheta, slope, cosTheta));
                normals.push.apply(normals, normal);
                // save index of vertex in respective row
                indexRow.push(index++);
            }
            // now save vertices of the row in our index array
            indexArray.push(indexRow);
        }
        // generate indices
        for (var x = 0; x < radialSegments; ++x) {
            for (var y = 0; y < heightSegments; ++y) {
                // we use the index array to access the correct indices
                var a = indexArray[y][x];
                var b = indexArray[y + 1][x];
                var c = indexArray[y + 1][x + 1];
                var d = indexArray[y][x + 1];
                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
    }
    function generateCap(top) {
        var radius = (top === true) ? radiusTop : radiusBottom;
        var sign = (top === true) ? 1 : -1;
        // save the index of the first center vertex
        var centerIndexStart = index;
        // first we generate the center vertex data of the cap.
        // because the geometry needs one set of uvs per face,
        // we must generate a center vertex per face/segment
        for (var x = 1; x <= radialSegments; ++x) {
            // vertex
            vertices.push(0, halfHeight * sign, 0);
            // normal
            normals.push(0, sign, 0);
            // increase index
            ++index;
        }
        // save the index of the last center vertex
        var centerIndexEnd = index;
        // now we generate the surrounding vertices, normals and uvs
        for (var x = 0; x <= radialSegments; ++x) {
            var u = x / radialSegments;
            var theta = u * thetaLength + thetaStart;
            var cosTheta = Math.cos(theta);
            var sinTheta = Math.sin(theta);
            // vertex
            vertices.push(radius * sinTheta, halfHeight * sign, radius * cosTheta);
            // normal
            normals.push(0, sign, 0);
            // increase index
            ++index;
        }
        // generate indices
        for (var x = 0; x < radialSegments; ++x) {
            var c = centerIndexStart + x;
            var i = centerIndexEnd + x;
            if (top === true) {
                indices.push(i, i + 1, c); // face top
            }
            else {
                indices.push(i + 1, i, c); // face bottom
            }
        }
    }
}
