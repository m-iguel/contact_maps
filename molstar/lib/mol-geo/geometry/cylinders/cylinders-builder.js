/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { ChunkedArray } from '../../../mol-data/util';
import { Cylinders } from './cylinders';
import { Vec3 } from '../../../mol-math/linear-algebra';
var tmpVecA = Vec3();
var tmpVecB = Vec3();
var tmpDir = Vec3();
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var caAdd = ChunkedArray.add;
var caAdd3 = ChunkedArray.add3;
export var CylindersBuilder;
(function (CylindersBuilder) {
    function create(initialCount, chunkSize, cylinders) {
        if (initialCount === void 0) { initialCount = 2048; }
        if (chunkSize === void 0) { chunkSize = 1024; }
        var groups = ChunkedArray.create(Float32Array, 1, chunkSize, cylinders ? cylinders.groupBuffer.ref.value : initialCount);
        var starts = ChunkedArray.create(Float32Array, 3, chunkSize, cylinders ? cylinders.startBuffer.ref.value : initialCount);
        var ends = ChunkedArray.create(Float32Array, 3, chunkSize, cylinders ? cylinders.endBuffer.ref.value : initialCount);
        var scales = ChunkedArray.create(Float32Array, 1, chunkSize, cylinders ? cylinders.scaleBuffer.ref.value : initialCount);
        var caps = ChunkedArray.create(Float32Array, 1, chunkSize, cylinders ? cylinders.capBuffer.ref.value : initialCount);
        var add = function (startX, startY, startZ, endX, endY, endZ, radiusScale, topCap, bottomCap, group) {
            for (var i = 0; i < 6; ++i) {
                caAdd3(starts, startX, startY, startZ);
                caAdd3(ends, endX, endY, endZ);
                caAdd(groups, group);
                caAdd(scales, radiusScale);
                caAdd(caps, (topCap ? 1 : 0) + (bottomCap ? 2 : 0));
            }
        };
        var addFixedCountDashes = function (start, end, segmentCount, radiusScale, topCap, bottomCap, stubCap, group) {
            var d = Vec3.distance(start, end);
            var isOdd = segmentCount % 2 !== 0;
            var s = Math.floor((segmentCount + 1) / 2);
            var step = d / (segmentCount + 0.5);
            Vec3.setMagnitude(tmpDir, Vec3.sub(tmpDir, end, start), step);
            Vec3.copy(tmpVecA, start);
            for (var j = 0; j < s; ++j) {
                Vec3.add(tmpVecA, tmpVecA, tmpDir);
                if (isOdd && j === s - 1) {
                    Vec3.copy(tmpVecB, end);
                    if (!stubCap)
                        bottomCap = false;
                }
                else {
                    Vec3.add(tmpVecB, tmpVecA, tmpDir);
                }
                add(tmpVecA[0], tmpVecA[1], tmpVecA[2], tmpVecB[0], tmpVecB[1], tmpVecB[2], radiusScale, topCap, bottomCap, group);
                Vec3.add(tmpVecA, tmpVecA, tmpDir);
            }
        };
        return {
            add: add,
            addFixedCountDashes: addFixedCountDashes,
            addFixedLengthDashes: function (start, end, segmentLength, radiusScale, topCap, bottomCap, group) {
                var d = Vec3.distance(start, end);
                addFixedCountDashes(start, end, d / segmentLength, radiusScale, topCap, bottomCap, true, group);
            },
            getCylinders: function () {
                var cylinderCount = groups.elementCount / 6;
                var gb = ChunkedArray.compact(groups, true);
                var sb = ChunkedArray.compact(starts, true);
                var eb = ChunkedArray.compact(ends, true);
                var ab = ChunkedArray.compact(scales, true);
                var cb = ChunkedArray.compact(caps, true);
                var mb = cylinders && cylinderCount <= cylinders.cylinderCount ? cylinders.mappingBuffer.ref.value : new Float32Array(cylinderCount * 18);
                var ib = cylinders && cylinderCount <= cylinders.cylinderCount ? cylinders.indexBuffer.ref.value : new Uint32Array(cylinderCount * 12);
                if (!cylinders || cylinderCount > cylinders.cylinderCount)
                    fillMappingAndIndices(cylinderCount, mb, ib);
                return Cylinders.create(mb, ib, gb, sb, eb, ab, cb, cylinderCount, cylinders);
            }
        };
    }
    CylindersBuilder.create = create;
})(CylindersBuilder || (CylindersBuilder = {}));
function fillMappingAndIndices(n, mb, ib) {
    for (var i = 0; i < n; ++i) {
        var mo = i * 18;
        mb[mo] = -1;
        mb[mo + 1] = 1;
        mb[mo + 2] = -1;
        mb[mo + 3] = -1;
        mb[mo + 4] = -1;
        mb[mo + 5] = -1;
        mb[mo + 6] = 1;
        mb[mo + 7] = 1;
        mb[mo + 8] = -1;
        mb[mo + 9] = 1;
        mb[mo + 10] = 1;
        mb[mo + 11] = 1;
        mb[mo + 12] = 1;
        mb[mo + 13] = -1;
        mb[mo + 14] = -1;
        mb[mo + 15] = 1;
        mb[mo + 16] = -1;
        mb[mo + 17] = 1;
    }
    for (var i = 0; i < n; ++i) {
        var o = i * 6;
        var io = i * 12;
        ib[io] = o;
        ib[io + 1] = o + 1;
        ib[io + 2] = o + 2;
        ib[io + 3] = o + 1;
        ib[io + 4] = o + 4;
        ib[io + 5] = o + 2;
        ib[io + 6] = o + 2;
        ib[io + 7] = o + 4;
        ib[io + 8] = o + 3;
        ib[io + 9] = o + 4;
        ib[io + 10] = o + 5;
        ib[io + 11] = o + 3;
    }
}
