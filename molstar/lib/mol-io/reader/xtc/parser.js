/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from NGL.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { Task } from '../../../mol-task';
import { ReaderResult as Result } from '../result';
var MagicInts = new Uint32Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64,
    80, 101, 128, 161, 203, 256, 322, 406, 512, 645, 812, 1024, 1290,
    1625, 2048, 2580, 3250, 4096, 5060, 6501, 8192, 10321, 13003,
    16384, 20642, 26007, 32768, 41285, 52015, 65536, 82570, 104031,
    131072, 165140, 208063, 262144, 330280, 416127, 524287, 660561,
    832255, 1048576, 1321122, 1664510, 2097152, 2642245, 3329021,
    4194304, 5284491, 6658042, 8388607, 10568983, 13316085, 16777216
]);
var FirstIdx = 9;
// const LastIdx = MagicInts.length
var Decoder;
(function (Decoder) {
    function sizeOfInt(size) {
        var num = 1;
        var numOfBits = 0;
        while (size >= num && numOfBits < 32) {
            numOfBits++;
            num <<= 1;
        }
        return numOfBits;
    }
    Decoder.sizeOfInt = sizeOfInt;
    var _tmpBytes = new Uint8Array(32);
    function sizeOfInts(numOfInts, sizes) {
        var numOfBytes = 1;
        var numOfBits = 0;
        _tmpBytes[0] = 1;
        for (var i = 0; i < numOfInts; i++) {
            var bytecnt = void 0;
            var tmp = 0;
            for (bytecnt = 0; bytecnt < numOfBytes; bytecnt++) {
                tmp += _tmpBytes[bytecnt] * sizes[i];
                _tmpBytes[bytecnt] = tmp & 0xff;
                tmp >>= 8;
            }
            while (tmp !== 0) {
                _tmpBytes[bytecnt++] = tmp & 0xff;
                tmp >>= 8;
            }
            numOfBytes = bytecnt;
        }
        var num = 1;
        numOfBytes--;
        while (_tmpBytes[numOfBytes] >= num) {
            numOfBits++;
            num *= 2;
        }
        return numOfBits + numOfBytes * 8;
    }
    Decoder.sizeOfInts = sizeOfInts;
    var _buffer = new ArrayBuffer(8 * 3);
    Decoder.buf = new Int32Array(_buffer);
    var uint32view = new Uint32Array(_buffer);
    function decodeBits(cbuf, offset, numOfBits1) {
        var numOfBits = numOfBits1;
        var mask = (1 << numOfBits) - 1;
        var lastBB0 = uint32view[1];
        var lastBB1 = uint32view[2];
        var cnt = Decoder.buf[0];
        var num = 0;
        while (numOfBits >= 8) {
            lastBB1 = (lastBB1 << 8) | cbuf[offset + cnt++];
            num |= (lastBB1 >> lastBB0) << (numOfBits - 8);
            numOfBits -= 8;
        }
        if (numOfBits > 0) {
            if (lastBB0 < numOfBits) {
                lastBB0 += 8;
                lastBB1 = (lastBB1 << 8) | cbuf[offset + cnt++];
            }
            lastBB0 -= numOfBits;
            num |= (lastBB1 >> lastBB0) & ((1 << numOfBits) - 1);
        }
        num &= mask;
        Decoder.buf[0] = cnt;
        Decoder.buf[1] = lastBB0;
        Decoder.buf[2] = lastBB1;
        return num;
    }
    Decoder.decodeBits = decodeBits;
    function decodeByte(cbuf, offset) {
        // special version of decodeBits with numOfBits = 8
        // const mask = 0xff; // (1 << 8) - 1;
        // let lastBB0 = uint32view[1];
        var lastBB1 = uint32view[2];
        var cnt = Decoder.buf[0];
        lastBB1 = (lastBB1 << 8) | cbuf[offset + cnt];
        Decoder.buf[0] = cnt + 1;
        // buf[1] = lastBB0;
        Decoder.buf[2] = lastBB1;
        return (lastBB1 >> uint32view[1]) & 0xff;
    }
    var intBytes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // new Int32Array(32);
    function decodeInts(cbuf, offset, numOfBits1, sizes, nums) {
        var numOfBits = numOfBits1;
        var numOfBytes = 0;
        intBytes[0] = 0;
        intBytes[1] = 0;
        intBytes[2] = 0;
        intBytes[3] = 0;
        while (numOfBits > 8) {
            // this is inversed??? why??? because of the endiannness???
            intBytes[numOfBytes++] = decodeByte(cbuf, offset);
            numOfBits -= 8;
        }
        if (numOfBits > 0) {
            intBytes[numOfBytes++] = decodeBits(cbuf, offset, numOfBits);
        }
        for (var i = 2; i > 0; i--) {
            var num = 0;
            var s = sizes[i];
            for (var j = numOfBytes - 1; j >= 0; j--) {
                num = (num << 8) | intBytes[j];
                var t = (num / s) | 0;
                intBytes[j] = t;
                num = num - t * s;
            }
            nums[i] = num;
        }
        nums[0] = intBytes[0] | (intBytes[1] << 8) | (intBytes[2] << 16) | (intBytes[3] << 24);
    }
    Decoder.decodeInts = decodeInts;
})(Decoder || (Decoder = {}));
function undefinedError() {
    throw new Error('(xdrfile error) Undefined error.');
}
function parseInternal(ctx, data) {
    return __awaiter(this, void 0, void 0, function () {
        var dv, f, coordinates, boxes, times, minMaxInt, sizeint, bitsizeint, sizesmall, thiscoord, prevcoord, offset, buf, frameCoords, natoms, box, i, i, lfp, lsize, precision, bitsize, smallidx, tmpIdx, smaller, smallnum, adz, invPrecision, run_1, i, flag, isSmaller, k, tmpSwap, c;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dv = new DataView(data.buffer, data.byteOffset);
                    f = {
                        frames: [],
                        boxes: [],
                        times: [],
                        timeOffset: 0,
                        deltaTime: 0
                    };
                    coordinates = f.frames;
                    boxes = f.boxes;
                    times = f.times;
                    minMaxInt = [0, 0, 0, 0, 0, 0];
                    sizeint = [0, 0, 0];
                    bitsizeint = [0, 0, 0];
                    sizesmall = [0, 0, 0];
                    thiscoord = [0.1, 0.1, 0.1];
                    prevcoord = [0.1, 0.1, 0.1];
                    offset = 0;
                    buf = Decoder.buf;
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 4];
                    frameCoords = void 0;
                    natoms = dv.getInt32(offset + 4);
                    // const step = dv.getInt32(offset + 8)
                    offset += 12;
                    times.push(dv.getFloat32(offset));
                    offset += 4;
                    box = new Float32Array(9);
                    for (i = 0; i < 9; ++i) {
                        box[i] = dv.getFloat32(offset) * 10;
                        offset += 4;
                    }
                    boxes.push(box);
                    if (natoms <= 9) { // no compression
                        frameCoords = { count: natoms / 3, x: new Float32Array(natoms / 3), y: new Float32Array(natoms / 3), z: new Float32Array(natoms / 3) };
                        for (i = 0; i < natoms / 3; ++i) {
                            frameCoords.x[i] = dv.getFloat32(offset);
                            frameCoords.y[i] = dv.getFloat32(offset);
                            frameCoords.z[i] = dv.getFloat32(offset);
                            offset += 4;
                        }
                    }
                    else {
                        buf[0] = buf[1] = buf[2] = 0;
                        sizeint[0] = sizeint[1] = sizeint[2] = 0;
                        sizesmall[0] = sizesmall[1] = sizesmall[2] = 0;
                        bitsizeint[0] = bitsizeint[1] = bitsizeint[2] = 0;
                        thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;
                        prevcoord[0] = prevcoord[1] = prevcoord[2] = 0;
                        frameCoords = { count: natoms, x: new Float32Array(natoms), y: new Float32Array(natoms), z: new Float32Array(natoms) };
                        lfp = 0;
                        lsize = dv.getInt32(offset);
                        offset += 4;
                        precision = dv.getFloat32(offset);
                        offset += 4;
                        minMaxInt[0] = dv.getInt32(offset);
                        minMaxInt[1] = dv.getInt32(offset + 4);
                        minMaxInt[2] = dv.getInt32(offset + 8);
                        minMaxInt[3] = dv.getInt32(offset + 12);
                        minMaxInt[4] = dv.getInt32(offset + 16);
                        minMaxInt[5] = dv.getInt32(offset + 20);
                        sizeint[0] = minMaxInt[3] - minMaxInt[0] + 1;
                        sizeint[1] = minMaxInt[4] - minMaxInt[1] + 1;
                        sizeint[2] = minMaxInt[5] - minMaxInt[2] + 1;
                        offset += 24;
                        bitsize = void 0;
                        if ((sizeint[0] | sizeint[1] | sizeint[2]) > 0xffffff) {
                            bitsizeint[0] = Decoder.sizeOfInt(sizeint[0]);
                            bitsizeint[1] = Decoder.sizeOfInt(sizeint[1]);
                            bitsizeint[2] = Decoder.sizeOfInt(sizeint[2]);
                            bitsize = 0; // flag the use of large sizes
                        }
                        else {
                            bitsize = Decoder.sizeOfInts(3, sizeint);
                        }
                        smallidx = dv.getInt32(offset);
                        offset += 4;
                        tmpIdx = smallidx - 1;
                        tmpIdx = (FirstIdx > tmpIdx) ? FirstIdx : tmpIdx;
                        smaller = (MagicInts[tmpIdx] / 2) | 0;
                        smallnum = (MagicInts[smallidx] / 2) | 0;
                        sizesmall[0] = sizesmall[1] = sizesmall[2] = MagicInts[smallidx];
                        adz = Math.ceil(dv.getInt32(offset) / 4) * 4;
                        offset += 4;
                        invPrecision = 1.0 / precision;
                        run_1 = 0;
                        i = 0;
                        // const buf8 = new Uint8Array(data.buffer, data.byteOffset + offset, 32 * 4); // 229...
                        thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;
                        while (i < lsize) {
                            if (bitsize === 0) {
                                thiscoord[0] = Decoder.decodeBits(data, offset, bitsizeint[0]);
                                thiscoord[1] = Decoder.decodeBits(data, offset, bitsizeint[1]);
                                thiscoord[2] = Decoder.decodeBits(data, offset, bitsizeint[2]);
                            }
                            else {
                                Decoder.decodeInts(data, offset, bitsize, sizeint, thiscoord);
                            }
                            i++;
                            thiscoord[0] += minMaxInt[0];
                            thiscoord[1] += minMaxInt[1];
                            thiscoord[2] += minMaxInt[2];
                            prevcoord[0] = thiscoord[0];
                            prevcoord[1] = thiscoord[1];
                            prevcoord[2] = thiscoord[2];
                            flag = Decoder.decodeBits(data, offset, 1);
                            isSmaller = 0;
                            if (flag === 1) {
                                run_1 = Decoder.decodeBits(data, offset, 5);
                                isSmaller = run_1 % 3;
                                run_1 -= isSmaller;
                                isSmaller--;
                            }
                            // if ((lfp-ptrstart)+run > size3){
                            //   fprintf(stderr, "(xdrfile error) Buffer overrun during decompression.\n");
                            //   return 0;
                            // }
                            if (run_1 > 0) {
                                thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;
                                for (k = 0; k < run_1; k += 3) {
                                    Decoder.decodeInts(data, offset, smallidx, sizesmall, thiscoord);
                                    i++;
                                    thiscoord[0] += prevcoord[0] - smallnum;
                                    thiscoord[1] += prevcoord[1] - smallnum;
                                    thiscoord[2] += prevcoord[2] - smallnum;
                                    if (k === 0) {
                                        tmpSwap = thiscoord[0];
                                        thiscoord[0] = prevcoord[0];
                                        prevcoord[0] = tmpSwap;
                                        tmpSwap = thiscoord[1];
                                        thiscoord[1] = prevcoord[1];
                                        prevcoord[1] = tmpSwap;
                                        tmpSwap = thiscoord[2];
                                        thiscoord[2] = prevcoord[2];
                                        prevcoord[2] = tmpSwap;
                                        frameCoords.x[lfp] = prevcoord[0] * invPrecision;
                                        frameCoords.y[lfp] = prevcoord[1] * invPrecision;
                                        frameCoords.z[lfp] = prevcoord[2] * invPrecision;
                                        lfp++;
                                    }
                                    else {
                                        prevcoord[0] = thiscoord[0];
                                        prevcoord[1] = thiscoord[1];
                                        prevcoord[2] = thiscoord[2];
                                    }
                                    frameCoords.x[lfp] = thiscoord[0] * invPrecision;
                                    frameCoords.y[lfp] = thiscoord[1] * invPrecision;
                                    frameCoords.z[lfp] = thiscoord[2] * invPrecision;
                                    lfp++;
                                }
                            }
                            else {
                                frameCoords.x[lfp] = thiscoord[0] * invPrecision;
                                frameCoords.y[lfp] = thiscoord[1] * invPrecision;
                                frameCoords.z[lfp] = thiscoord[2] * invPrecision;
                                lfp++;
                            }
                            smallidx += isSmaller;
                            if (isSmaller < 0) {
                                smallnum = smaller;
                                if (smallidx > FirstIdx) {
                                    smaller = (MagicInts[smallidx - 1] / 2) | 0;
                                }
                                else {
                                    smaller = 0;
                                }
                            }
                            else if (isSmaller > 0) {
                                smaller = smallnum;
                                smallnum = (MagicInts[smallidx] / 2) | 0;
                            }
                            sizesmall[0] = sizesmall[1] = sizesmall[2] = MagicInts[smallidx];
                            if (sizesmall[0] === 0 || sizesmall[1] === 0 || sizesmall[2] === 0) {
                                undefinedError();
                            }
                        }
                        offset += adz;
                    }
                    for (c = 0; c < natoms; c++) {
                        frameCoords.x[c] *= 10;
                        frameCoords.y[c] *= 10;
                        frameCoords.z[c] *= 10;
                    }
                    coordinates.push(frameCoords);
                    if (!ctx.shouldUpdate) return [3 /*break*/, 3];
                    return [4 /*yield*/, ctx.update({ current: offset, max: data.length })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (offset >= data.length)
                        return [3 /*break*/, 4];
                    return [3 /*break*/, 1];
                case 4:
                    if (times.length >= 1) {
                        f.timeOffset = times[0];
                    }
                    if (times.length >= 2) {
                        f.deltaTime = times[1] - times[0];
                    }
                    return [2 /*return*/, f];
            }
        });
    });
}
export function parseXtc(data) {
    var _this = this;
    return Task.create('Parse XTC', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var file, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    ctx.update({ canAbort: true, message: 'Parsing trajectory...' });
                    return [4 /*yield*/, parseInternal(ctx, data)];
                case 1:
                    file = _a.sent();
                    return [2 /*return*/, Result.success(file)];
                case 2:
                    e_1 = _a.sent();
                    return [2 /*return*/, Result.error('' + e_1)];
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
