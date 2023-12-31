import { __assign, __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { OrderedMap } from 'immutable';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { PluginState } from '../../mol-plugin/state';
import { shallowEqualObjects } from '../../mol-util';
import { formatTimespan } from '../../mol-util/now';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { urlCombine } from '../../mol-util/url';
import { PluginUIComponent, PurePluginUIComponent } from '../base';
import { Button, ExpandGroup, IconButton, SectionHeader } from '../controls/common';
import { Icon, SaveOutlinedSvg, GetAppSvg, OpenInBrowserSvg, WarningSvg, DeleteOutlinedSvg, AddSvg, ArrowUpwardSvg, SwapHorizSvg, ArrowDownwardSvg, RefreshSvg, CloudUploadSvg } from '../controls/icons';
import { ParameterControls } from '../controls/parameters';
var StateSnapshots = /** @class */ (function (_super) {
    __extends(StateSnapshots, _super);
    function StateSnapshots() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StateSnapshots.prototype.render = function () {
        var _a;
        return _jsxs("div", { children: [_jsx(SectionHeader, { icon: SaveOutlinedSvg, title: 'Plugin State' }), _jsx("div", { style: { marginBottom: '10px' }, children: _jsx(ExpandGroup, { header: 'Save Options', initiallyExpanded: false, children: _jsx(LocalStateSnapshotParams, {}) }) }), _jsx(LocalStateSnapshots, {}), _jsx(LocalStateSnapshotList, {}), _jsx(SectionHeader, { title: 'Save as File', accent: 'blue' }), _jsx(StateExportImportControls, {}), ((_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.remoteState) !== 'none' && _jsx(RemoteStateSnapshots, {})] });
    };
    return StateSnapshots;
}(PluginUIComponent));
export { StateSnapshots };
var StateExportImportControls = /** @class */ (function (_super) {
    __extends(StateExportImportControls, _super);
    function StateExportImportControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.downloadToFileJson = function () {
            var _a, _b;
            (_b = (_a = _this.props).onAction) === null || _b === void 0 ? void 0 : _b.call(_a);
            PluginCommands.State.Snapshots.DownloadToFile(_this.plugin, { type: 'json' });
        };
        _this.downloadToFileZip = function () {
            var _a, _b;
            (_b = (_a = _this.props).onAction) === null || _b === void 0 ? void 0 : _b.call(_a);
            PluginCommands.State.Snapshots.DownloadToFile(_this.plugin, { type: 'zip' });
        };
        _this.open = function (e) {
            var _a, _b;
            if (!e.target.files || !e.target.files[0]) {
                _this.plugin.log.error('No state file selected');
                return;
            }
            (_b = (_a = _this.props).onAction) === null || _b === void 0 ? void 0 : _b.call(_a);
            PluginCommands.State.Snapshots.OpenFile(_this.plugin, { file: e.target.files[0] });
        };
        return _this;
    }
    StateExportImportControls.prototype.render = function () {
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsx(Button, { icon: GetAppSvg, onClick: this.downloadToFileJson, title: 'Save the state description. Input data are loaded using the provided sources. Does not work if local files are used as input.', children: "State" }), _jsx(Button, { icon: GetAppSvg, onClick: this.downloadToFileZip, title: 'Save the state including the input data.', children: "Session" }), _jsxs("div", { className: 'msp-btn msp-btn-block msp-btn-action msp-loader-msp-btn-file', children: [_jsx(Icon, { svg: OpenInBrowserSvg, inline: true }), " Open ", _jsx("input", { onChange: this.open, type: 'file', multiple: false, accept: '.molx,.molj' })] })] }), _jsxs("div", { className: 'msp-help-text', style: { padding: '10px' }, children: [_jsx(Icon, { svg: WarningSvg }), " This is an experimental feature and stored states/sessions might not be openable in a future version."] })] });
    };
    return StateExportImportControls;
}(PluginUIComponent));
export { StateExportImportControls };
var LocalStateSnapshotParams = /** @class */ (function (_super) {
    __extends(LocalStateSnapshotParams, _super);
    function LocalStateSnapshotParams() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocalStateSnapshotParams.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.snapshotParams, function () { return _this.forceUpdate(); });
    };
    LocalStateSnapshotParams.prototype.render = function () {
        return _jsx(ParameterControls, { params: PluginState.SnapshotParams, values: this.plugin.state.snapshotParams.value, onChangeValues: this.plugin.state.setSnapshotParams });
    };
    return LocalStateSnapshotParams;
}(PluginUIComponent));
export { LocalStateSnapshotParams };
export var LocalStateSnapshots = /** @class */ (function (_super) {
    __extends(LocalStateSnapshots, _super);
    function LocalStateSnapshots() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { params: PD.getDefaultValues(LocalStateSnapshots.Params) };
        _this.add = function () {
            PluginCommands.State.Snapshots.Add(_this.plugin, {
                name: _this.state.params.name,
                description: _this.state.params.description
            });
        };
        _this.updateParams = function (params) { return _this.setState({ params: params }); };
        _this.clear = function () {
            PluginCommands.State.Snapshots.Clear(_this.plugin, {});
        };
        return _this;
    }
    LocalStateSnapshots.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        return !shallowEqualObjects(this.props, nextProps) || !shallowEqualObjects(this.state, nextState);
    };
    LocalStateSnapshots.prototype.render = function () {
        return _jsxs("div", { children: [_jsx(ParameterControls, { params: LocalStateSnapshots.Params, values: this.state.params, onEnter: this.add, onChangeValues: this.updateParams }), _jsxs("div", { className: 'msp-flex-row', children: [_jsx(IconButton, { onClick: this.clear, svg: DeleteOutlinedSvg, title: 'Remove All' }), _jsx(Button, { onClick: this.add, icon: AddSvg, style: { textAlign: 'right' }, commit: true, children: "Add" })] })] });
    };
    LocalStateSnapshots.Params = {
        name: PD.Text(),
        description: PD.Text()
    };
    return LocalStateSnapshots;
}(PluginUIComponent));
var LocalStateSnapshotList = /** @class */ (function (_super) {
    __extends(LocalStateSnapshotList, _super);
    function LocalStateSnapshotList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.apply = function (e) {
            var id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            PluginCommands.State.Snapshots.Apply(_this.plugin, { id: id });
        };
        _this.remove = function (e) {
            var id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            PluginCommands.State.Snapshots.Remove(_this.plugin, { id: id });
        };
        _this.moveUp = function (e) {
            var id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            PluginCommands.State.Snapshots.Move(_this.plugin, { id: id, dir: -1 });
        };
        _this.moveDown = function (e) {
            var id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            PluginCommands.State.Snapshots.Move(_this.plugin, { id: id, dir: 1 });
        };
        _this.replace = function (e) {
            // TODO: add option change name/description
            var id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            PluginCommands.State.Snapshots.Replace(_this.plugin, { id: id });
        };
        return _this;
    }
    LocalStateSnapshotList.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.snapshot.events.changed, function () { return _this.forceUpdate(); });
    };
    LocalStateSnapshotList.prototype.render = function () {
        var _this = this;
        var current = this.plugin.managers.snapshot.state.current;
        var items = [];
        this.plugin.managers.snapshot.state.entries.forEach(function (e) {
            var _a;
            items.push(_jsxs("li", { className: 'msp-flex-row', children: [_jsxs(Button, { "data-id": e.snapshot.id, onClick: _this.apply, className: 'msp-no-overflow', children: [_jsx("span", { style: { fontWeight: e.snapshot.id === current ? 'bold' : void 0 }, children: e.name || new Date(e.timestamp).toLocaleString() }), " ", _jsx("small", { children: "".concat(e.snapshot.durationInMs ? formatTimespan(e.snapshot.durationInMs, false) + "".concat(e.description ? ', ' : '') : '').concat(e.description ? e.description : '') })] }), _jsx(IconButton, { svg: ArrowUpwardSvg, "data-id": e.snapshot.id, title: 'Move Up', onClick: _this.moveUp, flex: '20px' }), _jsx(IconButton, { svg: ArrowDownwardSvg, "data-id": e.snapshot.id, title: 'Move Down', onClick: _this.moveDown, flex: '20px' }), _jsx(IconButton, { svg: SwapHorizSvg, "data-id": e.snapshot.id, title: 'Replace', onClick: _this.replace, flex: '20px' }), _jsx(IconButton, { svg: DeleteOutlinedSvg, "data-id": e.snapshot.id, title: 'Remove', onClick: _this.remove, flex: '20px' })] }, e.snapshot.id));
            var image = e.image && ((_a = _this.plugin.managers.asset.get(e.image)) === null || _a === void 0 ? void 0 : _a.file);
            if (image) {
                items.push(_jsx("li", { className: 'msp-state-image-row', children: _jsx(Button, { "data-id": e.snapshot.id, onClick: _this.apply, children: _jsx("img", { draggable: false, src: URL.createObjectURL(image) }) }) }, "".concat(e.snapshot.id, "-image")));
            }
        });
        return _jsx(_Fragment, { children: _jsx("ul", { style: { listStyle: 'none', marginTop: '10px' }, className: 'msp-state-list', children: items }) });
    };
    return LocalStateSnapshotList;
}(PluginUIComponent));
export { LocalStateSnapshotList };
var RemoteStateSnapshots = /** @class */ (function (_super) {
    __extends(RemoteStateSnapshots, _super);
    function RemoteStateSnapshots() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Params = {
            name: PD.Text(),
            options: PD.Group({
                description: PD.Text(),
                playOnLoad: PD.Boolean(false),
                serverUrl: PD.Text(_this.plugin.config.get(PluginConfig.State.CurrentServer))
            })
        };
        _this.state = { params: PD.getDefaultValues(_this.Params), entries: OrderedMap(), isBusy: false };
        _this.ListOnlyParams = {
            options: PD.Group({
                serverUrl: PD.Text(_this.plugin.config.get(PluginConfig.State.CurrentServer))
            }, { isFlat: true })
        };
        _this._mounted = false;
        _this.refresh = function () { return __awaiter(_this, void 0, void 0, function () {
            var json, entries, _i, json_1, e, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.setState({ isBusy: true });
                        this.plugin.config.set(PluginConfig.State.CurrentServer, this.state.params.options.serverUrl);
                        return [4 /*yield*/, this.plugin.runTask(this.plugin.fetch({ url: this.serverUrl('list'), type: 'json' }))];
                    case 1:
                        json = (_a.sent()) || [];
                        json.sort(function (a, b) {
                            if (a.isSticky === b.isSticky)
                                return a.timestamp - b.timestamp;
                            return a.isSticky ? -1 : 1;
                        });
                        entries = OrderedMap().asMutable();
                        for (_i = 0, json_1 = json; _i < json_1.length; _i++) {
                            e = json_1[_i];
                            entries.set(e.id, __assign(__assign({}, e), { url: this.serverUrl("get/".concat(e.id)), removeUrl: this.serverUrl("remove/".concat(e.id)) }));
                        }
                        if (this._mounted)
                            this.setState({ entries: entries.asImmutable(), isBusy: false });
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.error(e_1);
                        this.plugin.log.error('Error fetching remote snapshots');
                        if (this._mounted)
                            this.setState({ entries: OrderedMap(), isBusy: false });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        _this.upload = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setState({ isBusy: true });
                        this.plugin.config.set(PluginConfig.State.CurrentServer, this.state.params.options.serverUrl);
                        return [4 /*yield*/, PluginCommands.State.Snapshots.Upload(this.plugin, {
                                name: this.state.params.name,
                                description: this.state.params.options.description,
                                playOnLoad: this.state.params.options.playOnLoad,
                                serverUrl: this.state.params.options.serverUrl
                            })];
                    case 1:
                        _a.sent();
                        this.plugin.log.message('Snapshot uploaded.');
                        if (this._mounted) {
                            this.setState({ isBusy: false });
                            this.refresh();
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        _this.fetch = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var id, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = e.currentTarget.getAttribute('data-id');
                        if (!id)
                            return [2 /*return*/];
                        entry = this.state.entries.get(id);
                        if (!entry)
                            return [2 /*return*/];
                        this.setState({ isBusy: true });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, PluginCommands.State.Snapshots.Fetch(this.plugin, { url: entry.url })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        if (this._mounted)
                            this.setState({ isBusy: false });
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        _this.remove = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var id, entry, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = e.currentTarget.getAttribute('data-id');
                        if (!id)
                            return [2 /*return*/];
                        entry = this.state.entries.get(id);
                        if (!entry)
                            return [2 /*return*/];
                        this.setState({ entries: this.state.entries.remove(id) });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(entry.removeUrl)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        console.error(e_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        return _this;
    }
    RemoteStateSnapshots.prototype.componentDidMount = function () {
        this.refresh();
        // TODO: solve this by using "PluginComponent" with behaviors intead
        this._mounted = true;
        // this.subscribe(UploadedEvent, this.refresh);
    };
    RemoteStateSnapshots.prototype.componentWillUnmount = function () {
        _super.prototype.componentWillUnmount.call(this);
        this._mounted = false;
    };
    RemoteStateSnapshots.prototype.serverUrl = function (q) {
        if (!q)
            return this.state.params.options.serverUrl;
        return urlCombine(this.state.params.options.serverUrl, q);
    };
    RemoteStateSnapshots.prototype.render = function () {
        var _this = this;
        return _jsxs(_Fragment, { children: [_jsx(SectionHeader, { title: 'Remote States', accent: 'blue' }), !this.props.listOnly && _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: this.Params, values: this.state.params, onEnter: this.upload, onChange: function (p) {
                                var _a;
                                _this.setState({ params: __assign(__assign({}, _this.state.params), (_a = {}, _a[p.name] = p.value, _a)) });
                            }, isDisabled: this.state.isBusy }), _jsxs("div", { className: 'msp-flex-row', children: [_jsx(IconButton, { onClick: this.refresh, disabled: this.state.isBusy, svg: RefreshSvg }), _jsx(Button, { icon: CloudUploadSvg, onClick: this.upload, disabled: this.state.isBusy, commit: true, children: "Upload" })] })] }), _jsx(RemoteStateSnapshotList, { entries: this.state.entries, isBusy: this.state.isBusy, serverUrl: this.state.params.options.serverUrl, fetch: this.fetch, remove: this.props.listOnly ? void 0 : this.remove }), this.props.listOnly && _jsxs("div", { style: { marginTop: '10px' }, children: [_jsx(ParameterControls, { params: this.ListOnlyParams, values: this.state.params, onEnter: this.upload, onChange: function (p) {
                                var _a;
                                _this.setState({ params: __assign(__assign({}, _this.state.params), (_a = {}, _a[p.name] = p.value, _a)) });
                            }, isDisabled: this.state.isBusy }), _jsx("div", { className: 'msp-flex-row', children: _jsx(Button, { onClick: this.refresh, disabled: this.state.isBusy, icon: RefreshSvg, children: "Refresh" }) })] })] });
    };
    return RemoteStateSnapshots;
}(PluginUIComponent));
export { RemoteStateSnapshots };
var RemoteStateSnapshotList = /** @class */ (function (_super) {
    __extends(RemoteStateSnapshotList, _super);
    function RemoteStateSnapshotList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.open = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var id, entry, url, qi;
            return __generator(this, function (_a) {
                id = e.currentTarget.getAttribute('data-id');
                if (!id)
                    return [2 /*return*/];
                entry = this.props.entries.get(id);
                if (!entry)
                    return [2 /*return*/];
                e.preventDefault();
                url = "".concat(window.location);
                qi = url.indexOf('?');
                if (qi > 0)
                    url = url.substr(0, qi);
                window.open("".concat(url, "?snapshot-url=").concat(encodeURIComponent(entry.url)), '_blank');
                return [2 /*return*/];
            });
        }); };
        return _this;
    }
    RemoteStateSnapshotList.prototype.render = function () {
        var _this = this;
        return _jsx("ul", { style: { listStyle: 'none', marginTop: '10px' }, className: 'msp-state-list', children: this.props.entries.valueSeq().map(function (e) { return _jsxs("li", { className: 'msp-flex-row', children: [_jsxs(Button, { "data-id": e.id, onClick: _this.props.fetch, disabled: _this.props.isBusy, onContextMenu: _this.open, title: 'Click to download, right-click to open in a new tab.', children: [e.name || new Date(e.timestamp).toLocaleString(), " ", _jsx("small", { children: e.description })] }), !e.isSticky && _this.props.remove && _jsx(IconButton, { svg: DeleteOutlinedSvg, "data-id": e.id, title: 'Remove', onClick: _this.props.remove, disabled: _this.props.isBusy, small: true })] }, e.id); }) });
    };
    return RemoteStateSnapshotList;
}(PurePluginUIComponent));
