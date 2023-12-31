/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
// adapted from three.js, MIT License Copyright 2010-2018 three.js authors
import { Vec3 } from '../../mol-math/linear-algebra';
import { computeIndexedVertexNormals, appplyRadius } from '../util';
export var DefaultPolyhedronProps = {
    radius: 1,
    detail: 0
};
export function Polyhedron(_vertices, _indices, props) {
    var _a = __assign(__assign({}, DefaultPolyhedronProps), props), radius = _a.radius, detail = _a.detail;
    var builder = createBuilder();
    var vertices = builder.vertices, indices = builder.indices;
    // the subdivision creates the vertex buffer data
    subdivide(detail);
    // all vertices should lie on a conceptual sphere with a given radius
    appplyRadius(vertices, radius);
    var normals = new Float32Array(vertices.length);
    computeIndexedVertexNormals(vertices, indices, normals, vertices.length / 3, indices.length / 3);
    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint32Array(indices)
    };
    // helper functions
    function subdivide(detail) {
        var a = Vec3();
        var b = Vec3();
        var c = Vec3();
        // iterate over all faces and apply a subdivison with the given detail value
        for (var i = 0; i < _indices.length; i += 3) {
            // get the vertices of the face
            Vec3.fromArray(a, _vertices, _indices[i + 0] * 3);
            Vec3.fromArray(b, _vertices, _indices[i + 1] * 3);
            Vec3.fromArray(c, _vertices, _indices[i + 2] * 3);
            // perform subdivision
            subdivideFace(a, b, c, detail);
        }
    }
    function subdivideFace(a, b, c, detail) {
        var cols = Math.pow(2, detail);
        // we use this multidimensional array as a data structure for creating the subdivision
        var v = [];
        // construct all of the vertices for this subdivision
        for (var i = 0; i <= cols; ++i) {
            v[i] = [];
            var aj = Vec3();
            Vec3.lerp(aj, a, c, i / cols);
            var bj = Vec3();
            Vec3.lerp(bj, b, c, i / cols);
            var rows = cols - i;
            for (var j = 0; j <= rows; ++j) {
                if (j === 0 && i === cols) {
                    v[i][j] = aj;
                }
                else {
                    var abj = Vec3();
                    Vec3.lerp(abj, aj, bj, j / rows);
                    v[i][j] = abj;
                }
            }
        }
        // construct all of the faces
        for (var i = 0; i < cols; ++i) {
            for (var j = 0; j < 2 * (cols - i) - 1; ++j) {
                var k = Math.floor(j / 2);
                if (j % 2 === 0) {
                    builder.add(v[i][k + 1], v[i + 1][k], v[i][k]);
                }
                else {
                    builder.add(v[i][k + 1], v[i + 1][k + 1], v[i + 1][k]);
                }
            }
        }
    }
}
function createBuilder() {
    var vertices = [];
    var indices = [];
    var vertexMap = new Map();
    function addVertex(v) {
        var key = "".concat(v[0].toFixed(5), "|").concat(v[1].toFixed(5), "|").concat(v[2].toFixed(5));
        var idx = vertexMap.get(key);
        if (idx === undefined) {
            idx = vertices.length / 3;
            vertexMap.set(key, idx);
            vertices.push.apply(vertices, v);
        }
        return idx;
    }
    return {
        vertices: vertices,
        indices: indices,
        add: function (v1, v2, v3) {
            indices.push(addVertex(v1), addVertex(v2), addVertex(v3));
        }
    };
}
