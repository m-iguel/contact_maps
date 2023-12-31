/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/**
 * Create 3d points for a polygon:
 * 3 for a triangle, 4 for a rectangle, 5 for a pentagon, 6 for a hexagon...
 */
export function polygon(sideCount, shift, radius) {
    if (radius === void 0) { radius = -1; }
    var points = new Float32Array(sideCount * 3);
    var r = radius === -1
        ? (sideCount <= 4 ? Math.sqrt(2) / 2 : 0.6)
        : radius;
    var offset = shift ? 1 : 0;
    for (var i = 0, il = sideCount; i < il; ++i) {
        var c = (i * 2 + offset) / sideCount * Math.PI;
        points[i * 3] = Math.cos(c) * r;
        points[i * 3 + 1] = Math.sin(c) * r;
        points[i * 3 + 2] = 0;
    }
    return points;
}
