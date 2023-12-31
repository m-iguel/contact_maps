/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { ChunkedArray } from '../../../mol-data/util';
import { Lines } from './lines';
import { Vec3 } from '../../../mol-math/linear-algebra';
var tmpVecA = Vec3();
var tmpVecB = Vec3();
var tmpDir = Vec3();
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
var caAdd = ChunkedArray.add;
var caAdd3 = ChunkedArray.add3;
export var LinesBuilder;
(function (LinesBuilder) {
    function create(initialCount, chunkSize, lines) {
        if (initialCount === void 0) { initialCount = 2048; }
        if (chunkSize === void 0) { chunkSize = 1024; }
        var groups = ChunkedArray.create(Float32Array, 1, chunkSize, lines ? lines.groupBuffer.ref.value : initialCount);
        var starts = ChunkedArray.create(Float32Array, 3, chunkSize, lines ? lines.startBuffer.ref.value : initialCount);
        var ends = ChunkedArray.create(Float32Array, 3, chunkSize, lines ? lines.endBuffer.ref.value : initialCount);
        var add = function (startX, startY, startZ, endX, endY, endZ, group) {
            for (var i = 0; i < 4; ++i) {
                caAdd3(starts, startX, startY, startZ);
                caAdd3(ends, endX, endY, endZ);
                caAdd(groups, group);
            }
        };
        var addVec = function (start, end, group) {
            for (var i = 0; i < 4; ++i) {
                caAdd3(starts, start[0], start[1], start[2]);
                caAdd3(ends, end[0], end[1], end[2]);
                caAdd(groups, group);
            }
        };
        var addFixedCountDashes = function (start, end, segmentCount, group) {
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
                }
                else {
                    Vec3.add(tmpVecB, tmpVecA, tmpDir);
                }
                add(tmpVecA[0], tmpVecA[1], tmpVecA[2], tmpVecB[0], tmpVecB[1], tmpVecB[2], group);
                Vec3.add(tmpVecA, tmpVecA, tmpDir);
            }
        };
        return {
            add: add,
            addVec: addVec,
            addFixedCountDashes: addFixedCountDashes,
            addFixedLengthDashes: function (start, end, segmentLength, group) {
                var d = Vec3.distance(start, end);
                addFixedCountDashes(start, end, d / segmentLength, group);
            },
            addCage: function (t, cage, group) {
                var vertices = cage.vertices, edges = cage.edges;
                for (var i = 0, il = edges.length; i < il; i += 2) {
                    Vec3.fromArray(tmpVecA, vertices, edges[i] * 3);
                    Vec3.fromArray(tmpVecB, vertices, edges[i + 1] * 3);
                    Vec3.transformMat4(tmpVecA, tmpVecA, t);
                    Vec3.transformMat4(tmpVecB, tmpVecB, t);
                    add(tmpVecA[0], tmpVecA[1], tmpVecA[2], tmpVecB[0], tmpVecB[1], tmpVecB[2], group);
                }
            },
            getLines: function () {
                var lineCount = groups.elementCount / 4;
                var gb = ChunkedArray.compact(groups, true);
                var sb = ChunkedArray.compact(starts, true);
                var eb = ChunkedArray.compact(ends, true);
                var mb = lines && lineCount <= lines.lineCount ? lines.mappingBuffer.ref.value : new Float32Array(lineCount * 8);
                var ib = lines && lineCount <= lines.lineCount ? lines.indexBuffer.ref.value : new Uint32Array(lineCount * 6);
                if (!lines || lineCount > lines.lineCount)
                    fillMappingAndIndices(lineCount, mb, ib);
                return Lines.create(mb, ib, gb, sb, eb, lineCount, lines);
            }
        };
    }
    LinesBuilder.create = create;
})(LinesBuilder || (LinesBuilder = {}));
function fillMappingAndIndices(n, mb, ib) {
    for (var i = 0; i < n; ++i) {
        var mo = i * 8;
        mb[mo] = -1;
        mb[mo + 1] = -1;
        mb[mo + 2] = 1;
        mb[mo + 3] = -1;
        mb[mo + 4] = -1;
        mb[mo + 5] = 1;
        mb[mo + 6] = 1;
        mb[mo + 7] = 1;
    }
    for (var i = 0; i < n; ++i) {
        var o = i * 4;
        var io = i * 6;
        ib[io] = o;
        ib[io + 1] = o + 1;
        ib[io + 2] = o + 2;
        ib[io + 3] = o + 1;
        ib[io + 4] = o + 3;
        ib[io + 5] = o + 2;
    }
}
