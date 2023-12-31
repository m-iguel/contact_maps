import { __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { DownloadFile } from '../../mol-plugin-state/actions/file';
import { DownloadStructure, LoadTrajectory } from '../../mol-plugin-state/actions/structure';
import { DownloadDensity } from '../../mol-plugin-state/actions/volume';
import { CoordinatesFormatCategory } from '../../mol-plugin-state/formats/coordinates';
import { TopologyFormatCategory } from '../../mol-plugin-state/formats/topology';
import { TrajectoryFormatCategory } from '../../mol-plugin-state/formats/trajectory';
import { VolumeFormatCategory } from '../../mol-plugin-state/formats/volume';
import { CollapsableControls } from '../../mol-plugin-ui/base';
import { Button } from '../../mol-plugin-ui/controls/common';
import { OpenInBrowserSvg } from '../../mol-plugin-ui/controls/icons';
import { ParameterControls } from '../../mol-plugin-ui/controls/parameters';
import { formatBytes } from '../../mol-util';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
var ZenodoImportParams = {
    record: PD.Text('', { description: 'Zenodo ID.' })
};
function createImportParams(files, plugin) {
    var modelOpts = [];
    var topologyOpts = [];
    var coordinatesOpts = [];
    var volumeOpts = [];
    var compressedOpts = [];
    var structureExts = new Map();
    var coordinatesExts = new Map();
    var topologyExts = new Map();
    var volumeExts = new Map();
    for (var _i = 0, _a = plugin.dataFormats.list; _i < _a.length; _i++) {
        var _b = _a[_i], _c = _b.provider, category = _c.category, binaryExtensions = _c.binaryExtensions, stringExtensions = _c.stringExtensions, name_1 = _b.name;
        if (category === TrajectoryFormatCategory) {
            if (binaryExtensions)
                for (var _d = 0, binaryExtensions_1 = binaryExtensions; _d < binaryExtensions_1.length; _d++) {
                    var e = binaryExtensions_1[_d];
                    structureExts.set(e, { format: name_1, isBinary: true });
                }
            if (stringExtensions)
                for (var _e = 0, stringExtensions_1 = stringExtensions; _e < stringExtensions_1.length; _e++) {
                    var e = stringExtensions_1[_e];
                    structureExts.set(e, { format: name_1, isBinary: false });
                }
        }
        else if (category === VolumeFormatCategory) {
            if (binaryExtensions)
                for (var _f = 0, binaryExtensions_2 = binaryExtensions; _f < binaryExtensions_2.length; _f++) {
                    var e = binaryExtensions_2[_f];
                    volumeExts.set(e, { format: name_1, isBinary: true });
                }
            if (stringExtensions)
                for (var _g = 0, stringExtensions_2 = stringExtensions; _g < stringExtensions_2.length; _g++) {
                    var e = stringExtensions_2[_g];
                    volumeExts.set(e, { format: name_1, isBinary: false });
                }
        }
        else if (category === CoordinatesFormatCategory) {
            if (binaryExtensions)
                for (var _h = 0, binaryExtensions_3 = binaryExtensions; _h < binaryExtensions_3.length; _h++) {
                    var e = binaryExtensions_3[_h];
                    coordinatesExts.set(e, { format: name_1, isBinary: true });
                }
            if (stringExtensions)
                for (var _j = 0, stringExtensions_3 = stringExtensions; _j < stringExtensions_3.length; _j++) {
                    var e = stringExtensions_3[_j];
                    coordinatesExts.set(e, { format: name_1, isBinary: false });
                }
        }
        else if (category === TopologyFormatCategory) {
            if (binaryExtensions)
                for (var _k = 0, binaryExtensions_4 = binaryExtensions; _k < binaryExtensions_4.length; _k++) {
                    var e = binaryExtensions_4[_k];
                    topologyExts.set(e, { format: name_1, isBinary: true });
                }
            if (stringExtensions)
                for (var _l = 0, stringExtensions_4 = stringExtensions; _l < stringExtensions_4.length; _l++) {
                    var e = stringExtensions_4[_l];
                    topologyExts.set(e, { format: name_1, isBinary: false });
                }
        }
    }
    for (var _m = 0, files_1 = files; _m < files_1.length; _m++) {
        var file = files_1[_m];
        var label = "".concat(file.key, " (").concat(formatBytes(file.size), ")");
        if (structureExts.has(file.type)) {
            var _o = structureExts.get(file.type), format = _o.format, isBinary = _o.isBinary;
            modelOpts.push(["".concat(file.links.self, "|").concat(format, "|").concat(isBinary), label]);
            topologyOpts.push(["".concat(file.links.self, "|").concat(format, "|").concat(isBinary), label]);
        }
        else if (volumeExts.has(file.type)) {
            var _p = volumeExts.get(file.type), format = _p.format, isBinary = _p.isBinary;
            volumeOpts.push(["".concat(file.links.self, "|").concat(format, "|").concat(isBinary), label]);
        }
        else if (topologyExts.has(file.type)) {
            var _q = topologyExts.get(file.type), format = _q.format, isBinary = _q.isBinary;
            topologyOpts.push(["".concat(file.links.self, "|").concat(format, "|").concat(isBinary), label]);
        }
        else if (coordinatesExts.has(file.type)) {
            var _r = coordinatesExts.get(file.type), format = _r.format, isBinary = _r.isBinary;
            coordinatesOpts.push(["".concat(file.links.self, "|").concat(format, "|").concat(isBinary), label]);
        }
        else if (file.type === 'zip') {
            compressedOpts.push(["".concat(file.links.self, "|").concat(file.type, "|true"), label]);
        }
    }
    var params = {};
    var defaultType = '';
    if (modelOpts.length) {
        defaultType = 'structure';
        params.structure = PD.Select(modelOpts[0][0], modelOpts);
    }
    if (topologyOpts.length && coordinatesOpts.length) {
        if (!defaultType)
            defaultType = 'trajectory';
        params.trajectory = PD.Group({
            topology: PD.Select(topologyOpts[0][0], topologyOpts),
            coordinates: PD.Select(coordinatesOpts[0][0], coordinatesOpts),
        }, { isFlat: true });
    }
    if (volumeOpts.length) {
        if (!defaultType)
            defaultType = 'volume';
        params.volume = PD.Select(volumeOpts[0][0], volumeOpts);
    }
    if (compressedOpts.length) {
        if (!defaultType)
            defaultType = 'compressed';
        params.compressed = PD.Select(compressedOpts[0][0], compressedOpts);
    }
    return {
        type: PD.MappedStatic(defaultType, Object.keys(params).length ? params : { '': PD.EmptyGroup() })
    };
}
var ZenodoImportUI = /** @class */ (function (_super) {
    __extends(ZenodoImportUI, _super);
    function ZenodoImportUI() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.recordParamsOnChange = function (values) {
            _this.setState({ recordValues: values });
        };
        _this.importParamsOnChange = function (values) {
            _this.setState({ importValues: values });
        };
        _this.loadRecord = function () { return __awaiter(_this, void 0, void 0, function () {
            var record, importParams, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.setState({ busy: true });
                        return [4 /*yield*/, this.plugin.runTask(this.plugin.fetch({ url: "https://zenodo.org/api/records/".concat(this.state.recordValues.record), type: 'json' }))];
                    case 1:
                        record = _a.sent();
                        importParams = createImportParams(record.files, this.plugin);
                        this.setState({
                            record: record,
                            files: record.files,
                            busy: false,
                            importValues: PD.getDefaultValues(importParams),
                            importParams: importParams
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.error(e_1);
                        this.plugin.log.error("Failed to load Zenodo record '".concat(this.state.recordValues.record, "'"));
                        this.setState({ busy: false });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        _this.loadFile = function (values) { return __awaiter(_this, void 0, void 0, function () {
            var t, defaultParams, _a, url, format, isBinary, _b, topologyUrl, topologyFormat, topologyIsBinary, _c, coordinatesUrl, coordinatesFormat, _d, url, format, isBinary, _e, url, format, isBinary, e_2;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 9, 10, 11]);
                        this.setState({ busy: true });
                        t = values.type;
                        if (!(t.name === 'structure')) return [3 /*break*/, 2];
                        defaultParams = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
                        _a = t.params.split('|'), url = _a[0], format = _a[1], isBinary = _a[2];
                        return [4 /*yield*/, this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
                                source: {
                                    name: 'url',
                                    params: {
                                        url: url,
                                        format: format,
                                        isBinary: isBinary === 'true',
                                        options: defaultParams.source.params.options,
                                    }
                                }
                            }))];
                    case 1:
                        _f.sent();
                        return [3 /*break*/, 8];
                    case 2:
                        if (!(t.name === 'trajectory')) return [3 /*break*/, 4];
                        _b = t.params.topology.split('|'), topologyUrl = _b[0], topologyFormat = _b[1], topologyIsBinary = _b[2];
                        _c = t.params.coordinates.split('|'), coordinatesUrl = _c[0], coordinatesFormat = _c[1];
                        return [4 /*yield*/, this.plugin.runTask(this.plugin.state.data.applyAction(LoadTrajectory, {
                                source: {
                                    name: 'url',
                                    params: {
                                        model: {
                                            url: topologyUrl,
                                            format: topologyFormat,
                                            isBinary: topologyIsBinary === 'true',
                                        },
                                        coordinates: {
                                            url: coordinatesUrl,
                                            format: coordinatesFormat,
                                        },
                                    }
                                }
                            }))];
                    case 3:
                        _f.sent();
                        return [3 /*break*/, 8];
                    case 4:
                        if (!(t.name === 'volume')) return [3 /*break*/, 6];
                        _d = t.params.split('|'), url = _d[0], format = _d[1], isBinary = _d[2];
                        return [4 /*yield*/, this.plugin.runTask(this.plugin.state.data.applyAction(DownloadDensity, {
                                source: {
                                    name: 'url',
                                    params: {
                                        url: url,
                                        format: format,
                                        isBinary: isBinary === 'true',
                                    }
                                }
                            }))];
                    case 5:
                        _f.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        if (!(t.name === 'compressed')) return [3 /*break*/, 8];
                        _e = t.params.split('|'), url = _e[0], format = _e[1], isBinary = _e[2];
                        return [4 /*yield*/, this.plugin.runTask(this.plugin.state.data.applyAction(DownloadFile, {
                                url: url,
                                format: format,
                                isBinary: isBinary === 'true',
                                visuals: true
                            }))];
                    case 7:
                        _f.sent();
                        _f.label = 8;
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_2 = _f.sent();
                        console.error(e_2);
                        this.plugin.log.error("Failed to load Zenodo file");
                        return [3 /*break*/, 11];
                    case 10:
                        this.setState({ busy: false });
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        }); };
        _this.clearRecord = function () {
            _this.setState({
                importValues: undefined,
                importParams: undefined,
                record: undefined,
                files: undefined
            });
        };
        return _this;
    }
    ZenodoImportUI.prototype.defaultState = function () {
        return {
            header: 'Zenodo Import',
            isCollapsed: true,
            brand: { accent: 'cyan', svg: OpenInBrowserSvg },
            recordValues: PD.getDefaultValues(ZenodoImportParams),
            importValues: undefined,
            importParams: undefined,
            record: undefined,
            files: undefined,
        };
    };
    ZenodoImportUI.prototype.renderLoadRecord = function () {
        return _jsxs("div", { style: { marginBottom: 10 }, children: [_jsx(ParameterControls, { params: ZenodoImportParams, values: this.state.recordValues, onChangeValues: this.recordParamsOnChange, isDisabled: this.state.busy }), _jsx(Button, { onClick: this.loadRecord, style: { marginTop: 1 }, disabled: this.state.busy || !this.state.recordValues.record, children: "Load Record" })] });
    };
    ZenodoImportUI.prototype.renderRecordInfo = function (record) {
        return _jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("div", { className: 'msp-help-text', children: _jsxs("div", { children: ["Record ", "".concat(record.id), ": ", _jsx("i", { children: "".concat(record.metadata.title) })] }) }), _jsx(Button, { onClick: this.clearRecord, style: { marginTop: 1 }, disabled: this.state.busy, children: "Clear" })] });
    };
    ZenodoImportUI.prototype.renderImportFile = function (params, values) {
        var _this = this;
        return values.type.name ? _jsxs("div", { style: { marginBottom: 10 }, children: [_jsx(ParameterControls, { params: params, values: this.state.importValues, onChangeValues: this.importParamsOnChange, isDisabled: this.state.busy }), _jsx(Button, { onClick: function () { return _this.loadFile(values); }, style: { marginTop: 1 }, disabled: this.state.busy, children: "Import File" })] }) : _jsx("div", { className: 'msp-help-text', style: { marginBottom: 10 }, children: _jsx("div", { children: "No supported files" }) });
    };
    ZenodoImportUI.prototype.renderControls = function () {
        return _jsxs(_Fragment, { children: [!this.state.record ? this.renderLoadRecord() : null, this.state.record ? this.renderRecordInfo(this.state.record) : null, this.state.importParams && this.state.importValues ? this.renderImportFile(this.state.importParams, this.state.importValues) : null] });
    };
    return ZenodoImportUI;
}(CollapsableControls));
export { ZenodoImportUI };
