/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec2 } from '../../linear-algebra';
import { pointInPolygon } from '../polygon';
describe('pointInPolygon', function () {
    it('basic', function () {
        var polygon = [
            -1, -1,
            1, -1,
            1, 1,
            -1, 1
        ];
        expect(pointInPolygon(Vec2.create(0, 0), polygon, 4)).toBe(true);
        expect(pointInPolygon(Vec2.create(2, 2), polygon, 4)).toBe(false);
    });
});
