import { __awaiter, __generator } from "tslib";
import * as util from 'util';
import * as fs from 'fs';
import { CIF } from '../mol-io/reader/cif';
import { Structure } from '../mol-model/structure';
import { GridLookup3D } from '../mol-math/geometry';
// import { sortArray } from 'mol-data/util';
import { OrderedSet } from '../mol-data/int';
import { trajectoryFromMmCIF } from '../mol-model-formats/structure/mmcif';
import { getBoundary } from '../mol-math/geometry/boundary';
require('util.promisify').shim();
var readFileAsync = util.promisify(fs.readFile);
function readData(path) {
    return __awaiter(this, void 0, void 0, function () {
        var input, data, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!path.match(/\.bcif$/)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFileAsync(path)];
                case 1:
                    input = _a.sent();
                    data = new Uint8Array(input.byteLength);
                    for (i = 0; i < input.byteLength; i++)
                        data[i] = input[i];
                    return [2 /*return*/, data];
                case 2: return [2 /*return*/, readFileAsync(path, 'utf8')];
            }
        });
    });
}
export function readCIF(path) {
    return __awaiter(this, void 0, void 0, function () {
        var input, comp, parsed, models, structures;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readData(path)];
                case 1:
                    input = _a.sent();
                    comp = typeof input === 'string' ? CIF.parseText(input) : CIF.parseBinary(input);
                    return [4 /*yield*/, comp.run()];
                case 2:
                    parsed = _a.sent();
                    if (parsed.isError) {
                        throw parsed;
                    }
                    return [4 /*yield*/, trajectoryFromMmCIF(parsed.result.blocks[0]).run()];
                case 3:
                    models = _a.sent();
                    structures = [Structure.ofModel(models.representative)];
                    return [2 /*return*/, { mmcif: models.representative.sourceData.data, models: models, structures: structures }];
            }
        });
    });
}
export function test() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, mmcif, structures, position, lookup, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, readCIF('e:/test/quick/1tqn_updated.cif')];
                case 1:
                    _a = _b.sent(), mmcif = _a.mmcif, structures = _a.structures;
                    position = { x: mmcif.db.atom_site.Cartn_x.toArray(), y: mmcif.db.atom_site.Cartn_y.toArray(), z: mmcif.db.atom_site.Cartn_z.toArray(),
                        indices: OrderedSet.ofBounds(0, mmcif.db.atom_site._rowCount),
                        // radius: [1, 1, 1, 1]
                        // indices: [1]
                    };
                    lookup = GridLookup3D(position, getBoundary(position));
                    console.log(lookup.boundary.box, lookup.boundary.sphere);
                    result = lookup.find(-30.07, 8.178, -13.897, 10);
                    console.log(result.count); // , sortArray(result.indices));
                    // const sl = structures[0].lookup3d;
                    // const result1 = sl.find(-30.07, 8.178, -13.897, 10);
                    // console.log(result1.count);//, result1.indices);
                    console.log(structures[0].boundary);
                    console.log(lookup.boundary);
                    return [2 /*return*/];
            }
        });
    });
}
test();
