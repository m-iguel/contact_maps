/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import * as Box from '../algebra/box';
import * as Coords from '../algebra/coordinate';
import { createTypedArrayBufferContext, getElementByteSize, readTypedArray } from '../../../../mol-io/common/typed-array';
export function compose(query) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, block;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = query.samplingInfo.blocks;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    block = _a[_i];
                    return [4 /*yield*/, fillBlock(query, block)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function readBlock(query, coord, blockBox) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, valueType, blockSize, elementByteSize, numChannels, blockSampleCount, size, byteSize, dataSampleCount, buffer, byteOffset, values;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = query.data.header, valueType = _a.valueType, blockSize = _a.blockSize;
                    elementByteSize = getElementByteSize(valueType);
                    numChannels = query.data.header.channels.length;
                    blockSampleCount = Box.dimensions(Box.fractionalToGrid(blockBox, query.samplingInfo.sampling.dataDomain));
                    size = numChannels * blockSampleCount[0] * blockSampleCount[1] * blockSampleCount[2];
                    byteSize = elementByteSize * size;
                    dataSampleCount = query.data.header.sampling[query.samplingInfo.sampling.index].sampleCount;
                    buffer = createTypedArrayBufferContext(size, valueType);
                    byteOffset = query.samplingInfo.sampling.byteOffset
                        + elementByteSize * numChannels * blockSize
                            * (blockSampleCount[1] * blockSampleCount[2] * coord[0]
                                + dataSampleCount[0] * blockSampleCount[2] * coord[1]
                                + dataSampleCount[0] * dataSampleCount[1] * coord[2]);
                    return [4 /*yield*/, readTypedArray(buffer, query.data.file, byteOffset, byteSize, 0)];
                case 1:
                    values = _b.sent();
                    return [2 /*return*/, {
                            sampleCount: blockSampleCount,
                            values: values
                        }];
            }
        });
    });
}
function fillData(query, blockData, blockGridBox, queryGridBox) {
    var source = blockData.values;
    var _a = Coords.gridMetrics(query.samplingInfo.gridDomain.sampleCount), tSizeH = _a.sizeX, tSizeHK = _a.sizeXY;
    var _b = Coords.gridMetrics(blockData.sampleCount), sSizeH = _b.sizeX, sSizeHK = _b.sizeXY;
    var offsetTarget = queryGridBox.a[0] + queryGridBox.a[1] * tSizeH + queryGridBox.a[2] * tSizeHK;
    var _c = Box.dimensions(blockGridBox), maxH = _c[0], maxK = _c[1], maxL = _c[2];
    for (var channelIndex = 0, _ii = query.data.header.channels.length; channelIndex < _ii; channelIndex++) {
        var target = query.values[channelIndex];
        var offsetSource = channelIndex * blockGridBox.a.domain.sampleVolume
            + blockGridBox.a[0] + blockGridBox.a[1] * sSizeH + blockGridBox.a[2] * sSizeHK;
        for (var l = 0; l < maxL; l++) {
            for (var k = 0; k < maxK; k++) {
                for (var h = 0; h < maxH; h++) {
                    target[offsetTarget + h + k * tSizeH + l * tSizeHK]
                        = source[offsetSource + h + k * sSizeH + l * sSizeHK];
                }
            }
        }
    }
}
function createBlockGridDomain(block, grid) {
    var blockBox = Box.fractionalFromBlock(block);
    var origin = blockBox.a;
    var dimensions = Coords.sub(blockBox.b, blockBox.a);
    var sampleCount = Coords.sampleCounts(dimensions, grid.delta);
    return Coords.domain('BlockGrid', { origin: origin, dimensions: dimensions, delta: grid.delta, sampleCount: sampleCount });
}
/** Read the block data and fill all the overlaps with the query region. */
function fillBlock(query, block) {
    return __awaiter(this, void 0, void 0, function () {
        var baseBox, blockGridDomain, blockData, _i, _a, offset, offsetQueryBox, dataBox, offsetDataBox, blockGridBox, queryGridBox;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    baseBox = Box.fractionalFromBlock(block.coord);
                    blockGridDomain = createBlockGridDomain(block.coord, query.samplingInfo.sampling.dataDomain);
                    return [4 /*yield*/, readBlock(query, block.coord, baseBox)];
                case 1:
                    blockData = _b.sent();
                    for (_i = 0, _a = block.offsets; _i < _a.length; _i++) {
                        offset = _a[_i];
                        offsetQueryBox = Box.shift(query.samplingInfo.fractionalBox, offset);
                        dataBox = Box.intersect(baseBox, offsetQueryBox);
                        if (!dataBox)
                            continue;
                        offsetDataBox = Box.shift(dataBox, Coords.invert(offset));
                        blockGridBox = Box.clampGridToSamples(Box.fractionalToGrid(dataBox, blockGridDomain));
                        queryGridBox = Box.clampGridToSamples(Box.fractionalToGrid(offsetDataBox, query.samplingInfo.gridDomain));
                        fillData(query, blockData, blockGridBox, queryGridBox);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
