/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { Vec3 } from '../3d/vec3';
describe('vec3', function () {
    var vec1 = [1, 2, 3];
    var vec2 = [2, 3, 1];
    var orthVec1 = [0, 1, 0];
    var orthVec2 = [1, 0, 0];
    it('angle calculation', function () {
        expect(Vec3.angle(vec1, vec1) * 360 / (2 * Math.PI)).toBe(0.0);
        expect(Vec3.angle(orthVec1, orthVec2) * 360 / (2 * Math.PI)).toBe(90.0);
        expect(Vec3.angle(vec1, vec2)).toBeCloseTo(0.666946);
    });
});
