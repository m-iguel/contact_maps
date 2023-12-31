/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import * as util from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as zlib from 'zlib';
import fetch from 'node-fetch';
require('util.promisify').shim();
var readFile = util.promisify(fs.readFile);
var writeFile = util.promisify(fs.writeFile);
import { Progress } from '../../mol-task';
import { CIF } from '../../mol-io/reader/cif';
import { CifWriter } from '../../mol-io/writer/cif';
import { CCD_Schema } from '../../mol-io/reader/cif/schema/ccd';
export function ensureAvailable(path, url, forceDownload) {
    if (forceDownload === void 0) { forceDownload = false; }
    return __awaiter(this, void 0, void 0, function () {
        var data, _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!(forceDownload || !fs.existsSync(path))) return [3 /*break*/, 8];
                    console.log("downloading ".concat(url, "..."));
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    data = _g.sent();
                    if (!fs.existsSync(DATA_DIR)) {
                        fs.mkdirSync(DATA_DIR);
                    }
                    if (!url.endsWith('.gz')) return [3 /*break*/, 4];
                    _a = writeFile;
                    _b = [path];
                    _d = (_c = zlib).gunzipSync;
                    return [4 /*yield*/, data.buffer()];
                case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([_d.apply(_c, [_g.sent()])]))];
                case 3:
                    _g.sent();
                    return [3 /*break*/, 7];
                case 4:
                    _e = writeFile;
                    _f = [path];
                    return [4 /*yield*/, data.text()];
                case 5: return [4 /*yield*/, _e.apply(void 0, _f.concat([_g.sent()]))];
                case 6:
                    _g.sent();
                    _g.label = 7;
                case 7:
                    console.log("done downloading ".concat(url));
                    _g.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
}
export function ensureDataAvailable(options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureAvailable(CCD_PATH, options.ccdUrl || CCD_URL, !!options.ccdUrl || options.forceDownload)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, ensureAvailable(PVCD_PATH, options.pvcdUrl || PVCD_URL, !!options.pvcdUrl || options.forceDownload)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
export function readFileAsCollection(path, schema) {
    return __awaiter(this, void 0, void 0, function () {
        var parsed, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = parseCif;
                    return [4 /*yield*/, readFile(path, 'utf8')];
                case 1: return [4 /*yield*/, _a.apply(void 0, [_b.sent()])];
                case 2:
                    parsed = _b.sent();
                    return [2 /*return*/, CIF.toDatabaseCollection(schema, parsed.result)];
            }
        });
    });
}
export function readCCD() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, readFileAsCollection(CCD_PATH, CCD_Schema)];
        });
    });
}
export function readPVCD() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, readFileAsCollection(PVCD_PATH, CCD_Schema)];
        });
    });
}
function parseCif(data) {
    return __awaiter(this, void 0, void 0, function () {
        var comp, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    comp = CIF.parse(data);
                    console.time('parse cif');
                    return [4 /*yield*/, comp.run(function (p) { return console.log(Progress.format(p)); }, 250)];
                case 1:
                    parsed = _a.sent();
                    console.timeEnd('parse cif');
                    if (parsed.isError)
                        throw parsed;
                    return [2 /*return*/, parsed];
            }
        });
    });
}
export function getEncodedCif(name, database, binary) {
    if (binary === void 0) { binary = false; }
    var encoder = CifWriter.createEncoder({ binary: binary, encoderName: 'mol*' });
    CifWriter.Encoder.writeDatabase(encoder, name, database);
    return encoder.getData();
}
export var DefaultDataOptions = {
    forceDownload: false
};
var DATA_DIR = path.join(__dirname, '..', '..', '..', '..', 'build/data');
var CCD_PATH = path.join(DATA_DIR, 'components.cif');
var PVCD_PATH = path.join(DATA_DIR, 'aa-variants-v1.cif');
var CCD_URL = 'https://files.wwpdb.org/pub/pdb/data/monomers/components.cif';
var PVCD_URL = 'https://files.wwpdb.org/pub/pdb/data/monomers/aa-variants-v1.cif';
