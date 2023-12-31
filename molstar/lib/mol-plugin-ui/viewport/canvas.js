import { __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { PluginUIComponent } from '../base';
var ViewportCanvas = /** @class */ (function (_super) {
    __extends(ViewportCanvas, _super);
    function ViewportCanvas() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.container = React.createRef();
        _this.state = {
            noWebGl: false,
            showLogo: true
        };
        _this.handleLogo = function () {
            var _a;
            _this.setState({ showLogo: !((_a = _this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.reprCount.value) });
        };
        return _this;
    }
    ViewportCanvas.prototype.componentDidMount = function () {
        if (!this.container.current || !this.plugin.mount(this.container.current, { checkeredCanvasBackground: true })) {
            this.setState({ noWebGl: true });
            return;
        }
        this.handleLogo();
        this.subscribe(this.plugin.canvas3d.reprCount, this.handleLogo);
    };
    ViewportCanvas.prototype.componentWillUnmount = function () {
        _super.prototype.componentWillUnmount.call(this);
        this.plugin.unmount();
    };
    ViewportCanvas.prototype.renderMissing = function () {
        if (this.props.noWebGl) {
            var C = this.props.noWebGl;
            return _jsx(C, {});
        }
        return _jsx("div", { className: 'msp-no-webgl', children: _jsxs("div", { children: [_jsx("p", { children: _jsx("b", { children: "WebGL does not seem to be available." }) }), _jsx("p", { children: "This can be caused by an outdated browser, graphics card driver issue, or bad weather. Sometimes, just restarting the browser helps. Also, make sure hardware acceleration is enabled in your browser." }), _jsxs("p", { children: ["For a list of supported browsers, refer to ", _jsx("a", { href: 'http://caniuse.com/#feat=webgl', target: '_blank', children: "http://caniuse.com/#feat=webgl" }), "."] })] }) });
    };
    ViewportCanvas.prototype.render = function () {
        if (this.state.noWebGl)
            return this.renderMissing();
        var Logo = this.props.logo;
        return _jsx("div", { className: this.props.parentClassName || 'msp-viewport', style: this.props.parentStyle, ref: this.container, children: (this.state.showLogo && Logo) && _jsx(Logo, {}) });
    };
    return ViewportCanvas;
}(PluginUIComponent));
export { ViewportCanvas };
