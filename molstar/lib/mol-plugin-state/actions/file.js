/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator, __spreadArray } from "tslib";
import { StateAction } from '../../mol-state';
import { Task } from '../../mol-task';
import { Asset } from '../../mol-util/assets';
import { getFileNameInfo } from '../../mol-util/file-info';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { unzip } from '../../mol-util/zip/zip';
import { PluginStateObject } from '../objects';
function processFile(file, plugin, format, visuals) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var info, isBinary, data, provider, parsed;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    info = getFileNameInfo((_b = (_a = file.file) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '');
                    isBinary = plugin.dataFormats.binaryExtensions.has(info.ext);
                    return [4 /*yield*/, plugin.builders.data.readFile({ file: file, isBinary: isBinary })];
                case 1:
                    data = (_e.sent()).data;
                    provider = format === 'auto'
                        ? plugin.dataFormats.auto(info, (_c = data.cell) === null || _c === void 0 ? void 0 : _c.obj)
                        : plugin.dataFormats.get(format);
                    if (!!provider) return [3 /*break*/, 3];
                    plugin.log.warn("OpenFiles: could not find data provider for '".concat(info.ext, "'"));
                    return [4 /*yield*/, plugin.state.data.build().delete(data).commit()];
                case 2:
                    _e.sent();
                    return [2 /*return*/];
                case 3: return [4 /*yield*/, provider.parse(plugin, data)];
                case 4:
                    parsed = _e.sent();
                    if (!visuals) return [3 /*break*/, 6];
                    return [4 /*yield*/, ((_d = provider.visuals) === null || _d === void 0 ? void 0 : _d.call(provider, plugin, parsed))];
                case 5:
                    _e.sent();
                    _e.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
;
export var OpenFiles = StateAction.build({
    display: { name: 'Open Files', description: 'Load one or more files and optionally create default visuals' },
    from: PluginStateObject.Root,
    params: function (a, ctx) {
        var _a = ctx.dataFormats, extensions = _a.extensions, options = _a.options;
        return {
            files: PD.FileList({ accept: Array.from(extensions.values()).map(function (e) { return ".".concat(e); }).join(',') + ',.gz,.zip', multiple: true }),
            format: PD.MappedStatic('auto', {
                auto: PD.EmptyGroup(),
                specific: PD.Select(options[0][0], options)
            }),
            visuals: PD.Boolean(true, { description: 'Add default visuals' }),
        };
    }
})(function (_a, plugin) {
    var params = _a.params, state = _a.state;
    return Task.create('Open Files', function (taskCtx) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    plugin.behaviors.layout.leftPanelTabName.next('data');
                    return [4 /*yield*/, state.transaction(function () { return __awaiter(void 0, void 0, void 0, function () {
                            var _i, _a, file, zippedFiles, _b, _c, _d, _e, _f, fn, filedata, asset, format, e_1;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        if (params.files === null) {
                                            plugin.log.error('No file(s) selected');
                                            return [2 /*return*/];
                                        }
                                        _i = 0, _a = params.files;
                                        _g.label = 1;
                                    case 1:
                                        if (!(_i < _a.length)) return [3 /*break*/, 14];
                                        file = _a[_i];
                                        _g.label = 2;
                                    case 2:
                                        _g.trys.push([2, 12, , 13]);
                                        if (!(file.file && file.name.toLowerCase().endsWith('.zip'))) return [3 /*break*/, 9];
                                        _b = unzip;
                                        _c = [taskCtx];
                                        return [4 /*yield*/, file.file.arrayBuffer()];
                                    case 3: return [4 /*yield*/, _b.apply(void 0, _c.concat([_g.sent()]))];
                                    case 4:
                                        zippedFiles = _g.sent();
                                        _d = 0, _e = Object.entries(zippedFiles);
                                        _g.label = 5;
                                    case 5:
                                        if (!(_d < _e.length)) return [3 /*break*/, 8];
                                        _f = _e[_d], fn = _f[0], filedata = _f[1];
                                        if (!(filedata instanceof Uint8Array) || filedata.length === 0)
                                            return [3 /*break*/, 7];
                                        asset = Asset.File(new File([filedata], fn));
                                        return [4 /*yield*/, processFile(asset, plugin, 'auto', params.visuals)];
                                    case 6:
                                        _g.sent();
                                        _g.label = 7;
                                    case 7:
                                        _d++;
                                        return [3 /*break*/, 5];
                                    case 8: return [3 /*break*/, 11];
                                    case 9:
                                        format = params.format.name === 'auto' ? 'auto' : params.format.params;
                                        return [4 /*yield*/, processFile(file, plugin, format, params.visuals)];
                                    case 10:
                                        _g.sent();
                                        _g.label = 11;
                                    case 11: return [3 /*break*/, 13];
                                    case 12:
                                        e_1 = _g.sent();
                                        console.error(e_1);
                                        plugin.log.error("Error opening file '".concat(file.name, "'"));
                                        return [3 /*break*/, 13];
                                    case 13:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 14: return [2 /*return*/];
                                }
                            });
                        }); }).runInContext(taskCtx)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
export var DownloadFile = StateAction.build({
    display: { name: 'Download File', description: 'Load one or more file from an URL' },
    from: PluginStateObject.Root,
    params: function (a, ctx) {
        var options = __spreadArray(__spreadArray([], ctx.dataFormats.options, true), [['zip', 'Zip'], ['gzip', 'Gzip']], false);
        return {
            url: PD.Url(''),
            format: PD.Select(options[0][0], options),
            isBinary: PD.Boolean(false),
            visuals: PD.Boolean(true, { description: 'Add default visuals' }),
        };
    }
})(function (_a, plugin) {
    var params = _a.params, state = _a.state;
    return Task.create('Open Files', function (taskCtx) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    plugin.behaviors.layout.leftPanelTabName.next('data');
                    return [4 /*yield*/, state.transaction(function () { return __awaiter(void 0, void 0, void 0, function () {
                            var data, zippedFiles, _i, _a, _b, fn, filedata, asset, url, fileName, provider, data, parsed, e_2;
                            var _c, _d, _e;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        _f.trys.push([0, 15, , 16]);
                                        if (!(params.format === 'zip' || params.format === 'gzip')) return [3 /*break*/, 10];
                                        return [4 /*yield*/, plugin.builders.data.download({ url: params.url, isBinary: true })];
                                    case 1:
                                        data = _f.sent();
                                        if (!(params.format === 'zip')) return [3 /*break*/, 7];
                                        return [4 /*yield*/, unzip(taskCtx, ((_c = data.obj) === null || _c === void 0 ? void 0 : _c.data).buffer)];
                                    case 2:
                                        zippedFiles = _f.sent();
                                        _i = 0, _a = Object.entries(zippedFiles);
                                        _f.label = 3;
                                    case 3:
                                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                                        _b = _a[_i], fn = _b[0], filedata = _b[1];
                                        if (!(filedata instanceof Uint8Array) || filedata.length === 0)
                                            return [3 /*break*/, 5];
                                        asset = Asset.File(new File([filedata], fn));
                                        return [4 /*yield*/, processFile(asset, plugin, 'auto', params.visuals)];
                                    case 4:
                                        _f.sent();
                                        _f.label = 5;
                                    case 5:
                                        _i++;
                                        return [3 /*break*/, 3];
                                    case 6: return [3 /*break*/, 9];
                                    case 7:
                                        url = Asset.getUrl(params.url);
                                        fileName = getFileNameInfo(url).name;
                                        return [4 /*yield*/, processFile(Asset.File(new File([(_d = data.obj) === null || _d === void 0 ? void 0 : _d.data], fileName)), plugin, 'auto', params.visuals)];
                                    case 8:
                                        _f.sent();
                                        _f.label = 9;
                                    case 9: return [3 /*break*/, 14];
                                    case 10:
                                        provider = plugin.dataFormats.get(params.format);
                                        if (!provider) {
                                            plugin.log.warn("DownloadFile: could not find data provider for '".concat(params.format, "'"));
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, plugin.builders.data.download({ url: params.url, isBinary: params.isBinary })];
                                    case 11:
                                        data = _f.sent();
                                        return [4 /*yield*/, provider.parse(plugin, data)];
                                    case 12:
                                        parsed = _f.sent();
                                        if (!params.visuals) return [3 /*break*/, 14];
                                        return [4 /*yield*/, ((_e = provider.visuals) === null || _e === void 0 ? void 0 : _e.call(provider, plugin, parsed))];
                                    case 13:
                                        _f.sent();
                                        _f.label = 14;
                                    case 14: return [3 /*break*/, 16];
                                    case 15:
                                        e_2 = _f.sent();
                                        console.error(e_2);
                                        plugin.log.error("Error downloading '".concat(typeof params.url === 'string' ? params.url : params.url.url, "'"));
                                        return [3 /*break*/, 16];
                                    case 16: return [2 /*return*/];
                                }
                            });
                        }); }).runInContext(taskCtx)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
