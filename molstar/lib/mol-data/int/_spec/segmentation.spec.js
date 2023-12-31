/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { OrderedSet } from '../ordered-set';
import { Interval } from '../interval';
import { Segmentation } from '../segmentation';
describe('segments', function () {
    var data = OrderedSet.ofSortedArray([4, 9, 10, 11, 14, 15, 16]);
    var segs = Segmentation.create([0, 4, 10, 12, 13, 15, 25]);
    it('size', function () { return expect(Segmentation.count(segs)).toBe(6); });
    it('project', function () {
        var p = Segmentation.projectValue(segs, data, 4);
        expect(p).toBe(Interval.ofBounds(0, 2));
    });
    it('ofOffsetts', function () {
        var p = Segmentation.ofOffsets([10, 12], Interval.ofBounds(10, 14));
        expect(p.offsets).toEqual(new Int32Array([0, 2, 4]));
    });
    it('map', function () {
        var segs = Segmentation.create([0, 1, 2]);
        expect(segs.index).toEqual(new Int32Array([0, 1]));
        expect(Segmentation.getSegment(segs, 0)).toBe(0);
        expect(Segmentation.getSegment(segs, 1)).toBe(1);
    });
    it('iteration', function () {
        var it = Segmentation.transientSegments(segs, data);
        var t = Object.create(null);
        var count = 0;
        while (it.hasNext) {
            count++;
            var s = it.move();
            for (var j = s.start; j < s.end; j++) {
                var x = t[s.index];
                var v = OrderedSet.getAt(data, j);
                if (!x)
                    t[s.index] = [v];
                else
                    x[x.length] = v;
            }
        }
        expect(t).toEqual({ 1: [4, 9], 2: [10, 11], 4: [14], 5: [15, 16] });
        expect(count).toBe(4);
    });
    it('units', function () {
        var data = OrderedSet.ofBounds(0, 4);
        var segs = Segmentation.create([0, 1, 2, 3, 4]);
        var it = Segmentation.transientSegments(segs, data, { index: 0, start: 2, end: 4 });
        var t = Object.create(null);
        var count = 0;
        while (it.hasNext) {
            count++;
            var s = it.move();
            for (var j = s.start; j < s.end; j++) {
                var x = t[s.index];
                var v = OrderedSet.getAt(data, j);
                if (!x)
                    t[s.index] = [v];
                else
                    x[x.length] = v;
            }
        }
        expect(t).toEqual({ 2: [2], 3: [3] });
        expect(count).toBe(2);
    });
    it('iteration range', function () {
        var segs = Segmentation.create([0, 2, 4]);
        var dataRange = OrderedSet.ofBounds(0, 4);
        var it = Segmentation.transientSegments(segs, dataRange);
        var t = Object.create(null);
        var count = 0;
        while (it.hasNext) {
            count++;
            var s = it.move();
            for (var j = s.start; j < s.end; j++) {
                var x = t[s.index];
                var v = OrderedSet.getAt(dataRange, j);
                if (!x)
                    t[s.index] = [v];
                else
                    x[x.length] = v;
            }
        }
        expect(count).toBe(2);
        expect(t).toEqual({ 0: [0, 1], 1: [2, 3] });
    });
    it('iteration range 1', function () {
        var segs = Segmentation.create([0, 2, 4]);
        var dataRange = OrderedSet.ofBounds(0, 4);
        var it = Segmentation.transientSegments(segs, dataRange, { index: 0, start: 2, end: 4 });
        var t = Object.create(null);
        var count = 0;
        while (it.hasNext) {
            count++;
            var s = it.move();
            for (var j = s.start; j < s.end; j++) {
                var x = t[s.index];
                var v = OrderedSet.getAt(dataRange, j);
                if (!x)
                    t[s.index] = [v];
                else
                    x[x.length] = v;
            }
        }
        expect(count).toBe(1);
        expect(t).toEqual({ 1: [2, 3] });
    });
});
