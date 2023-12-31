import { __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { formatTime } from '../mol-util';
import { PluginReactContext, PluginUIComponent } from './base';
import { AnimationViewportControls, DefaultStructureTools, LociLabels, StateSnapshotViewportControls, TrajectoryViewportControls, SelectionViewportControls } from './controls';
import { LeftPanelControls } from './left-panel';
import { SequenceView } from './sequence';
import { BackgroundTaskProgress, OverlayTaskProgress } from './task';
import { Toasts } from './toast';
import { Viewport, ViewportControls } from './viewport';
import { PluginCommands } from '../mol-plugin/commands';
import { OpenFiles } from '../mol-plugin-state/actions/file';
import { Asset } from '../mol-util/assets';
import { BehaviorSubject } from 'rxjs';
import { useBehavior } from './hooks/use-behavior';
var Plugin = /** @class */ (function (_super) {
    __extends(Plugin, _super);
    function Plugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Plugin.prototype.render = function () {
        return _jsx(PluginReactContext.Provider, { value: this.props.plugin, children: _jsx(Layout, {}) });
    };
    return Plugin;
}(React.Component));
export { Plugin };
var PluginContextContainer = /** @class */ (function (_super) {
    __extends(PluginContextContainer, _super);
    function PluginContextContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PluginContextContainer.prototype.render = function () {
        return _jsx(PluginReactContext.Provider, { value: this.props.plugin, children: _jsx("div", { className: 'msp-plugin', children: this.props.children }) });
    };
    return PluginContextContainer;
}(React.Component));
export { PluginContextContainer };
var Layout = /** @class */ (function (_super) {
    __extends(Layout, _super);
    function Layout() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onDrop = function (ev) {
            ev.preventDefault();
            var files = [];
            if (ev.dataTransfer.items) {
                // Use DataTransferItemList interface to access the file(s)
                for (var i = 0; i < ev.dataTransfer.items.length; i++) {
                    if (ev.dataTransfer.items[i].kind !== 'file')
                        continue;
                    var file = ev.dataTransfer.items[i].getAsFile();
                    if (file)
                        files.push(file);
                }
            }
            else {
                for (var i = 0; i < ev.dataTransfer.files.length; i++) {
                    var file = ev.dataTransfer.files[i];
                    if (file)
                        files.push(file);
                }
            }
            var sessions = files.filter(function (f) {
                var fn = f.name.toLowerCase();
                return fn.endsWith('.molx') || fn.endsWith('.molj');
            });
            if (sessions.length > 0) {
                PluginCommands.State.Snapshots.OpenFile(_this.plugin, { file: sessions[0] });
            }
            else {
                _this.plugin.runTask(_this.plugin.state.data.applyAction(OpenFiles, {
                    files: files.map(function (f) { return Asset.File(f); }),
                    format: { name: 'auto', params: {} },
                    visuals: true
                }));
            }
        };
        _this.onDragOver = function (ev) {
            ev.preventDefault();
        };
        _this.showDragOverlay = new BehaviorSubject(false);
        _this.onDragEnter = function () { return _this.showDragOverlay.next(true); };
        return _this;
    }
    Layout.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.layout.events.updated, function () { return _this.forceUpdate(); });
    };
    Layout.prototype.region = function (kind, Element) {
        return _jsx("div", { className: "msp-layout-region msp-layout-".concat(kind), children: _jsx("div", { className: 'msp-layout-static', children: Element ? _jsx(Element, {}) : null }) });
    };
    Object.defineProperty(Layout.prototype, "layoutVisibilityClassName", {
        get: function () {
            var _a, _b;
            var layout = this.plugin.layout.state;
            var controls = (_b = (_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.controls) !== null && _b !== void 0 ? _b : {};
            var classList = [];
            if (controls.top === 'none' || !layout.showControls || layout.regionState.top === 'hidden') {
                classList.push('msp-layout-hide-top');
            }
            if (controls.left === 'none' || !layout.showControls || layout.regionState.left === 'hidden') {
                classList.push('msp-layout-hide-left');
            }
            else if (layout.regionState.left === 'collapsed') {
                classList.push('msp-layout-collapse-left');
            }
            if (controls.right === 'none' || !layout.showControls || layout.regionState.right === 'hidden') {
                classList.push('msp-layout-hide-right');
            }
            if (controls.bottom === 'none' || !layout.showControls || layout.regionState.bottom === 'hidden') {
                classList.push('msp-layout-hide-bottom');
            }
            return classList.join(' ');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Layout.prototype, "layoutClassName", {
        get: function () {
            var layout = this.plugin.layout.state;
            var classList = ['msp-plugin-content'];
            if (layout.isExpanded) {
                classList.push('msp-layout-expanded');
            }
            else {
                classList.push('msp-layout-standard', "msp-layout-standard-".concat(layout.controlsDisplay));
            }
            return classList.join(' ');
        },
        enumerable: false,
        configurable: true
    });
    Layout.prototype.render = function () {
        var _a, _b, _c, _d, _e;
        var layout = this.plugin.layout.state;
        var controls = ((_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.controls) || {};
        var viewport = ((_c = (_b = this.plugin.spec.components) === null || _b === void 0 ? void 0 : _b.viewport) === null || _c === void 0 ? void 0 : _c.view) || DefaultViewport;
        return _jsx("div", { className: 'msp-plugin', children: _jsxs("div", { className: this.layoutClassName, onDragEnter: this.onDragEnter, children: [_jsxs("div", { className: this.layoutVisibilityClassName, children: [this.region('main', viewport), layout.showControls && controls.top !== 'none' && this.region('top', controls.top || SequenceView), layout.showControls && controls.left !== 'none' && this.region('left', controls.left || LeftPanelControls), layout.showControls && controls.right !== 'none' && this.region('right', controls.right || ControlsWrapper), layout.showControls && controls.bottom !== 'none' && this.region('bottom', controls.bottom || Log)] }), !((_d = this.plugin.spec.components) === null || _d === void 0 ? void 0 : _d.hideTaskOverlay) && _jsx(OverlayTaskProgress, {}), !((_e = this.plugin.spec.components) === null || _e === void 0 ? void 0 : _e.disableDragOverlay) && _jsx(DragOverlay, { plugin: this.plugin, showDragOverlay: this.showDragOverlay })] }) });
    };
    return Layout;
}(PluginUIComponent));
function dropFiles(ev, plugin, showDragOverlay) {
    ev.preventDefault();
    ev.stopPropagation();
    showDragOverlay.next(false);
    var files = [];
    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind !== 'file')
                continue;
            var file = ev.dataTransfer.items[i].getAsFile();
            if (file)
                files.push(file);
        }
    }
    else {
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            var file = ev.dataTransfer.files[i];
            if (file)
                files.push(file);
        }
    }
    var sessions = files.filter(function (f) {
        var fn = f.name.toLowerCase();
        return fn.endsWith('.molx') || fn.endsWith('.molj');
    });
    if (sessions.length > 0) {
        PluginCommands.State.Snapshots.OpenFile(plugin, { file: sessions[0] });
    }
    else {
        plugin.runTask(plugin.state.data.applyAction(OpenFiles, {
            files: files.map(function (f) { return Asset.File(f); }),
            format: { name: 'auto', params: {} },
            visuals: true
        }));
    }
}
function DragOverlay(_a) {
    var plugin = _a.plugin, showDragOverlay = _a.showDragOverlay;
    var show = useBehavior(showDragOverlay);
    var preventDrag = function (e) {
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
        e.stopPropagation();
    };
    return _jsx("div", { className: 'msp-drag-drop-overlay', style: { display: show ? 'flex' : 'none' }, onDragEnter: preventDrag, onDragOver: preventDrag, onDragLeave: function () { return showDragOverlay.next(false); }, onDrop: function (e) { return dropFiles(e, plugin, showDragOverlay); }, children: "Load File(s)" });
}
var ControlsWrapper = /** @class */ (function (_super) {
    __extends(ControlsWrapper, _super);
    function ControlsWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ControlsWrapper.prototype.render = function () {
        var _a;
        var StructureTools = ((_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.structureTools) || DefaultStructureTools;
        return _jsx("div", { className: 'msp-scrollable-container', children: _jsx(StructureTools, {}) });
    };
    return ControlsWrapper;
}(PluginUIComponent));
export { ControlsWrapper };
var DefaultViewport = /** @class */ (function (_super) {
    __extends(DefaultViewport, _super);
    function DefaultViewport() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultViewport.prototype.render = function () {
        var _a, _b;
        var VPControls = ((_b = (_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.viewport) === null || _b === void 0 ? void 0 : _b.controls) || ViewportControls;
        return _jsxs(_Fragment, { children: [_jsx(Viewport, {}), _jsxs("div", { className: 'msp-viewport-top-left-controls', children: [_jsx(AnimationViewportControls, {}), _jsx(TrajectoryViewportControls, {}), _jsx(StateSnapshotViewportControls, {})] }), _jsx(SelectionViewportControls, {}), _jsx(VPControls, {}), _jsx(BackgroundTaskProgress, {}), _jsxs("div", { className: 'msp-highlight-toast-wrapper', children: [_jsx(LociLabels, {}), _jsx(Toasts, {})] })] });
    };
    return DefaultViewport;
}(PluginUIComponent));
export { DefaultViewport };
var Log = /** @class */ (function (_super) {
    __extends(Log, _super);
    function Log() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.wrapper = React.createRef();
        _this.state = { entries: _this.plugin.log.entries };
        return _this;
    }
    Log.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.events.log, function () { return _this.setState({ entries: _this.plugin.log.entries }); });
    };
    Log.prototype.componentDidUpdate = function () {
        this.scrollToBottom();
    };
    Log.prototype.scrollToBottom = function () {
        var log = this.wrapper.current;
        if (log)
            log.scrollTop = log.scrollHeight - log.clientHeight - 1;
    };
    Log.prototype.render = function () {
        // TODO: ability to show full log
        // showing more entries dramatically slows animations.
        var maxEntries = 10;
        var xs = this.state.entries, l = xs.size;
        var entries = [];
        for (var i = Math.max(0, l - maxEntries), o = 0; i < l; i++) {
            var e = xs.get(i);
            entries.push(_jsxs("li", { children: [_jsx("div", { className: 'msp-log-entry-badge msp-log-entry-' + e.type }), _jsx("div", { className: 'msp-log-timestamp', children: formatTime(e.timestamp) }), _jsx("div", { className: 'msp-log-entry', children: e.message })] }, o++));
        }
        return _jsx("div", { ref: this.wrapper, className: 'msp-log', style: { position: 'absolute', top: '0', right: '0', bottom: '0', left: '0', overflowY: 'auto' }, children: _jsx("ul", { className: 'msp-list-unstyled', children: entries }) });
    };
    return Log;
}(PluginUIComponent));
export { Log };
