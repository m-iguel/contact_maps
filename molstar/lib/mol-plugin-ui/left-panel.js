import { __assign, __extends } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { throttleTime } from 'rxjs';
import { Canvas3DParams } from '../mol-canvas3d/canvas3d';
import { PluginCommands } from '../mol-plugin/commands';
import { StateTransform } from '../mol-state';
import { PluginUIComponent } from './base';
import { IconButton, SectionHeader } from './controls/common';
import { AccountTreeOutlinedSvg, DeleteOutlinedSvg, HelpOutlineSvg, HomeOutlinedSvg, SaveOutlinedSvg, TuneSvg } from './controls/icons';
import { ParameterControls } from './controls/parameters';
import { StateObjectActions } from './state/actions';
import { RemoteStateSnapshots, StateSnapshots } from './state/snapshots';
import { StateTree } from './state/tree';
import { HelpContent } from './viewport/help';
var CustomImportControls = /** @class */ (function (_super) {
    __extends(CustomImportControls, _super);
    function CustomImportControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CustomImportControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.behaviors.events.changed, function () { return _this.forceUpdate(); });
    };
    CustomImportControls.prototype.render = function () {
        var _this = this;
        var controls = [];
        this.plugin.customImportControls.forEach(function (Controls, key) {
            controls.push(_jsx(Controls, { initiallyCollapsed: _this.props.initiallyCollapsed }, key));
        });
        return controls.length > 0 ? _jsx(_Fragment, { children: controls }) : null;
    };
    return CustomImportControls;
}(PluginUIComponent));
export { CustomImportControls };
var LeftPanelControls = /** @class */ (function (_super) {
    __extends(LeftPanelControls, _super);
    function LeftPanelControls() {
        var _this = this;
        var _a;
        _this = _super.apply(this, arguments) || this;
        _this.state = { tab: _this.plugin.behaviors.layout.leftPanelTabName.value };
        _this.set = function (tab) {
            if (_this.state.tab === tab) {
                _this.setState({ tab: 'none' }, function () { return _this.plugin.behaviors.layout.leftPanelTabName.next('none'); });
                PluginCommands.Layout.Update(_this.plugin, { state: { regionState: __assign(__assign({}, _this.plugin.layout.state.regionState), { left: 'collapsed' }) } });
                return;
            }
            _this.setState({ tab: tab }, function () { return _this.plugin.behaviors.layout.leftPanelTabName.next(tab); });
            if (_this.plugin.layout.state.regionState.left !== 'full') {
                PluginCommands.Layout.Update(_this.plugin, { state: { regionState: __assign(__assign({}, _this.plugin.layout.state.regionState), { left: 'full' }) } });
            }
        };
        _this.tabs = {
            'none': _jsx(_Fragment, {}),
            'root': _jsxs(_Fragment, { children: [_jsx(SectionHeader, { icon: HomeOutlinedSvg, title: 'Home' }), _jsx(StateObjectActions, { state: _this.plugin.state.data, nodeRef: StateTransform.RootRef, hideHeader: true, initiallyCollapsed: true, alwaysExpandFirst: true }), _jsx(CustomImportControls, {}), ((_a = _this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.remoteState) !== 'none' && _jsx(RemoteStateSnapshots, { listOnly: true })] }),
            'data': _jsxs(_Fragment, { children: [_jsx(SectionHeader, { icon: AccountTreeOutlinedSvg, title: _jsxs(_Fragment, { children: [_jsx(RemoveAllButton, {}), " State Tree"] }) }), _jsx(StateTree, { state: _this.plugin.state.data })] }),
            'states': _jsx(StateSnapshots, {}),
            'settings': _jsxs(_Fragment, { children: [_jsx(SectionHeader, { icon: TuneSvg, title: 'Plugin Settings' }), _jsx(FullSettings, {})] }),
            'help': _jsxs(_Fragment, { children: [_jsx(SectionHeader, { icon: HelpOutlineSvg, title: 'Help' }), _jsx(HelpContent, {})] })
        };
        return _this;
    }
    LeftPanelControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.behaviors.layout.leftPanelTabName, function (tab) {
            if (_this.state.tab !== tab)
                _this.setState({ tab: tab });
            if (tab === 'none' && _this.plugin.layout.state.regionState.left !== 'collapsed') {
                PluginCommands.Layout.Update(_this.plugin, { state: { regionState: __assign(__assign({}, _this.plugin.layout.state.regionState), { left: 'collapsed' }) } });
            }
        });
        this.subscribe(this.plugin.state.data.events.changed, function (_a) {
            var state = _a.state;
            if (_this.state.tab !== 'data')
                return;
            if (state.cells.size === 1)
                _this.set('root');
        });
    };
    LeftPanelControls.prototype.render = function () {
        var _this = this;
        var tab = this.state.tab;
        return _jsxs("div", { className: 'msp-left-panel-controls', children: [_jsxs("div", { className: 'msp-left-panel-controls-buttons', children: [_jsx(IconButton, { svg: HomeOutlinedSvg, toggleState: tab === 'root', transparent: true, onClick: function () { return _this.set('root'); }, title: 'Home' }), _jsx(DataIcon, { set: this.set }), _jsx(IconButton, { svg: SaveOutlinedSvg, toggleState: tab === 'states', transparent: true, onClick: function () { return _this.set('states'); }, title: 'Plugin State' }), _jsx(IconButton, { svg: HelpOutlineSvg, toggleState: tab === 'help', transparent: true, onClick: function () { return _this.set('help'); }, title: 'Help' }), _jsx("div", { className: 'msp-left-panel-controls-buttons-bottom', children: _jsx(IconButton, { svg: TuneSvg, toggleState: tab === 'settings', transparent: true, onClick: function () { return _this.set('settings'); }, title: 'Settings' }) })] }), _jsx("div", { className: 'msp-scrollable-container', children: this.tabs[tab] })] });
    };
    return LeftPanelControls;
}(PluginUIComponent));
export { LeftPanelControls };
var DataIcon = /** @class */ (function (_super) {
    __extends(DataIcon, _super);
    function DataIcon() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { changed: false };
        return _this;
    }
    Object.defineProperty(DataIcon.prototype, "tab", {
        get: function () {
            return this.plugin.behaviors.layout.leftPanelTabName.value;
        },
        enumerable: false,
        configurable: true
    });
    DataIcon.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.behaviors.layout.leftPanelTabName, function (tab) {
            if (_this.tab === 'data')
                _this.setState({ changed: false });
            else
                _this.forceUpdate();
        });
        this.subscribe(this.plugin.state.data.events.changed, function (state) {
            if (_this.tab !== 'data')
                _this.setState({ changed: true });
        });
    };
    DataIcon.prototype.render = function () {
        var _this = this;
        return _jsx(IconButton, { svg: AccountTreeOutlinedSvg, toggleState: this.tab === 'data', transparent: true, onClick: function () { return _this.props.set('data'); }, title: 'State Tree', style: { position: 'relative' }, extraContent: this.state.changed ? _jsx("div", { className: 'msp-left-panel-controls-button-data-dirty' }) : void 0 });
    };
    return DataIcon;
}(PluginUIComponent));
var FullSettings = /** @class */ (function (_super) {
    __extends(FullSettings, _super);
    function FullSettings() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.setSettings = function (p) {
            var _a;
            PluginCommands.Canvas3D.SetSettings(_this.plugin, { settings: (_a = {}, _a[p.name] = p.value, _a) });
        };
        return _this;
    }
    FullSettings.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, function () { return _this.forceUpdate(); });
        this.subscribe(this.plugin.layout.events.updated, function () { return _this.forceUpdate(); });
        if (this.plugin.canvas3d) {
            this.subscribe(this.plugin.canvas3d.camera.stateChanged.pipe(throttleTime(500, undefined, { leading: true, trailing: true })), function (state) {
                if (state.radiusMax !== undefined || state.radius !== undefined) {
                    _this.forceUpdate();
                }
            });
        }
    };
    FullSettings.prototype.render = function () {
        return _jsxs(_Fragment, { children: [this.plugin.canvas3d && _jsxs(_Fragment, { children: [_jsx(SectionHeader, { title: 'Viewport' }), _jsx(ParameterControls, { params: Canvas3DParams, values: this.plugin.canvas3d.props, onChange: this.setSettings })] }), _jsx(SectionHeader, { title: 'Behavior' }), _jsx(StateTree, { state: this.plugin.state.behaviors })] });
    };
    return FullSettings;
}(PluginUIComponent));
var RemoveAllButton = /** @class */ (function (_super) {
    __extends(RemoveAllButton, _super);
    function RemoveAllButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.remove = function (e) {
            e.preventDefault();
            PluginCommands.State.RemoveObject(_this.plugin, { state: _this.plugin.state.data, ref: StateTransform.RootRef });
        };
        return _this;
    }
    RemoveAllButton.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.events.cell.created, function (e) {
            if (e.cell.transform.parent === StateTransform.RootRef)
                _this.forceUpdate();
        });
        this.subscribe(this.plugin.state.events.cell.removed, function (e) {
            if (e.parent === StateTransform.RootRef)
                _this.forceUpdate();
        });
    };
    RemoveAllButton.prototype.render = function () {
        var count = this.plugin.state.data.tree.children.get(StateTransform.RootRef).size;
        if (count === 0)
            return null;
        return _jsx(IconButton, { svg: DeleteOutlinedSvg, onClick: this.remove, title: 'Remove All', style: { display: 'inline-block' }, small: true, className: 'msp-no-hover-outline', transparent: true });
    };
    return RemoveAllButton;
}(PluginUIComponent));
