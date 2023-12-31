/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { Task } from '../../../mol-task';
import { ReaderResult as Result } from '../result';
import { FileHandle } from '../../common/file-handle';
import { SimpleBuffer } from '../../../mol-io/common/simple-buffer';
export var dsn6HeaderSize = 512;
function parseBrixHeader(str) {
    return {
        xStart: parseInt(str.substr(10, 5)),
        yStart: parseInt(str.substr(15, 5)),
        zStart: parseInt(str.substr(20, 5)),
        xExtent: parseInt(str.substr(32, 5)),
        yExtent: parseInt(str.substr(38, 5)),
        zExtent: parseInt(str.substr(42, 5)),
        xRate: parseInt(str.substr(52, 5)),
        yRate: parseInt(str.substr(58, 5)),
        zRate: parseInt(str.substr(62, 5)),
        xlen: parseFloat(str.substr(73, 10)),
        ylen: parseFloat(str.substr(83, 10)),
        zlen: parseFloat(str.substr(93, 10)),
        alpha: parseFloat(str.substr(103, 10)),
        beta: parseFloat(str.substr(113, 10)),
        gamma: parseFloat(str.substr(123, 10)),
        divisor: parseFloat(str.substr(138, 12)),
        summand: parseInt(str.substr(155, 8)),
        sigma: parseFloat(str.substr(170, 12))
    };
}
function parseDsn6Header(buffer, littleEndian) {
    var readInt = littleEndian ? function (o) { return buffer.readInt16LE(o * 2); } : function (o) { return buffer.readInt16BE(o * 2); };
    var factor = 1 / readInt(17);
    return {
        xStart: readInt(0),
        yStart: readInt(1),
        zStart: readInt(2),
        xExtent: readInt(3),
        yExtent: readInt(4),
        zExtent: readInt(5),
        xRate: readInt(6),
        yRate: readInt(7),
        zRate: readInt(8),
        xlen: readInt(9) * factor,
        ylen: readInt(10) * factor,
        zlen: readInt(11) * factor,
        alpha: readInt(12) * factor,
        beta: readInt(13) * factor,
        gamma: readInt(14) * factor,
        divisor: readInt(15) / 100,
        summand: readInt(16),
        sigma: undefined
    };
}
function getBlocks(header) {
    var xExtent = header.xExtent, yExtent = header.yExtent, zExtent = header.zExtent;
    var xBlocks = Math.ceil(xExtent / 8);
    var yBlocks = Math.ceil(yExtent / 8);
    var zBlocks = Math.ceil(zExtent / 8);
    return { xBlocks: xBlocks, yBlocks: yBlocks, zBlocks: zBlocks };
}
export function readDsn6Header(file) {
    return __awaiter(this, void 0, void 0, function () {
        var buffer, brixStr, isBrix, littleEndian, header;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, file.readBuffer(0, dsn6HeaderSize)];
                case 1:
                    buffer = (_a.sent()).buffer;
                    brixStr = String.fromCharCode.apply(null, buffer);
                    isBrix = brixStr.startsWith(':-)');
                    littleEndian = isBrix || buffer.readInt16LE(18 * 2) === 100;
                    header = isBrix ? parseBrixHeader(brixStr) : parseDsn6Header(buffer, littleEndian);
                    return [2 /*return*/, { header: header, littleEndian: littleEndian }];
            }
        });
    });
}
export function parseDsn6Values(header, source, target, littleEndian) {
    return __awaiter(this, void 0, void 0, function () {
        var divisor, summand, xExtent, yExtent, zExtent, _a, xBlocks, yBlocks, zBlocks, offset, zz, yy, xx, k, z, j, y, i, x, idx;
        return __generator(this, function (_b) {
            if (!littleEndian) {
                // even though the values are one byte they need to be swapped like they are 2
                SimpleBuffer.flipByteOrderInPlace2(source.buffer);
            }
            divisor = header.divisor, summand = header.summand, xExtent = header.xExtent, yExtent = header.yExtent, zExtent = header.zExtent;
            _a = getBlocks(header), xBlocks = _a.xBlocks, yBlocks = _a.yBlocks, zBlocks = _a.zBlocks;
            offset = 0;
            // loop over blocks
            for (zz = 0; zz < zBlocks; ++zz) {
                for (yy = 0; yy < yBlocks; ++yy) {
                    for (xx = 0; xx < xBlocks; ++xx) {
                        // loop inside block
                        for (k = 0; k < 8; ++k) {
                            z = 8 * zz + k;
                            for (j = 0; j < 8; ++j) {
                                y = 8 * yy + j;
                                for (i = 0; i < 8; ++i) {
                                    x = 8 * xx + i;
                                    // check if remaining slice-part contains values
                                    if (x < xExtent && y < yExtent && z < zExtent) {
                                        idx = ((((x * yExtent) + y) * zExtent) + z);
                                        target[idx] = (source[offset] - summand) / divisor;
                                        ++offset;
                                    }
                                    else {
                                        offset += 8 - i;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return [2 /*return*/];
        });
    });
}
export function getDsn6Counts(header) {
    var xExtent = header.xExtent, yExtent = header.yExtent, zExtent = header.zExtent;
    var _a = getBlocks(header), xBlocks = _a.xBlocks, yBlocks = _a.yBlocks, zBlocks = _a.zBlocks;
    var valueCount = xExtent * yExtent * zExtent;
    var count = xBlocks * 8 * yBlocks * 8 * zBlocks * 8;
    var elementByteSize = 1;
    var byteCount = count * elementByteSize;
    return { count: count, byteCount: byteCount, valueCount: valueCount };
}
function parseInternal(file, size, ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, header, littleEndian, buffer, valueCount, values, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ctx.update({ message: 'Parsing DSN6/BRIX file...' })];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, readDsn6Header(file)];
                case 2:
                    _a = _b.sent(), header = _a.header, littleEndian = _a.littleEndian;
                    return [4 /*yield*/, file.readBuffer(dsn6HeaderSize, size - dsn6HeaderSize)];
                case 3:
                    buffer = (_b.sent()).buffer;
                    valueCount = getDsn6Counts(header).valueCount;
                    values = new Float32Array(valueCount);
                    return [4 /*yield*/, parseDsn6Values(header, buffer, values, littleEndian)];
                case 4:
                    _b.sent();
                    result = { header: header, values: values, name: file.name };
                    return [2 /*return*/, result];
            }
        });
    });
}
export function parseFile(file, size) {
    var _this = this;
    return Task.create('Parse DSN6/BRIX', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, e_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    _b = (_a = Result).success;
                    return [4 /*yield*/, parseInternal(file, size, ctx)];
                case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                case 2:
                    e_1 = _c.sent();
                    return [2 /*return*/, Result.error(e_1)];
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
export function parse(buffer, name) {
    return parseFile(FileHandle.fromBuffer(SimpleBuffer.fromUint8Array(buffer), name), buffer.length);
}
