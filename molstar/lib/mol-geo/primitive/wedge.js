/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../mol-math/linear-algebra';
import { PrimitiveBuilder } from './primitive';
import { polygon } from './polygon';
import { PrismCage } from './prism';
var a = Vec3.zero(), b = Vec3.zero(), c = Vec3.zero(), d = Vec3.zero();
var points = polygon(3, false);
/**
 * Create a prism with a triangular base
 */
export function createWedge() {
    var builder = PrimitiveBuilder(8);
    // create sides
    for (var i = 0; i < 3; ++i) {
        var ni = (i + 1) % 3;
        Vec3.set(a, points[i * 3], points[i * 3 + 1], -0.5);
        Vec3.set(b, points[ni * 3], points[ni * 3 + 1], -0.5);
        Vec3.set(c, points[ni * 3], points[ni * 3 + 1], 0.5);
        Vec3.set(d, points[i * 3], points[i * 3 + 1], 0.5);
        builder.add(a, b, c);
        builder.add(c, d, a);
    }
    // create bases
    Vec3.set(a, points[0], points[1], -0.5);
    Vec3.set(b, points[3], points[4], -0.5);
    Vec3.set(c, points[6], points[7], -0.5);
    builder.add(c, b, a);
    Vec3.set(a, points[0], points[1], 0.5);
    Vec3.set(b, points[3], points[4], 0.5);
    Vec3.set(c, points[6], points[7], 0.5);
    builder.add(a, b, c);
    return builder.getPrimitive();
}
var wedge;
export function Wedge() {
    if (!wedge)
        wedge = createWedge();
    return wedge;
}
var wedgeCage;
export function WedgeCage() {
    if (!wedgeCage)
        wedgeCage = PrismCage(points);
    return wedgeCage;
}
