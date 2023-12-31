/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __spreadArray } from "tslib";
import * as Sort from '../util/sort';
function shuffle(data, len, clone, swap) {
    if (swap === void 0) { swap = Sort.arraySwap; }
    var a = clone(data);
    for (var i = len - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        swap(a, i, j);
    }
    return a;
}
function shuffleArray(data) {
    return shuffle(data, data.length, function (t) { return __spreadArray([], t, true); });
}
describe('qsort-array asc', function () {
    var data0 = new Array(50);
    for (var i = 0; i < data0.length; i++)
        data0[i] = i;
    var data1 = [1, 1, 2, 2, 3, 3, 4, 4, 4, 6, 6, 6];
    function test(name, data, randomize) {
        it(name, function () {
            // [ 3, 1, 6, 4, 4, 6, 4, 2, 6, 1, 2, 3 ];
            if (randomize) {
                for (var i = 0; i < 10; i++) {
                    expect(Sort.sortArray(shuffleArray(data))).toEqual(data);
                }
            }
            else {
                expect(Sort.sortArray(__spreadArray([], data, true))).toEqual(data);
            }
        });
    }
    test('uniq', data0, false);
    test('uniq shuffle', data0, true);
    test('rep', data1, false);
    test('rep shuffle', data1, true);
});
describe('qsort-array generic', function () {
    var data0 = new Array(50);
    for (var i = 0; i < data0.length; i++)
        data0[i] = i;
    var data1 = [1, 1, 2, 2, 3, 3, 4, 4, 4, 6, 6, 6];
    function test(name, data, randomize) {
        it(name, function () {
            // [ 3, 1, 6, 4, 4, 6, 4, 2, 6, 1, 2, 3 ];
            if (randomize) {
                for (var i = 0; i < 10; i++) {
                    expect(Sort.sort(shuffleArray(data), 0, data.length, Sort.arrayLess, Sort.arraySwap)).toEqual(data);
                }
            }
            else {
                expect(Sort.sort(__spreadArray([], data, true), 0, data.length, Sort.arrayLess, Sort.arraySwap)).toEqual(data);
            }
        });
    }
    test('uniq', data0, false);
    test('uniq shuffle', data0, true);
    test('rep', data1, false);
    test('rep shuffle', data1, true);
});
describe('qsort-dual array', function () {
    var len = 3;
    var data = { xs: [0, 1, 2], ys: ['x', 'y', 'z'] };
    var cmp = function (data, i, j) { return data.xs[i] - data.xs[j]; };
    var swap = function (data, i, j) { Sort.arraySwap(data.xs, i, j); Sort.arraySwap(data.ys, i, j); };
    var clone = function (d) { return ({ xs: __spreadArray([], d.xs, true), ys: __spreadArray([], d.ys, true) }); };
    function test(name, src, randomize) {
        it(name, function () {
            // [ 3, 1, 6, 4, 4, 6, 4, 2, 6, 1, 2, 3 ];
            if (randomize) {
                for (var i = 0; i < 10; i++) {
                    expect(Sort.sort(shuffle(src, len, clone, swap), 0, len, cmp, swap)).toEqual(data);
                }
            }
            else {
                expect(Sort.sort(clone(src), 0, len, cmp, swap)).toEqual(data);
            }
        });
    }
    test('sorted', data, false);
    test('shuffled', data, true);
});
