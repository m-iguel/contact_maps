import { __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as React from 'react';
import { Color } from '../../mol-util/color';
import { Icon, ArrowRightSvg, ArrowDropDownSvg, RemoveSvg, AddSvg } from './icons';
var ControlGroup = /** @class */ (function (_super) {
    __extends(ControlGroup, _super);
    function ControlGroup() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isExpanded: !!_this.props.initialExpanded };
        _this.headerClicked = function () {
            if (_this.props.onHeaderClick) {
                _this.props.onHeaderClick();
            }
            else {
                _this.setState({ isExpanded: !_this.state.isExpanded });
            }
        };
        return _this;
    }
    ControlGroup.prototype.render = function () {
        var groupClassName = this.props.hideOffset ? 'msp-control-group-children' : 'msp-control-group-children msp-control-offset';
        if (this.props.childrenClassName)
            groupClassName += ' ' + this.props.childrenClassName;
        // TODO: customize header style (bg color, togle button etc)
        return _jsxs("div", { className: 'msp-control-group-wrapper', style: { position: 'relative', marginTop: this.props.noTopMargin ? 0 : void 0 }, children: [_jsx("div", { className: 'msp-control-group-header', style: { marginLeft: this.props.headerLeftMargin }, title: this.props.title, children: _jsxs(Button, { onClick: this.headerClicked, children: [!this.props.hideExpander && _jsx(Icon, { svg: this.state.isExpanded ? ArrowRightSvg : ArrowDropDownSvg }), this.props.topRightIcon && _jsx(Icon, { svg: this.props.topRightIcon, style: { position: 'absolute', right: '2px', top: 0 } }), _jsx("b", { children: this.props.header })] }) }), this.state.isExpanded && _jsx("div", { className: groupClassName, style: { display: this.state.isExpanded ? 'block' : 'none', maxHeight: this.props.maxHeight, overflow: 'hidden', overflowY: 'auto' }, children: this.props.children })] });
    };
    return ControlGroup;
}(React.Component));
export { ControlGroup };
function _id(x) { return x; }
var TextInput = /** @class */ (function (_super) {
    __extends(TextInput, _super);
    function TextInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.input = React.createRef();
        _this.delayHandle = void 0;
        _this.pendingValue = void 0;
        _this.state = { originalValue: '', value: '' };
        _this.onBlur = function () {
            _this.setState({ value: '' + _this.state.originalValue });
            if (_this.props.onBlur)
                _this.props.onBlur();
        };
        _this.raiseOnChange = function () {
            if (_this.pendingValue === void 0)
                return;
            _this.props.onChange(_this.pendingValue);
            _this.pendingValue = void 0;
        };
        _this.onChange = function (e) {
            var value = e.target.value;
            var isInvalid = (_this.props.isValid && !_this.props.isValid(value)) || (_this.props.numeric && Number.isNaN(+value));
            if (isInvalid) {
                _this.clearTimeout();
                _this.setState({ value: value });
                return;
            }
            if (_this.props.numeric) {
                _this.setState({ value: value }, function () { return _this.triggerChanged(value, +value); });
            }
            else {
                var converted_1 = (_this.props.toValue || _id)(value);
                var formatted_1 = (_this.props.fromValue || _id)(converted_1);
                _this.setState({ value: formatted_1 }, function () { return _this.triggerChanged(formatted_1, converted_1); });
            }
        };
        _this.onKeyUp = function (e) {
            if (e.charCode === 27 || e.keyCode === 27 || e.key === 'Escape') {
                if (_this.props.blurOnEscape && _this.input.current) {
                    _this.input.current.blur();
                }
            }
        };
        _this.onKeyPress = function (e) {
            if (e.keyCode === 13 || e.charCode === 13 || e.key === 'Enter') {
                if (_this.isPending) {
                    _this.clearTimeout();
                    _this.raiseOnChange();
                }
                if (_this.props.blurOnEnter && _this.input.current) {
                    _this.input.current.blur();
                }
                if (_this.props.onEnter)
                    _this.props.onEnter();
            }
            e.stopPropagation();
        };
        return _this;
    }
    Object.defineProperty(TextInput.prototype, "isPending", {
        get: function () { return typeof this.delayHandle !== 'undefined'; },
        enumerable: false,
        configurable: true
    });
    TextInput.prototype.clearTimeout = function () {
        if (this.isPending) {
            clearTimeout(this.delayHandle);
            this.delayHandle = void 0;
        }
    };
    TextInput.prototype.triggerChanged = function (formatted, converted) {
        this.clearTimeout();
        if (formatted === this.state.originalValue)
            return;
        if (this.props.delayMs) {
            this.pendingValue = converted;
            this.delayHandle = setTimeout(this.raiseOnChange, this.props.delayMs);
        }
        else {
            this.props.onChange(converted);
        }
    };
    TextInput.getDerivedStateFromProps = function (props, state) {
        var value = props.fromValue ? props.fromValue(props.value) : props.value;
        if (value === state.originalValue)
            return null;
        return { originalValue: value, value: value };
    };
    TextInput.prototype.render = function () {
        return _jsx("input", { type: 'text', className: this.props.className, style: this.props.style, ref: this.input, onBlur: this.onBlur, value: this.state.value, placeholder: this.props.placeholder, onChange: this.onChange, onKeyPress: this.props.onEnter || this.props.blurOnEnter || this.props.blurOnEscape ? this.onKeyPress : void 0, onKeyDown: this.props.blurOnEscape ? this.onKeyUp : void 0, disabled: !!this.props.isDisabled });
    };
    return TextInput;
}(React.PureComponent));
export { TextInput };
var ExpandableControlRow = /** @class */ (function (_super) {
    __extends(ExpandableControlRow, _super);
    function ExpandableControlRow() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isExpanded: false };
        _this.toggleExpanded = function () { return _this.setState({ isExpanded: !_this.state.isExpanded }); };
        return _this;
    }
    ExpandableControlRow.prototype.render = function () {
        var _a = this.props, label = _a.label, pivot = _a.pivot, controls = _a.controls;
        // TODO: fix the inline CSS
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: _jsxs(_Fragment, { children: [label, _jsx("button", { className: 'msp-btn-link msp-btn-icon msp-control-group-expander', onClick: this.toggleExpanded, title: "".concat(this.state.isExpanded ? 'Less' : 'More', " options"), style: { background: 'transparent', textAlign: 'left', padding: '0' }, children: _jsx(Icon, { svg: this.state.isExpanded ? RemoveSvg : AddSvg, style: { display: 'inline-block' } }) })] }), control: pivot, children: this.props.colorStripe && _jsx("div", { className: 'msp-expandable-group-color-stripe', style: { backgroundColor: Color.toStyle(this.props.colorStripe) } }) }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: controls })] });
    };
    return ExpandableControlRow;
}(React.Component));
export { ExpandableControlRow };
export function SectionHeader(props) {
    return _jsxs("div", { className: "msp-section-header".concat(props.accent ? ' msp-transform-header-brand-' + props.accent : ''), children: [props.icon && _jsx(Icon, { svg: props.icon }), props.title, " ", _jsx("small", { children: props.desc })] });
}
export function Button(props) {
    var className = 'msp-btn';
    if (!props.inline)
        className += ' msp-btn-block';
    if (props.noOverflow)
        className += ' msp-no-overflow';
    if (props.flex)
        className += ' msp-flex-item';
    if (props.commit === 'on' || props.commit)
        className += ' msp-btn-commit msp-btn-commit-on';
    if (props.commit === 'off')
        className += ' msp-btn-commit msp-btn-commit-off';
    if (!props.children)
        className += ' msp-btn-childless';
    if (props.className)
        className += ' ' + props.className;
    var style = void 0;
    if (props.flex) {
        if (typeof props.flex === 'number')
            style = { flex: "0 0 ".concat(props.flex, "px"), padding: 0, maxWidth: "".concat(props.flex, "px") };
        else if (typeof props.flex === 'string')
            style = { flex: "0 0 ".concat(props.flex), padding: 0, maxWidth: props.flex };
    }
    if (props.style) {
        if (style)
            Object.assign(style, props.style);
        else
            style = props.style;
    }
    return _jsxs("button", { onClick: props.onClick, title: props.title, disabled: props.disabled, style: style, className: className, "data-id": props['data-id'], "data-color": props['data-color'], onContextMenu: props.onContextMenu, onMouseEnter: props.onMouseEnter, onMouseLeave: props.onMouseLeave, children: [props.icon && _jsx(Icon, { svg: props.icon }), props.children] });
}
export function IconButton(props) {
    var className = "msp-btn msp-btn-icon".concat(props.small ? '-small' : '').concat(props.className ? ' ' + props.className : '');
    if (typeof props.toggleState !== 'undefined') {
        className += " msp-btn-link-toggle-".concat(props.toggleState ? 'on' : 'off');
    }
    if (props.transparent) {
        className += ' msp-transparent-bg';
    }
    var style = void 0;
    if (props.flex) {
        if (typeof props.flex === 'boolean')
            style = { flex: '0 0 32px', padding: 0 };
        else if (typeof props.flex === 'number')
            style = { flex: "0 0 ".concat(props.flex, "px"), padding: 0, maxWidth: "".concat(props.flex, "px") };
        else
            style = { flex: "0 0 ".concat(props.flex), padding: 0, maxWidth: props.flex };
    }
    if (props.style) {
        if (style)
            Object.assign(style, props.style);
        else
            style = props.style;
    }
    return _jsxs("button", { className: className, onClick: props.onClick, title: props.title, disabled: props.disabled, "data-id": props['data-id'], style: style, children: [props.svg && _jsx(Icon, { svg: props.svg }), props.extraContent] });
}
var ToggleButton = /** @class */ (function (_super) {
    __extends(ToggleButton, _super);
    function ToggleButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onClick = function (e) {
            e.currentTarget.blur();
            _this.props.toggle();
        };
        return _this;
    }
    ToggleButton.prototype.render = function () {
        var props = this.props;
        var label = props.label;
        var className = props.isSelected ? "".concat(props.className || '', " msp-control-current") : props.className;
        return _jsx(Button, { icon: this.props.icon, onClick: this.onClick, title: this.props.title, inline: this.props.inline, disabled: props.disabled, style: props.style, className: className, children: label && this.props.isSelected ? _jsx("b", { children: label }) : label });
    };
    return ToggleButton;
}(React.PureComponent));
export { ToggleButton };
var ExpandGroup = /** @class */ (function (_super) {
    __extends(ExpandGroup, _super);
    function ExpandGroup() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isExpanded: !!_this.props.initiallyExpanded };
        _this.toggleExpanded = function () { return _this.setState({ isExpanded: !_this.state.isExpanded }); };
        return _this;
    }
    ExpandGroup.prototype.render = function () {
        return _jsxs(_Fragment, { children: [_jsx("div", { className: 'msp-control-group-header', style: { marginTop: this.props.marginTop !== void 0 ? this.props.marginTop : '1px', marginLeft: this.props.headerLeftMargin }, children: _jsxs("button", { className: 'msp-btn msp-form-control msp-btn-block', onClick: this.toggleExpanded, style: this.props.headerStyle, children: [_jsx(Icon, { svg: this.state.isExpanded ? ArrowDropDownSvg : ArrowRightSvg }), this.props.header] }) }), this.state.isExpanded &&
                    (this.props.noOffset
                        ? this.props.children
                        : _jsx("div", { className: this.props.accent ? 'msp-accent-offset' : 'msp-control-offset', children: this.props.children }))] });
    };
    return ExpandGroup;
}(React.PureComponent));
export { ExpandGroup };
export function ControlRow(props) {
    var className = 'msp-control-row';
    if (props.className)
        className += ' ' + props.className;
    return _jsxs("div", { className: className, children: [_jsx("span", { className: 'msp-control-row-label', title: props.title, children: props.label }), _jsx("div", { className: 'msp-control-row-ctrl', children: props.control }), props.children] });
}
