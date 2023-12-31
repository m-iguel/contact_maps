/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __assign, __awaiter, __generator } from "tslib";
import * as File from '../common/file';
import { execute } from './query/execute';
import { ConsoleLogger } from '../../../mol-util/console-logger';
import * as DataFormat from '../common/data-format';
import { LimitsConfig } from '../config';
import { fileHandleFromDescriptor } from '../../common/file-handle';
export function getOutputFilename(source, id, _a) {
    var asBinary = _a.asBinary, box = _a.box, detail = _a.detail, forcedSamplingLevel = _a.forcedSamplingLevel;
    function n(s) { return (s || '').replace(/[ \n\t]/g, '').toLowerCase(); }
    function r(v) { return Math.round(10 * v) / 10; }
    var det = forcedSamplingLevel !== void 0
        ? "l".concat(forcedSamplingLevel)
        : "d".concat(Math.min(Math.max(0, detail | 0), LimitsConfig.maxOutputSizeInVoxelCountByPrecisionLevel.length - 1));
    var boxInfo = box.kind === 'Cell'
        ? 'cell'
        : "".concat(box.kind === 'Cartesian' ? 'cartn' : 'frac', "_").concat(r(box.a[0]), "_").concat(r(box.a[1]), "_").concat(r(box.a[2]), "_").concat(r(box.b[0]), "_").concat(r(box.b[1]), "_").concat(r(box.b[2]));
    return "".concat(n(source), "_").concat(n(id), "-").concat(boxInfo, "_").concat(det, ".").concat(asBinary ? 'bcif' : 'cif');
}
/** Reads the header and includes information about available detail levels */
export function getExtendedHeaderJson(filename, sourceId) {
    return __awaiter(this, void 0, void 0, function () {
        var header, _a, sampleCount, maxVoxelCount, precisions, availablePrecisions, _i, precisions_1, p, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    ConsoleLogger.log('Header', sourceId);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    if (!filename || !File.exists(filename)) {
                        ConsoleLogger.error("Header ".concat(sourceId), 'File not found.');
                        return [2 /*return*/, void 0];
                    }
                    _a = [{}];
                    return [4 /*yield*/, readHeader(filename, sourceId)];
                case 2:
                    header = __assign.apply(void 0, _a.concat([_b.sent()]));
                    sampleCount = header.sampling[0].sampleCount;
                    maxVoxelCount = sampleCount[0] * sampleCount[1] * sampleCount[2];
                    precisions = LimitsConfig.maxOutputSizeInVoxelCountByPrecisionLevel
                        .map(function (maxVoxels, precision) { return ({ precision: precision, maxVoxels: maxVoxels }); });
                    availablePrecisions = [];
                    for (_i = 0, precisions_1 = precisions; _i < precisions_1.length; _i++) {
                        p = precisions_1[_i];
                        availablePrecisions.push(p);
                        if (p.maxVoxels > maxVoxelCount)
                            break;
                    }
                    header.availablePrecisions = availablePrecisions;
                    header.isAvailable = true;
                    return [2 /*return*/, JSON.stringify(header, null, 2)];
                case 3:
                    e_1 = _b.sent();
                    ConsoleLogger.error("Header ".concat(sourceId), e_1);
                    return [2 /*return*/, void 0];
                case 4: return [2 /*return*/];
            }
        });
    });
}
export function queryBox(params, outputProvider) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, execute(params, outputProvider)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function readHeader(filename, sourceId) {
    return __awaiter(this, void 0, void 0, function () {
        var file, _a, header, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, 4, 5]);
                    if (!filename)
                        return [2 /*return*/, void 0];
                    _a = fileHandleFromDescriptor;
                    return [4 /*yield*/, File.openRead(filename)];
                case 1:
                    file = _a.apply(void 0, [_b.sent(), filename]);
                    return [4 /*yield*/, DataFormat.readHeader(file)];
                case 2:
                    header = _b.sent();
                    return [2 /*return*/, header.header];
                case 3:
                    e_2 = _b.sent();
                    ConsoleLogger.error("Info ".concat(sourceId), e_2);
                    return [2 /*return*/, void 0];
                case 4:
                    if (file)
                        file.close();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
