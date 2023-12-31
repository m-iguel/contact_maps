/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SortedRanges } from '../sorted-ranges';
import { OrderedSet } from '../ordered-set';
import { SortedArray } from '../sorted-array';
describe('rangesArray', function () {
    function test(name, a, b) {
        it(name, function () { return expect(a).toEqual(b); });
    }
    function testIterator(name, ranges, set, expectedValues) {
        it("iterator, ".concat(name), function () {
            var rangesIt = SortedRanges.transientSegments(ranges, set);
            var index = expectedValues.index, start = expectedValues.start, end = expectedValues.end;
            var i = 0;
            while (rangesIt.hasNext) {
                var segment = rangesIt.move();
                expect(segment.index).toBe(index[i]);
                expect(segment.start).toBe(start[i]);
                expect(segment.end).toBe(end[i]);
                ++i;
            }
            expect(i).toBe(index.length);
        });
    }
    var a1234 = SortedRanges.ofSortedRanges([1, 2, 3, 4]);
    var a1134 = SortedRanges.ofSortedRanges([1, 1, 3, 4]);
    test('size', SortedRanges.size(a1234), 4);
    test('size', SortedRanges.size(a1134), 3);
    test('min/max', [SortedRanges.min(a1234), SortedRanges.max(a1234)], [1, 4]);
    test('start/end', [SortedRanges.start(a1234), SortedRanges.end(a1234)], [1, 5]);
    testIterator('two ranges', SortedRanges.ofSortedRanges([1, 2, 3, 4]), OrderedSet.ofBounds(1, 5), { index: [0, 1], start: [0, 2], end: [2, 4] });
    testIterator('first range', SortedRanges.ofSortedRanges([1, 2, 3, 4]), SortedArray.ofSortedArray([2]), { index: [0], start: [0], end: [1] });
    testIterator('second range', SortedRanges.ofSortedRanges([1, 2, 3, 4]), SortedArray.ofSortedArray([4]), { index: [1], start: [0], end: [1] });
    testIterator('set not in ranges', SortedRanges.ofSortedRanges([1, 2, 3, 4]), SortedArray.ofSortedArray([10]), { index: [], start: [], end: [] });
    testIterator('set in second range and beyond', SortedRanges.ofSortedRanges([1, 2, 3, 4]), SortedArray.ofSortedArray([3, 10]), { index: [1], start: [0], end: [1] });
    testIterator('length 1 range', SortedRanges.ofSortedRanges([1, 1, 3, 4]), SortedArray.ofSortedArray([0, 1, 10]), { index: [0], start: [1], end: [2] });
});
