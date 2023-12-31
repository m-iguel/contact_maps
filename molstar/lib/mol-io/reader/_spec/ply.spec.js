/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { parsePly } from '../ply/parser';
var plyString = "ply\nformat ascii 1.0\ncomment file created by MegaMol\nelement vertex 6\nproperty float x\nproperty float y\nproperty float z\nproperty uchar red\nproperty uchar green\nproperty uchar blue\nproperty uchar alpha\nproperty float nx\nproperty float ny\nproperty float nz\nproperty int atomid\nproperty uchar contactcount_r\nproperty uchar contactcount_g\nproperty uchar contactcount_b\nproperty uchar contactsteps_r\nproperty uchar contactsteps_g\nproperty uchar contactsteps_b\nproperty uchar hbonds_r\nproperty uchar hbonds_g\nproperty uchar hbonds_b\nproperty uchar hbondsteps_r\nproperty uchar hbondsteps_g\nproperty uchar hbondsteps_b\nproperty uchar molcount_r\nproperty uchar molcount_g\nproperty uchar molcount_b\nproperty uchar spots_r\nproperty uchar spots_g\nproperty uchar spots_b\nproperty uchar rmsf_r\nproperty uchar rmsf_g\nproperty uchar rmsf_b\nelement face 2\nproperty list uchar int vertex_index\nend_header\n130.901 160.016 163.033 90 159 210 255 -0.382 -0.895 -0.231 181 21 100 150 24 102 151 20 100 150 20 100 150 30 106 154 20 100 150 171 196 212\n131.372 159.778 162.83 90 159 210 255 -0.618 -0.776 -0.129 178 21 100 150 24 102 151 20 100 150 20 100 150 30 106 154 20 100 150 141 177 199\n131.682 159.385 163.089 90 159 210 255 -0.773 -0.579 -0.259 180 21 100 150 24 102 151 20 100 150 20 100 150 30 106 154 20 100 150 172 196 212\n131.233 160.386 162.11 90 159 210 255 -0.708 -0.383 -0.594 178 21 100 150 24 102 151 20 100 150 20 100 150 30 106 154 20 100 150 141 177 199\n130.782 160.539 162.415 90 159 210 255 -0.482 -0.459 -0.746 181 21 100 150 24 102 151 20 100 150 20 100 150 30 106 154 20 100 150 171 196 212\n131.482 160.483 161.621 90 159 210 255 -0.832 -0.431 -0.349 179 21 100 150 24 102 151 20 100 150 20 100 150 30 106 154 20 100 150 171 196 212\n3 0 2 1\n3 3 5 4\n";
var plyCubeString = "ply\nformat ascii 1.0\ncomment test cube\nelement vertex 24\nproperty float32 x\nproperty float32 y\nproperty float32 z\nproperty uint32 material_index\nelement face 6\nproperty list uint8 int32 vertex_indices\nelement material 6\nproperty uint8 red\nproperty uint8 green\nproperty uint8 blue\nend_header\n-1 -1 -1 0\n1 -1 -1 0\n1 1 -1 0\n-1 1 -1 0\n1 -1 1 1\n-1 -1 1 1\n-1 1 1 1\n1 1 1 1\n1 1 1 2\n1 1 -1 2\n1 -1 -1 2\n1 -1 1 2\n-1 1 -1 3\n-1 1 1 3\n-1 -1 1 3\n-1 -1 -1 3\n-1 1 1 4\n-1 1 -1 4\n1 1 -1 4\n1 1 1 4\n1 -1 1 5\n1 -1 -1 5\n-1 -1 -1 5\n-1 -1 1 5\n4 0 1 2 3\n4 4 5 6 7\n4 8 9 10 11\n4 12 13 14 15\n4 16 17 18 19\n4 20 21 22 23\n255 0 0\n0 255 0\n0 0 255\n255 255 0\n0 255 255\n255 0 255\n";
describe('ply reader', function () {
    it('basic', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parsed, plyFile, vertex, x, face;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parsePly(plyString).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError)
                        return [2 /*return*/];
                    plyFile = parsed.result;
                    vertex = plyFile.getElement('vertex');
                    if (!vertex)
                        return [2 /*return*/];
                    x = vertex.getProperty('x');
                    if (!x)
                        return [2 /*return*/];
                    expect(x.value(0)).toEqual(130.901);
                    face = plyFile.getElement('face');
                    if (!face)
                        return [2 /*return*/];
                    expect(face.value(0)).toEqual({ count: 3, entries: [0, 2, 1] });
                    expect(face.value(1)).toEqual({ count: 3, entries: [3, 5, 4] });
                    expect.assertions(3);
                    return [2 /*return*/];
            }
        });
    }); });
    it('material', function () { return __awaiter(void 0, void 0, void 0, function () {
        var parsed, plyFile, vertex, face, material;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parsePly(plyCubeString).run()];
                case 1:
                    parsed = _a.sent();
                    if (parsed.isError)
                        return [2 /*return*/];
                    plyFile = parsed.result;
                    vertex = plyFile.getElement('vertex');
                    if (!vertex)
                        return [2 /*return*/];
                    expect(vertex.rowCount).toBe(24);
                    face = plyFile.getElement('face');
                    if (!face)
                        return [2 /*return*/];
                    expect(face.rowCount).toBe(6);
                    material = plyFile.getElement('face');
                    if (!material)
                        return [2 /*return*/];
                    expect(face.rowCount).toBe(6);
                    expect.assertions(3);
                    return [2 /*return*/];
            }
        });
    }); });
});
