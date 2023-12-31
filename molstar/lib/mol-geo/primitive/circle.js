/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign } from "tslib";
export var DefaultCircleProps = {
    radius: 1,
    segments: 36,
    thetaStart: 0,
    thetaLength: Math.PI * 2
};
export function Circle(props) {
    var _a = __assign(__assign({}, DefaultCircleProps), props), radius = _a.radius, segments = _a.segments, thetaStart = _a.thetaStart, thetaLength = _a.thetaLength;
    var isFull = thetaLength === Math.PI * 2;
    var count = isFull ? segments + 1 : segments + 2;
    var vertices = new Float32Array(count * 3);
    var normals = new Float32Array(count * 3);
    var indices = new Uint32Array(segments * 3);
    // center
    vertices[0] = 0;
    vertices[1] = 0;
    vertices[2] = 0;
    normals[0] = 0;
    normals[1] = 1;
    normals[2] = 0;
    // vertices & normals
    for (var s = 0, i = 3; s < segments; ++s, i += 3) {
        var segment = thetaStart + s / segments * thetaLength;
        vertices[i] = radius * Math.sin(segment);
        vertices[i + 1] = 0;
        vertices[i + 2] = radius * Math.cos(segment);
        normals[i] = 0;
        normals[i + 1] = 1;
        normals[i + 2] = 0;
    }
    // indices
    for (var s = 1, i = 0; s < segments; ++s, i += 3) {
        indices[i] = s;
        indices[i + 1] = s + 1;
        indices[i + 2] = 0;
    }
    if (isFull) {
        var j = (segments - 1) * 3;
        indices[j] = segments;
        indices[j + 1] = 1;
        indices[j + 2] = 0;
    }
    else {
        var segment = thetaStart + thetaLength;
        var i = (segments + 1) * 3;
        vertices[i] = radius * Math.sin(segment);
        vertices[i + 1] = 0;
        vertices[i + 2] = radius * Math.cos(segment);
        normals[i] = 0;
        normals[i + 1] = 1;
        normals[i + 2] = 0;
        var j = (segments - 1) * 3;
        indices[j] = segments;
        indices[j + 1] = segments + 1;
        indices[j + 2] = 0;
    }
    return { vertices: vertices, normals: normals, indices: indices };
}
