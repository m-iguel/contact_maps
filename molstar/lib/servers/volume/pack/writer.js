/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { getElementByteSize } from '../../../mol-io/common/typed-array';
import { SimpleBuffer } from '../../../mol-io/common/simple-buffer';
/** Converts a layer to blocks and writes them to the output file. */
export function writeBlockLayer(ctx, sampling) {
    return __awaiter(this, void 0, void 0, function () {
        var nU, nV, startOffset, v, u, size;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nU = Math.ceil(sampling.sampleCount[0] / ctx.blockSize);
                    nV = Math.ceil(sampling.sampleCount[1] / ctx.blockSize);
                    startOffset = ctx.dataByteOffset + sampling.byteOffset;
                    v = 0;
                    _a.label = 1;
                case 1:
                    if (!(v < nV)) return [3 /*break*/, 6];
                    u = 0;
                    _a.label = 2;
                case 2:
                    if (!(u < nU)) return [3 /*break*/, 5];
                    size = fillCubeBuffer(ctx, sampling, u, v);
                    return [4 /*yield*/, ctx.file.writeBuffer(startOffset + sampling.writeByteOffset, ctx.litteEndianCubeBuffer, size)];
                case 3:
                    _a.sent();
                    sampling.writeByteOffset += size;
                    updateProgress(ctx.progress, 1);
                    _a.label = 4;
                case 4:
                    u++;
                    return [3 /*break*/, 2];
                case 5:
                    v++;
                    return [3 /*break*/, 1];
                case 6:
                    sampling.blocks.slicesWritten = 0;
                    return [2 /*return*/];
            }
        });
    });
}
/** Fill a cube at position (u,v) with values from each of the channel */
function fillCubeBuffer(ctx, sampling, u, v) {
    var blockSize = ctx.blockSize, cubeBuffer = ctx.cubeBuffer;
    var sampleCount = sampling.sampleCount;
    var _a = sampling.blocks, buffers = _a.buffers, slicesWritten = _a.slicesWritten;
    var elementSize = getElementByteSize(ctx.valueType);
    var sizeH = sampleCount[0], sizeHK = sampleCount[0] * sampleCount[1];
    var offsetH = u * blockSize, offsetK = v * blockSize;
    var copyH = Math.min(blockSize, sampleCount[0] - offsetH) * elementSize, maxK = offsetK + Math.min(blockSize, sampleCount[1] - offsetK), maxL = slicesWritten;
    var writeOffset = 0;
    for (var _i = 0, buffers_1 = buffers; _i < buffers_1.length; _i++) {
        var src = buffers_1[_i];
        for (var l = 0; l < maxL; l++) {
            for (var k = offsetK; k < maxK; k++) {
                // copying the bytes direct is faster than using buffer.write* functions.
                var start = (l * sizeHK + k * sizeH + offsetH) * elementSize;
                src.copy(cubeBuffer, writeOffset, start, start + copyH);
                writeOffset += copyH;
            }
        }
    }
    // flip the byte order if needed.
    SimpleBuffer.ensureLittleEndian(ctx.cubeBuffer, ctx.litteEndianCubeBuffer, writeOffset, elementSize, 0);
    return writeOffset;
}
function updateProgress(progress, progressDone) {
    var old = (100 * progress.current / progress.max).toFixed(0);
    progress.current += progressDone;
    var $new = (100 * progress.current / progress.max).toFixed(0);
    if (old !== $new) {
        process.stdout.write("\rWriting data...    ".concat($new, "%"));
    }
}
