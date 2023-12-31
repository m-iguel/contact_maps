/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import * as Format from './format';
import * as File from '../common/file';
import * as Data from './data-model';
import * as Sampling from './sampling';
import * as DataFormat from '../common/data-format';
export function pack(input, blockSizeInMB, isPeriodic, outputFilename, format) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, create(outputFilename, input, blockSizeInMB, isPeriodic, format)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.error('[Error] ' + e_1);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getTime() {
    var t = process.hrtime();
    return t[0] * 1000 + t[1] / 1000000;
}
function updateAllocationProgress(progress, progressDone) {
    var old = (100 * progress.current / progress.max).toFixed(0);
    progress.current += progressDone;
    var $new = (100 * progress.current / progress.max).toFixed(0);
    if (old !== $new) {
        process.stdout.write("\rAllocating...      ".concat($new, "%"));
    }
}
/**
 * Pre allocate the disk space to be able to do "random" writes into the entire file.
 */
function allocateFile(ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var totalByteSize, file, buffer, progress, written;
        return __generator(this, function (_a) {
            totalByteSize = ctx.totalByteSize, file = ctx.file;
            buffer = Buffer.alloc(Math.min(totalByteSize, 8 * 1024 * 1024));
            progress = { current: 0, max: Math.ceil(totalByteSize / buffer.byteLength) };
            written = 0;
            while (written < totalByteSize) {
                written += file.writeBufferSync(written, buffer, Math.min(totalByteSize - written, buffer.byteLength));
                updateAllocationProgress(progress, 1);
            }
            return [2 /*return*/];
        });
    });
}
function determineBlockSize(data, blockSizeInMB) {
    var extent = data.header.extent;
    var maxLayerSize = 1024 * 1024 * 1024;
    var valueCount = extent[0] * extent[1];
    if (valueCount * blockSizeInMB <= maxLayerSize)
        return blockSizeInMB;
    while (blockSizeInMB > 0) {
        blockSizeInMB -= 4;
        if (valueCount * blockSizeInMB <= maxLayerSize)
            return blockSizeInMB;
    }
    throw new Error('Could not determine a valid block size.');
}
function writeHeader(ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var header;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    header = DataFormat.encodeHeader(Data.createHeader(ctx));
                    return [4 /*yield*/, File.writeInt(ctx.file, header.byteLength, 0)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, ctx.file.writeBuffer(4, header)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function create(filename, sourceDensities, sourceBlockSizeInMB, isPeriodic, format) {
    return __awaiter(this, void 0, void 0, function () {
        var startedTime, files, channels_3, _i, sourceDensities_1, s, _a, _b, isOk, blockSizeInMB, _c, channels_1, ch, context, _d, channels_2, s, time, _e, files_1, f;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    startedTime = getTime();
                    if (sourceBlockSizeInMB % 4 !== 0 || sourceBlockSizeInMB < 4) {
                        throw Error('Block size must be a positive number divisible by 4.');
                    }
                    if (!sourceDensities.length) {
                        throw Error('Specify at least one source density.');
                    }
                    process.stdout.write("Initializing using ".concat(format, " format..."));
                    files = [];
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, , 10, 11]);
                    channels_3 = [];
                    _i = 0, sourceDensities_1 = sourceDensities;
                    _f.label = 2;
                case 2:
                    if (!(_i < sourceDensities_1.length)) return [3 /*break*/, 5];
                    s = sourceDensities_1[_i];
                    _b = (_a = channels_3).push;
                    return [4 /*yield*/, Format.open(s.name, s.filename, format)];
                case 3:
                    _b.apply(_a, [_f.sent()]);
                    _f.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    isOk = channels_3.reduce(function (ok, s) { return ok && Format.compareHeaders(channels_3[0].data.header, s.data.header); }, true);
                    if (!isOk) {
                        throw new Error('Input file headers are not compatible (different grid, etc.).');
                    }
                    blockSizeInMB = determineBlockSize(channels_3[0].data, sourceBlockSizeInMB);
                    for (_c = 0, channels_1 = channels_3; _c < channels_1.length; _c++) {
                        ch = channels_1[_c];
                        Format.assignSliceBuffer(ch.data, blockSizeInMB);
                    }
                    return [4 /*yield*/, Sampling.createContext(filename, channels_3, blockSizeInMB, isPeriodic)];
                case 6:
                    context = _f.sent();
                    for (_d = 0, channels_2 = channels_3; _d < channels_2.length; _d++) {
                        s = channels_2[_d];
                        files.push(s.data.file);
                    }
                    files.push(context.file);
                    process.stdout.write('   done.\n');
                    console.log("Block size: ".concat(blockSizeInMB));
                    // Step 2: Allocate disk space.
                    process.stdout.write('Allocating...      0%');
                    return [4 /*yield*/, allocateFile(context)];
                case 7:
                    _f.sent();
                    process.stdout.write('\rAllocating...      done.\n');
                    // Step 3: Process and write the data
                    process.stdout.write('Writing data...    0%');
                    return [4 /*yield*/, Sampling.processData(context)];
                case 8:
                    _f.sent();
                    process.stdout.write('\rWriting data...    done.\n');
                    // Step 4: Write the header at the start of the file.
                    // The header is written last because the sigma/min/max values are computed
                    // during step 3.
                    process.stdout.write('Writing header...  ');
                    return [4 /*yield*/, writeHeader(context)];
                case 9:
                    _f.sent();
                    process.stdout.write('done.\n');
                    time = getTime() - startedTime;
                    console.log("[Done] ".concat(time.toFixed(0), "ms."));
                    return [3 /*break*/, 11];
                case 10:
                    for (_e = 0, files_1 = files; _e < files_1.length; _e++) {
                        f = files_1[_e];
                        f.close();
                    }
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
