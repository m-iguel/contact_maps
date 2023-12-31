/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import { utf8ByteCount, utf8Write } from '../../mol-io/common/utf8';
import { to_mmCIF, Unit } from '../../mol-model/structure';
import { Task } from '../../mol-task';
import { getFormattedTime } from '../../mol-util/date';
import { download } from '../../mol-util/download';
import { zip } from '../../mol-util/zip/zip';
var ModelExportNameProp = '__ModelExportName__';
export var ModelExport = {
    getStructureName: function (structure) {
        return structure.inheritedPropertyData[ModelExportNameProp];
    },
    setStructureName: function (structure, name) {
        return structure.inheritedPropertyData[ModelExportNameProp] = name;
    }
};
export function exportHierarchy(plugin, options) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, plugin.runTask(_exportHierarchy(plugin, options), { useOverlay: true })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.error(e_1);
                    plugin.log.error("Model export failed. See console for details.");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function _exportHierarchy(plugin, options) {
    var _this = this;
    return Task.create('Export', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var format, structures, files, entryMap, _i, structures_1, _s, s, name_1, fileName, zipData, _a, files_1, _b, fn, data, bytes, buffer;
        var _c, _d, _e, _f, _g, _h, _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0: return [4 /*yield*/, ctx.update({ message: 'Exporting...', isIndeterminate: true, canAbort: false })];
                case 1:
                    _l.sent();
                    format = (_c = options === null || options === void 0 ? void 0 : options.format) !== null && _c !== void 0 ? _c : 'cif';
                    structures = plugin.managers.structure.hierarchy.current.structures;
                    files = [];
                    entryMap = new Map();
                    _i = 0, structures_1 = structures;
                    _l.label = 2;
                case 2:
                    if (!(_i < structures_1.length)) return [3 /*break*/, 7];
                    _s = structures_1[_i];
                    s = (_f = (_e = (_d = _s.transform) === null || _d === void 0 ? void 0 : _d.cell.obj) === null || _e === void 0 ? void 0 : _e.data) !== null && _f !== void 0 ? _f : (_g = _s.cell.obj) === null || _g === void 0 ? void 0 : _g.data;
                    if (!s)
                        return [3 /*break*/, 6];
                    if (s.models.length > 1) {
                        plugin.log.warn("[Export] Skipping ".concat((_h = _s.cell.obj) === null || _h === void 0 ? void 0 : _h.label, ": Multimodel exports not supported."));
                        return [3 /*break*/, 6];
                    }
                    if (s.units.some(function (u) { return !Unit.isAtomic(u); })) {
                        plugin.log.warn("[Export] Skipping ".concat((_j = _s.cell.obj) === null || _j === void 0 ? void 0 : _j.label, ": Non-atomic model exports not supported."));
                        return [3 /*break*/, 6];
                    }
                    name_1 = ModelExport.getStructureName(s) || s.model.entryId || 'unnamed';
                    fileName = entryMap.has(name_1)
                        ? "".concat(name_1, "_").concat(entryMap.get(name_1) + 1, ".").concat(format)
                        : "".concat(name_1, ".").concat(format);
                    entryMap.set(name_1, ((_k = entryMap.get(name_1)) !== null && _k !== void 0 ? _k : 0) + 1);
                    return [4 /*yield*/, ctx.update({ message: "Exporting ".concat(name_1, "..."), isIndeterminate: true, canAbort: false })];
                case 3:
                    _l.sent();
                    if (!(s.elementCount > 100000)) return [3 /*break*/, 5];
                    // Give UI chance to update, only needed for larger structures.
                    return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 50); })];
                case 4:
                    // Give UI chance to update, only needed for larger structures.
                    _l.sent();
                    _l.label = 5;
                case 5:
                    try {
                        files.push([fileName, to_mmCIF(name_1, s, format === 'bcif', { copyAllCategories: true })]);
                    }
                    catch (e) {
                        if (format === 'cif' && s.elementCount > 2000000) {
                            plugin.log.warn("[Export] The structure might be too big to be exported as Text CIF, consider using the BinaryCIF format instead.");
                        }
                        throw e;
                    }
                    _l.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    if (!(files.length === 1)) return [3 /*break*/, 8];
                    download(new Blob([files[0][1]]), files[0][0]);
                    return [3 /*break*/, 11];
                case 8:
                    if (!(files.length > 1)) return [3 /*break*/, 11];
                    zipData = {};
                    for (_a = 0, files_1 = files; _a < files_1.length; _a++) {
                        _b = files_1[_a], fn = _b[0], data = _b[1];
                        if (data instanceof Uint8Array) {
                            zipData[fn] = data;
                        }
                        else {
                            bytes = new Uint8Array(utf8ByteCount(data));
                            utf8Write(bytes, 0, data);
                            zipData[fn] = bytes;
                        }
                    }
                    return [4 /*yield*/, ctx.update({ message: "Compressing Data...", isIndeterminate: true, canAbort: false })];
                case 9:
                    _l.sent();
                    return [4 /*yield*/, zip(ctx, zipData)];
                case 10:
                    buffer = _l.sent();
                    download(new Blob([new Uint8Array(buffer, 0, buffer.byteLength)]), "structures_".concat(getFormattedTime(), ".zip"));
                    _l.label = 11;
                case 11:
                    plugin.log.info("[Export] Done.");
                    return [2 /*return*/];
            }
        });
    }); });
}
