import { __assign, __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { throttleTime } from 'rxjs';
import { PluginCommands } from '../mol-plugin/commands';
import { PluginConfig } from '../mol-plugin/config';
import { PluginUIComponent } from './base';
import { Button, ControlGroup, IconButton } from './controls/common';
import { AutorenewSvg, BuildOutlinedSvg, CameraOutlinedSvg, CloseSvg, FullscreenSvg, TuneSvg } from './controls/icons';
import { ToggleSelectionModeButton } from './structure/selection';
import { ViewportCanvas } from './viewport/canvas';
import { DownloadScreenshotControls } from './viewport/screenshot';
import { SimpleSettingsControl } from './viewport/simple-settings';
var ViewportControls = /** @class */ (function (_super) {
    __extends(ViewportControls, _super);
    function ViewportControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allCollapsedState = {
            isSettingsExpanded: false,
            isScreenshotExpanded: false,
        };
        _this.state = __assign(__assign({}, _this.allCollapsedState), { isCameraResetEnabled: true });
        _this.resetCamera = function () {
            PluginCommands.Camera.Reset(_this.plugin, {});
        };
        _this.toggleSettingsExpanded = _this.toggle('isSettingsExpanded');
        _this.toggleScreenshotExpanded = _this.toggle('isScreenshotExpanded');
        _this.toggleControls = function () {
            PluginCommands.Layout.Update(_this.plugin, { state: { showControls: !_this.plugin.layout.state.showControls } });
        };
        _this.toggleExpanded = function () {
            PluginCommands.Layout.Update(_this.plugin, { state: { isExpanded: !_this.plugin.layout.state.isExpanded } });
        };
        _this.setSettings = function (p) {
            var _a;
            PluginCommands.Canvas3D.SetSettings(_this.plugin, { settings: (_a = {}, _a[p.name] = p.value, _a) });
        };
        _this.setLayout = function (p) {
            var _a;
            PluginCommands.Layout.Update(_this.plugin, { state: (_a = {}, _a[p.name] = p.value, _a) });
        };
        _this.screenshot = function () {
            var _a;
            (_a = _this.plugin.helpers.viewportScreenshot) === null || _a === void 0 ? void 0 : _a.download();
        };
        _this.enableCameraReset = function (enable) {
            _this.setState(function (old) { return (__assign(__assign({}, old), { isCameraResetEnabled: enable })); });
        };
        return _this;
    }
    ViewportControls.prototype.toggle = function (panel) {
        var _this = this;
        return function (e) {
            _this.setState(function (old) {
                var _a;
                return (__assign(__assign(__assign({}, old), _this.allCollapsedState), (_a = {}, _a[panel] = !_this.state[panel], _a)));
            });
            e === null || e === void 0 ? void 0 : e.currentTarget.blur();
        };
    };
    ViewportControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, function () { return _this.forceUpdate(); });
        this.subscribe(this.plugin.layout.events.updated, function () { return _this.forceUpdate(); });
        if (this.plugin.canvas3d) {
            this.subscribe(this.plugin.canvas3d.camera.stateChanged.pipe(throttleTime(500, undefined, { leading: true, trailing: true })), function (snapshot) { return _this.enableCameraReset(snapshot.radius !== 0 && snapshot.radiusMax !== 0); });
        }
    };
    ViewportControls.prototype.icon = function (icon, onClick, title, isOn) {
        if (isOn === void 0) { isOn = true; }
        return _jsx(IconButton, { svg: icon, toggleState: isOn, onClick: onClick, title: title, style: { background: 'transparent' } });
    };
    ViewportControls.prototype.render = function () {
        var _this = this;
        return _jsxs("div", { className: 'msp-viewport-controls', children: [_jsxs("div", { className: 'msp-viewport-controls-buttons', children: [_jsxs("div", { className: 'msp-hover-box-wrapper', children: [_jsx("div", { className: 'msp-semi-transparent-background' }), this.icon(AutorenewSvg, this.resetCamera, 'Reset Zoom'), _jsx("div", { className: 'msp-hover-box-body', children: _jsxs("div", { className: 'msp-flex-column', children: [_jsx("div", { className: 'msp-flex-row', children: _jsx(Button, { onClick: function () { return _this.resetCamera(); }, disabled: !this.state.isCameraResetEnabled, title: 'Set camera zoom to fit the visible scene into view', children: "Reset Zoom" }) }), _jsx("div", { className: 'msp-flex-row', children: _jsx(Button, { onClick: function () { return PluginCommands.Camera.OrientAxes(_this.plugin); }, disabled: !this.state.isCameraResetEnabled, title: 'Align principal component axes of the loaded structures to the screen axes (\u201Clay flat\u201D)', children: "Orient Axes" }) }), _jsx("div", { className: 'msp-flex-row', children: _jsx(Button, { onClick: function () { return PluginCommands.Camera.ResetAxes(_this.plugin); }, disabled: !this.state.isCameraResetEnabled, title: 'Align Cartesian axes to the screen axes', children: "Reset Axes" }) })] }) }), _jsx("div", { className: 'msp-hover-box-spacer' })] }), _jsxs("div", { children: [_jsx("div", { className: 'msp-semi-transparent-background' }), this.icon(CameraOutlinedSvg, this.toggleScreenshotExpanded, 'Screenshot / State Snapshot', this.state.isScreenshotExpanded)] }), _jsxs("div", { children: [_jsx("div", { className: 'msp-semi-transparent-background' }), this.plugin.config.get(PluginConfig.Viewport.ShowControls) && this.icon(BuildOutlinedSvg, this.toggleControls, 'Toggle Controls Panel', this.plugin.layout.state.showControls), this.plugin.config.get(PluginConfig.Viewport.ShowExpand) && this.icon(FullscreenSvg, this.toggleExpanded, 'Toggle Expanded Viewport', this.plugin.layout.state.isExpanded), this.plugin.config.get(PluginConfig.Viewport.ShowSettings) && this.icon(TuneSvg, this.toggleSettingsExpanded, 'Settings / Controls Info', this.state.isSettingsExpanded)] }), this.plugin.config.get(PluginConfig.Viewport.ShowSelectionMode) && _jsxs("div", { children: [_jsx("div", { className: 'msp-semi-transparent-background' }), _jsx(ToggleSelectionModeButton, {})] })] }), this.state.isScreenshotExpanded && _jsx("div", { className: 'msp-viewport-controls-panel', children: _jsx(ControlGroup, { header: 'Screenshot / State', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleScreenshotExpanded, topRightIcon: CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: _jsx(DownloadScreenshotControls, { close: this.toggleScreenshotExpanded }) }) }), this.state.isSettingsExpanded && _jsx("div", { className: 'msp-viewport-controls-panel', children: _jsx(ControlGroup, { header: 'Settings / Controls Info', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleSettingsExpanded, topRightIcon: CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: _jsx(SimpleSettingsControl, {}) }) })] });
    };
    return ViewportControls;
}(PluginUIComponent));
export { ViewportControls };
export var Logo = function () {
    return _jsx("a", { className: 'msp-logo', href: 'https://molstar.org', target: '_blank' });
};
export var Viewport = function () { return _jsx(ViewportCanvas, { logo: Logo }); };
