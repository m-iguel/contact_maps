/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { GridLookup3D } from '../../geometry';
import { sortArray } from '../../../mol-data/util';
import { OrderedSet } from '../../../mol-data/int';
import { getBoundary } from '../boundary';
var xs = [0, 0, 1];
var ys = [0, 1, 0];
var zs = [0, 0, 0];
var rs = [0, 0.5, 1 / 3];
describe('GridLookup3d', function () {
    it('basic', function () {
        var position = { x: xs, y: ys, z: zs, indices: OrderedSet.ofBounds(0, 3) };
        var boundary = getBoundary(position);
        var grid = GridLookup3D(position, boundary);
        var r = grid.find(0, 0, 0, 0);
        expect(r.count).toBe(1);
        expect(r.indices[0]).toBe(0);
        r = grid.nearest(0, 0, 0, 1);
        expect(r.count).toBe(1);
        expect(r.indices[0]).toBe(0);
        r = grid.find(0, 0, 0, 1);
        expect(r.count).toBe(3);
        expect(sortArray(r.indices)).toEqual([0, 1, 2]);
        r = grid.nearest(0, 0, 0, 3);
        expect(r.count).toBe(3);
        expect(sortArray(r.indices)).toEqual([0, 1, 2]);
    });
    it('radius', function () {
        var position = { x: xs, y: ys, z: zs, radius: [0, 0.5, 1 / 3], indices: OrderedSet.ofBounds(0, 3) };
        var boundary = getBoundary(position);
        var grid = GridLookup3D(position, boundary);
        var r = grid.find(0, 0, 0, 0);
        expect(r.count).toBe(1);
        expect(r.indices[0]).toBe(0);
        r = grid.nearest(0, 0, 0, 1);
        expect(r.count).toBe(1);
        expect(r.indices[0]).toBe(0);
        r = grid.find(0, 0, 0, 0.5);
        expect(r.count).toBe(2);
        expect(sortArray(r.indices)).toEqual([0, 1]);
        r = grid.nearest(0, 0, 0, 3);
        expect(r.count).toBe(3);
        expect(sortArray(r.indices)).toEqual([0, 1, 2]);
    });
    it('indexed', function () {
        var position = { x: xs, y: ys, z: zs, indices: OrderedSet.ofSingleton(1), radius: rs };
        var boundary = getBoundary(position);
        var grid = GridLookup3D(position, boundary);
        var r = grid.find(0, 0, 0, 0);
        expect(r.count).toBe(0);
        r = grid.nearest(0, 0, 0, 1);
        expect(r.count).toBe(1);
        r = grid.find(0, 0, 0, 0.5);
        expect(r.count).toBe(1);
        expect(sortArray(r.indices)).toEqual([0]);
        r = grid.nearest(0, 0, 0, 3);
        expect(r.count).toBe(1);
        expect(sortArray(r.indices)).toEqual([0]);
    });
});
