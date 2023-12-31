import { __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from LiteMol (c) David Sehnal
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginUIComponent } from './base';
import { IconButton } from './controls/common';
import { CancelSvg } from './controls/icons';
var ToastEntry = /** @class */ (function (_super) {
    __extends(ToastEntry, _super);
    function ToastEntry() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.hide = function () {
            var entry = _this.props.entry;
            (entry.hide || function () { }).call(null);
        };
        return _this;
    }
    ToastEntry.prototype.render = function () {
        var _this = this;
        var entry = this.props.entry;
        var message = typeof entry.message === 'string'
            ? _jsx("div", { dangerouslySetInnerHTML: { __html: entry.message } })
            // @ts-ignore // TODO: handle type better
            : _jsx("div", { children: _jsx(entry.message, {}) });
        return _jsxs("div", { className: 'msp-toast-entry', children: [_jsx("div", { className: 'msp-toast-title', onClick: function () { return _this.hide(); }, children: entry.title }), _jsx("div", { className: 'msp-toast-message', children: message }), _jsx("div", { className: 'msp-toast-clear' }), _jsx("div", { className: 'msp-toast-hide', children: _jsx(IconButton, { svg: CancelSvg, onClick: this.hide, title: 'Hide', className: 'msp-no-hover-outline' }) })] });
    };
    return ToastEntry;
}(PluginUIComponent));
var Toasts = /** @class */ (function (_super) {
    __extends(Toasts, _super);
    function Toasts() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Toasts.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.toast.events.changed, function () { return _this.forceUpdate(); });
    };
    Toasts.prototype.render = function () {
        var state = this.plugin.managers.toast.state;
        if (!state.entries.count())
            return null;
        var entries = [];
        state.entries.forEach(function (t, k) { return entries.push(t); });
        entries.sort(function (x, y) { return x.serialNumber - y.serialNumber; });
        return _jsx("div", { className: 'msp-toast-container', children: entries.map(function (e) { return _jsx(ToastEntry, { entry: e }, e.serialNumber); }) });
    };
    return Toasts;
}(PluginUIComponent));
export { Toasts };
