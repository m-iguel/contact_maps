import { __assign, __awaiter, __extends, __generator, __spreadArray } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { StructureHierarchyManager } from '../../mol-plugin-state/manager/structure/hierarchy';
import { VolumeHierarchyManager } from '../../mol-plugin-state/manager/volume/hierarchy';
import { FocusLoci } from '../../mol-plugin/behavior/dynamic/representation';
import { VolumeStreaming } from '../../mol-plugin/behavior/dynamic/volume-streaming/behavior';
import { InitVolumeStreaming } from '../../mol-plugin/behavior/dynamic/volume-streaming/transformers';
import { State, StateSelection, StateTransform } from '../../mol-state';
import { CollapsableControls, PurePluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, ControlGroup, ExpandGroup, IconButton } from '../controls/common';
import { ApplyActionControl } from '../state/apply-action';
import { UpdateTransformControl } from '../state/update-transform';
import { BindingsHelp } from '../viewport/help';
import { PluginCommands } from '../../mol-plugin/commands';
import { BlurOnSvg, ErrorSvg, CheckSvg, AddSvg, VisibilityOffOutlinedSvg, VisibilityOutlinedSvg, DeleteOutlinedSvg, MoreHorizSvg, CloseSvg } from '../controls/icons';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { createVolumeRepresentationParams } from '../../mol-plugin-state/helpers/volume-representation-params';
import { Color } from '../../mol-util/color';
import { ParamDefinition } from '../../mol-util/param-definition';
import { CombinedColorControl } from '../controls/color';
var VolumeStreamingControls = /** @class */ (function (_super) {
    __extends(VolumeStreamingControls, _super);
    function VolumeStreamingControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VolumeStreamingControls.prototype.defaultState = function () {
        return {
            header: 'Volume Streaming',
            isCollapsed: false,
            isBusy: false,
            isHidden: true,
            brand: { accent: 'cyan', svg: BlurOnSvg }
        };
    };
    VolumeStreamingControls.prototype.componentDidMount = function () {
        var _this = this;
        // TODO: do not hide this but instead show some help text??
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, function () {
            _this.setState({
                isHidden: !_this.canEnable(),
                description: StructureHierarchyManager.getSelectedStructuresDescription(_this.plugin)
            });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, function (e) {
            if (StateTransform.hasTag(e.cell.transform, VolumeStreaming.RootTag))
                _this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (v) {
            _this.setState({ isBusy: v });
        });
    };
    Object.defineProperty(VolumeStreamingControls.prototype, "pivot", {
        get: function () {
            return this.plugin.managers.structure.hierarchy.selection.structures[0];
        },
        enumerable: false,
        configurable: true
    });
    VolumeStreamingControls.prototype.canEnable = function () {
        var _a, _b;
        var selection = this.plugin.managers.structure.hierarchy.selection;
        if (selection.structures.length !== 1)
            return false;
        var pivot = this.pivot.cell;
        if (!pivot.obj)
            return false;
        return !!((_b = (_a = InitVolumeStreaming.definition).isApplicable) === null || _b === void 0 ? void 0 : _b.call(_a, pivot.obj, pivot.transform, this.plugin));
    };
    VolumeStreamingControls.prototype.renderEnable = function () {
        var _a, _b;
        var pivot = this.pivot;
        if (!pivot.cell.parent)
            return null;
        var root = StateSelection.findTagInSubtree(pivot.cell.parent.tree, this.pivot.cell.transform.ref, VolumeStreaming.RootTag);
        var rootCell = root && pivot.cell.parent.cells.get(root);
        var simpleApply = rootCell && rootCell.status === 'error'
            ? { header: !!rootCell.errorText && ((_a = rootCell.errorText) === null || _a === void 0 ? void 0 : _a.includes('404')) ? 'No Density Data Available' : 'Error Enabling', icon: ErrorSvg, title: rootCell.errorText }
            : rootCell && ((_b = rootCell.obj) === null || _b === void 0 ? void 0 : _b.data.entries.length) === 0
                ? { header: 'Error Enabling', icon: ErrorSvg, title: 'No Entry for Streaming Found' }
                : { header: 'Enable', icon: CheckSvg, title: 'Enable' };
        return _jsx(ApplyActionControl, { state: pivot.cell.parent, action: InitVolumeStreaming, initiallyCollapsed: true, nodeRef: pivot.cell.transform.ref, simpleApply: simpleApply });
    };
    VolumeStreamingControls.prototype.renderParams = function () {
        var _a, _b, _c, _d, _e;
        var pivot = this.pivot;
        if (!pivot.cell.parent)
            return null;
        var bindings = ((_b = (_a = pivot.volumeStreaming) === null || _a === void 0 ? void 0 : _a.cell.transform.params) === null || _b === void 0 ? void 0 : _b.entry.params.view.name) === 'selection-box' && ((_e = (_d = (_c = this.plugin.state.behaviors.cells.get(FocusLoci.id)) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.values) === null || _e === void 0 ? void 0 : _e.bindings);
        return _jsxs(_Fragment, { children: [_jsx(UpdateTransformControl, { state: pivot.cell.parent, transform: pivot.volumeStreaming.cell.transform, customHeader: 'none', noMargin: true }), bindings && _jsx(ExpandGroup, { header: 'Controls Help', children: _jsx(BindingsHelp, { bindings: bindings }) })] });
    };
    VolumeStreamingControls.prototype.renderControls = function () {
        var pivot = this.pivot;
        if (!pivot)
            return null;
        if (!pivot.volumeStreaming)
            return this.renderEnable();
        return this.renderParams();
    };
    return VolumeStreamingControls;
}(CollapsableControls));
export { VolumeStreamingControls };
var VolumeSourceControls = /** @class */ (function (_super) {
    __extends(VolumeSourceControls, _super);
    function VolumeSourceControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.item = function (ref) {
            var _a;
            var selected = _this.plugin.managers.volume.hierarchy.selection;
            var label = ((_a = ref.cell.obj) === null || _a === void 0 ? void 0 : _a.label) || 'Volume';
            var item = {
                kind: 'item',
                label: (ref.kind === 'lazy-volume' ? 'Load ' : '') + (label || ref.kind),
                selected: selected === ref,
                value: ref
            };
            return item;
        };
        _this.selectCurrent = function (item) {
            _this.toggleHierarchy();
            if (!item)
                return;
            var current = item.value;
            if (current.kind === 'volume') {
                _this.plugin.managers.volume.hierarchy.setCurrent(current);
            }
            else {
                _this.lazyLoad(current.cell);
            }
        };
        _this.selectAdd = function (item) {
            if (!item)
                return;
            _this.setState({ show: void 0 });
            item.value();
        };
        _this.toggleHierarchy = function () { return _this.setState({ show: _this.state.show !== 'hierarchy' ? 'hierarchy' : void 0 }); };
        _this.toggleAddRepr = function () { return _this.setState({ show: _this.state.show !== 'add-repr' ? 'add-repr' : void 0 }); };
        return _this;
    }
    VolumeSourceControls.prototype.defaultState = function () {
        return {
            header: 'Volume',
            isCollapsed: false,
            isBusy: false,
            isHidden: true,
            brand: { accent: 'purple', svg: BlurOnSvg }
        };
    };
    VolumeSourceControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.volume.hierarchy.behaviors.selection, function (sel) {
            _this.setState({ isHidden: sel.hierarchy.volumes.length === 0 && sel.hierarchy.lazyVolumes.length === 0 });
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (v) {
            _this.setState({ isBusy: v });
        });
    };
    Object.defineProperty(VolumeSourceControls.prototype, "hierarchyItems", {
        get: function () {
            var mng = this.plugin.managers.volume.hierarchy;
            var current = mng.current;
            var ret = [];
            for (var _i = 0, _a = current.volumes; _i < _a.length; _i++) {
                var ref = _a[_i];
                ret.push(this.item(ref));
            }
            for (var _b = 0, _c = current.lazyVolumes; _b < _c.length; _b++) {
                var ref = _c[_b];
                ret.push(this.item(ref));
            }
            return ret;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VolumeSourceControls.prototype, "addActions", {
        get: function () {
            var mng = this.plugin.managers.volume.hierarchy;
            var current = mng.selection;
            var ret = __spreadArray([], VolumeHierarchyManager.getRepresentationTypes(this.plugin, current)
                .map(function (t) { return ActionMenu.Item(t[1], function () { return mng.addRepresentation(current, t[0]); }); }), true);
            return ret;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VolumeSourceControls.prototype, "isEmpty", {
        get: function () {
            var _a = this.plugin.managers.volume.hierarchy.current, volumes = _a.volumes, lazyVolumes = _a.lazyVolumes;
            return volumes.length === 0 && lazyVolumes.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VolumeSourceControls.prototype, "label", {
        get: function () {
            var _a;
            if (this.state.loadingLabel)
                return "Loading ".concat(this.state.loadingLabel, "...");
            var selected = this.plugin.managers.volume.hierarchy.selection;
            if (!selected)
                return 'Nothing Selected';
            return ((_a = selected === null || selected === void 0 ? void 0 : selected.cell.obj) === null || _a === void 0 ? void 0 : _a.label) || 'Volume';
        },
        enumerable: false,
        configurable: true
    });
    VolumeSourceControls.prototype.lazyLoad = function (cell) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, url, isBinary, format, entryId, isovalues, plugin_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = cell.obj.data, url = _a.url, isBinary = _a.isBinary, format = _a.format, entryId = _a.entryId, isovalues = _a.isovalues;
                        this.setState({ isBusy: true, loadingLabel: cell.obj.label });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, , 3, 4]);
                        plugin_1 = this.plugin;
                        return [4 /*yield*/, plugin_1.dataTransaction(function () { return __awaiter(_this, void 0, void 0, function () {
                                var data, parsed, firstVolume, repr, _i, isovalues_1, iso;
                                var _a, _b, _c, _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0: return [4 /*yield*/, plugin_1.builders.data.download({ url: url, isBinary: isBinary }, { state: { isGhost: true } })];
                                        case 1:
                                            data = _e.sent();
                                            return [4 /*yield*/, plugin_1.dataFormats.get(format).parse(plugin_1, data, { entryId: entryId })];
                                        case 2:
                                            parsed = _e.sent();
                                            firstVolume = (parsed.volume || parsed.volumes[0]);
                                            if (!(firstVolume === null || firstVolume === void 0 ? void 0 : firstVolume.isOk))
                                                throw new Error('Failed to parse any volume.');
                                            repr = plugin_1.build();
                                            for (_i = 0, isovalues_1 = isovalues; _i < isovalues_1.length; _i++) {
                                                iso = isovalues_1[_i];
                                                repr
                                                    .to((_c = (_a = parsed.volumes) === null || _a === void 0 ? void 0 : _a[(_b = iso.volumeIndex) !== null && _b !== void 0 ? _b : 0]) !== null && _c !== void 0 ? _c : parsed.volume)
                                                    .apply(StateTransforms.Representation.VolumeRepresentation3D, createVolumeRepresentationParams(this.plugin, firstVolume.data, {
                                                    type: 'isosurface',
                                                    typeParams: { alpha: (_d = iso.alpha) !== null && _d !== void 0 ? _d : 1, isoValue: iso.type === 'absolute' ? { kind: 'absolute', absoluteValue: iso.value } : { kind: 'relative', relativeValue: iso.value } },
                                                    color: 'uniform',
                                                    colorParams: { value: iso.color }
                                                }));
                                            }
                                            return [4 /*yield*/, repr.commit()];
                                        case 3:
                                            _e.sent();
                                            return [4 /*yield*/, plugin_1.build().delete(cell).commit()];
                                        case 4:
                                            _e.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.setState({ isBusy: false, loadingLabel: void 0 });
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VolumeSourceControls.prototype.renderControls = function () {
        var disabled = this.state.isBusy || this.isEmpty;
        var label = this.label;
        var selected = this.plugin.managers.volume.hierarchy.selection;
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', style: { marginTop: '1px' }, children: [_jsx(Button, { noOverflow: true, flex: true, onClick: this.toggleHierarchy, disabled: disabled, title: label, children: label }), !this.isEmpty && selected && _jsx(IconButton, { svg: AddSvg, onClick: this.toggleAddRepr, title: 'Apply a structure presets to the current hierarchy.', toggleState: this.state.show === 'add-repr', disabled: disabled })] }), this.state.show === 'hierarchy' && _jsx(ActionMenu, { items: this.hierarchyItems, onSelect: this.selectCurrent }), this.state.show === 'add-repr' && _jsx(ActionMenu, { items: this.addActions, onSelect: this.selectAdd }), selected && selected.representations.length > 0 && _jsx("div", { style: { marginTop: '6px' }, children: selected.representations.map(function (r) { return _jsx(VolumeRepresentationControls, { representation: r }, r.cell.transform.ref); }) })] });
    };
    return VolumeSourceControls;
}(CollapsableControls));
export { VolumeSourceControls };
var VolumeRepresentationControls = /** @class */ (function (_super) {
    __extends(VolumeRepresentationControls, _super);
    function VolumeRepresentationControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { action: void 0 };
        _this.remove = function () { return _this.plugin.managers.volume.hierarchy.remove([_this.props.representation], true); };
        _this.toggleVisible = function (e) {
            e.preventDefault();
            e.currentTarget.blur();
            _this.plugin.managers.volume.hierarchy.toggleVisibility([_this.props.representation]);
        };
        _this.toggleColor = function () {
            _this.setState({ action: _this.state.action === 'select-color' ? undefined : 'select-color' });
        };
        _this.toggleUpdate = function () { return _this.setState({ action: _this.state.action === 'update' ? void 0 : 'update' }); };
        _this.highlight = function (e) {
            e.preventDefault();
            if (!_this.props.representation.cell.parent)
                return;
            PluginCommands.Interactivity.Object.Highlight(_this.plugin, { state: _this.props.representation.cell.parent, ref: _this.props.representation.cell.transform.ref });
        };
        _this.clearHighlight = function (e) {
            e.preventDefault();
            PluginCommands.Interactivity.ClearHighlights(_this.plugin);
        };
        _this.focus = function () {
            var _a;
            var repr = _this.props.representation;
            var lociList = (_a = repr.cell.obj) === null || _a === void 0 ? void 0 : _a.data.repr.getAllLoci();
            if (repr.cell.state.isHidden)
                _this.plugin.managers.volume.hierarchy.toggleVisibility([_this.props.representation], 'show');
            if (lociList)
                _this.plugin.managers.camera.focusLoci(lociList, { extraRadius: 1 });
        };
        _this.updateColor = function (_a) {
            var value = _a.value;
            var t = _this.props.representation.cell.transform;
            return _this.plugin.build().to(t.ref).update(__assign(__assign({}, t.params), { colorTheme: {
                    name: 'uniform',
                    params: { value: value }
                } })).commit();
        };
        return _this;
    }
    VolumeRepresentationControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.events.cell.stateUpdated, function (e) {
            if (State.ObjectEvent.isCell(e, _this.props.representation.cell))
                _this.forceUpdate();
        });
    };
    Object.defineProperty(VolumeRepresentationControls.prototype, "color", {
        get: function () {
            var _a, _b;
            var repr = this.props.representation.cell;
            var isUniform = ((_a = repr.transform.params) === null || _a === void 0 ? void 0 : _a.colorTheme.name) === 'uniform';
            if (!isUniform)
                return void 0;
            return (_b = repr.transform.params) === null || _b === void 0 ? void 0 : _b.colorTheme.params.value;
        },
        enumerable: false,
        configurable: true
    });
    VolumeRepresentationControls.prototype.render = function () {
        var _a, _b, _c;
        var repr = this.props.representation.cell;
        var color = this.color;
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [color !== void 0 && _jsx(Button, { style: { backgroundColor: Color.toStyle(color), minWidth: 32, width: 32 }, onClick: this.toggleColor }), _jsxs(Button, { noOverflow: true, className: 'msp-control-button-label', title: "".concat((_a = repr.obj) === null || _a === void 0 ? void 0 : _a.label, ". Click to focus."), onClick: this.focus, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: { textAlign: 'left' }, children: [(_b = repr.obj) === null || _b === void 0 ? void 0 : _b.label, _jsx("small", { className: 'msp-25-lower-contrast-text', style: { float: 'right' }, children: (_c = repr.obj) === null || _c === void 0 ? void 0 : _c.description })] }), _jsx(IconButton, { svg: repr.state.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, onClick: this.toggleVisible, title: "".concat(repr.state.isHidden ? 'Show' : 'Hide', " component"), small: true, className: 'msp-form-control', flex: true }), _jsx(IconButton, { svg: DeleteOutlinedSvg, onClick: this.remove, title: 'Remove', small: true }), _jsx(IconButton, { svg: MoreHorizSvg, onClick: this.toggleUpdate, title: 'Actions', toggleState: this.state.action === 'update' })] }), this.state.action === 'update' && !!repr.parent && _jsx("div", { style: { marginBottom: '6px' }, className: 'msp-accent-offset', children: _jsx(UpdateTransformControl, { state: repr.parent, transform: repr.transform, customHeader: 'none', noMargin: true }) }), this.state.action === 'select-color' && color !== void 0 && _jsx("div", { style: { marginBottom: '6px', marginTop: 1 }, className: 'msp-accent-offset', children: _jsx(ControlGroup, { header: 'Select Color', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleColor, topRightIcon: CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: _jsx(CombinedColorControl, { param: VolumeColorParam, value: this.color, onChange: this.updateColor, name: 'color', hideNameRow: true }) }) })] });
    };
    return VolumeRepresentationControls;
}(PurePluginUIComponent));
var VolumeColorParam = ParamDefinition.Color(Color(0x121212));
