import { __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { Button } from './controls/common';
import { Icon, ArrowRightSvg, ArrowDropDownSvg } from './controls/icons';
export var PluginReactContext = React.createContext(void 0);
export var PluginUIComponent = /** @class */ (function (_super) {
    __extends(PluginUIComponent, _super);
    function PluginUIComponent(props, context) {
        var _this = _super.call(this, props) || this;
        _this.subs = void 0;
        _this.plugin = context;
        if (_this.init)
            _this.init();
        return _this;
    }
    PluginUIComponent.prototype.subscribe = function (obs, action) {
        if (typeof this.subs === 'undefined')
            this.subs = [];
        this.subs.push(obs.subscribe(action));
    };
    PluginUIComponent.prototype.componentWillUnmount = function () {
        if (!this.subs)
            return;
        for (var _i = 0, _a = this.subs; _i < _a.length; _i++) {
            var s = _a[_i];
            s.unsubscribe();
        }
        this.subs = void 0;
    };
    PluginUIComponent.contextType = PluginReactContext;
    return PluginUIComponent;
}(React.Component));
export var PurePluginUIComponent = /** @class */ (function (_super) {
    __extends(PurePluginUIComponent, _super);
    function PurePluginUIComponent(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.subs = void 0;
        _this.plugin = context;
        if (_this.init)
            _this.init();
        return _this;
    }
    PurePluginUIComponent.prototype.subscribe = function (obs, action) {
        if (typeof this.subs === 'undefined')
            this.subs = [];
        this.subs.push(obs.subscribe(action));
    };
    PurePluginUIComponent.prototype.componentWillUnmount = function () {
        if (!this.subs)
            return;
        for (var _i = 0, _a = this.subs; _i < _a.length; _i++) {
            var s = _a[_i];
            s.unsubscribe();
        }
        this.subs = void 0;
    };
    PurePluginUIComponent.contextType = PluginReactContext;
    return PurePluginUIComponent;
}(React.PureComponent));
var CollapsableControls = /** @class */ (function (_super) {
    __extends(CollapsableControls, _super);
    function CollapsableControls(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.toggleCollapsed = function () {
            _this.setState({ isCollapsed: !_this.state.isCollapsed });
        };
        var state = _this.defaultState();
        if (props.initiallyCollapsed !== undefined)
            state.isCollapsed = props.initiallyCollapsed;
        if (props.header !== undefined)
            state.header = props.header;
        _this.state = state;
        return _this;
    }
    CollapsableControls.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.initiallyCollapsed !== undefined && prevProps.initiallyCollapsed !== this.props.initiallyCollapsed) {
            this.setState({ isCollapsed: this.props.initiallyCollapsed });
        }
    };
    CollapsableControls.prototype.render = function () {
        var _a;
        if (this.state.isHidden)
            return null;
        var wrapClass = this.state.isCollapsed
            ? 'msp-transform-wrapper msp-transform-wrapper-collapsed'
            : 'msp-transform-wrapper';
        return _jsxs("div", { className: wrapClass, children: [_jsx("div", { className: 'msp-transform-header', children: _jsxs(Button, { icon: this.state.brand ? void 0 : this.state.isCollapsed ? ArrowRightSvg : ArrowDropDownSvg, noOverflow: true, onClick: this.toggleCollapsed, className: this.state.brand ? "msp-transform-header-brand msp-transform-header-brand-".concat(this.state.brand.accent) : void 0, title: "Click to ".concat(this.state.isCollapsed ? 'expand' : 'collapse'), children: [_jsx(Icon, { svg: (_a = this.state.brand) === null || _a === void 0 ? void 0 : _a.svg, inline: true }), this.state.header, _jsx("small", { style: { margin: '0 6px' }, children: this.state.isCollapsed ? '' : this.state.description })] }) }), !this.state.isCollapsed && this.renderControls()] });
    };
    return CollapsableControls;
}(PluginUIComponent));
export { CollapsableControls };
