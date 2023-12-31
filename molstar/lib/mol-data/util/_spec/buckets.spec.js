/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { createRangeArray } from '../array';
import { makeBuckets } from '../buckets';
describe('buckets', function () {
    function reorder(order, data) {
        var ret = [];
        for (var _i = 0, _a = order; _i < _a.length; _i++) {
            var i = _a[_i];
            ret[ret.length] = data[i];
        }
        return ret;
    }
    it('full range', function () {
        var xs = [1, 1, 2, 2, 3, 1];
        var range = createRangeArray(0, xs.length - 1);
        var bs = makeBuckets(range, function (i) { return xs[i]; });
        expect(reorder(range, xs)).toEqual([1, 1, 1, 2, 2, 3]);
        expect(Array.from(bs)).toEqual([0, 3, 5, 6]);
    });
    it('sort', function () {
        var xs = [3, 1, 2, 1, 2, 3];
        var range = createRangeArray(0, xs.length - 1);
        makeBuckets(range, function (i) { return xs[i]; }, { sort: true });
        expect(reorder(range, xs)).toEqual([1, 1, 2, 2, 3, 3]);
    });
    it('subrange', function () {
        var xs = [2, 1, 2, 1, 2, 3, 1];
        var range = createRangeArray(0, xs.length - 1);
        var bs = makeBuckets(range, function (i) { return xs[i]; }, { sort: false, start: 1, end: 5 });
        expect(reorder(range, xs)).toEqual([2, 1, 1, 2, 2, 3, 1]);
        expect(Array.from(bs)).toEqual([1, 3, 5]);
    });
});
