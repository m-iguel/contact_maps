import { __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import { camelCaseToWords, stringToWords } from '../../mol-util/string';
import * as React from 'react';
import { TextInput, Button, ControlRow } from './common';
import { DefaultColorSwatch } from '../../mol-util/color/swatches';
var CombinedColorControl = /** @class */ (function (_super) {
    __extends(CombinedColorControl, _super);
    function CombinedColorControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isExpanded: !!_this.props.param.isExpanded || !!_this.props.hideNameRow,
            lightness: 0
        };
        _this.toggleExpanded = function (e) {
            _this.setState({ isExpanded: !_this.state.isExpanded });
            e.currentTarget.blur();
        };
        _this.onClickSwatch = function (e) {
            var value = Color.fromHexString(e.currentTarget.getAttribute('data-color') || '0');
            if (value !== _this.props.value) {
                if (!_this.props.param.isExpanded)
                    _this.setState({ isExpanded: false });
                _this.update(value);
            }
        };
        _this.onR = function (v) {
            var _a = Color.toRgb(_this.props.value), g = _a[1], b = _a[2];
            var value = Color.fromRgb(v, g, b);
            if (value !== _this.props.value)
                _this.update(value);
        };
        _this.onG = function (v) {
            var _a = Color.toRgb(_this.props.value), r = _a[0], b = _a[2];
            var value = Color.fromRgb(r, v, b);
            if (value !== _this.props.value)
                _this.update(value);
        };
        _this.onB = function (v) {
            var _a = Color.toRgb(_this.props.value), r = _a[0], g = _a[1];
            var value = Color.fromRgb(r, g, v);
            if (value !== _this.props.value)
                _this.update(value);
        };
        _this.onRGB = function (e) {
            var value = Color.fromHexStyle(e.currentTarget.value || '0');
            if (value !== _this.props.value)
                _this.update(value);
        };
        _this.onLighten = function () {
            _this.update(Color.lighten(_this.props.value, 0.1));
        };
        _this.onDarken = function () {
            _this.update(Color.darken(_this.props.value, 0.1));
        };
        return _this;
    }
    CombinedColorControl.prototype.update = function (value) {
        this.props.onChange({ param: this.props.param, name: this.props.name, value: value });
    };
    CombinedColorControl.prototype.swatch = function () {
        var _this = this;
        return _jsx("div", { className: 'msp-combined-color-swatch', children: DefaultColorSwatch.map(function (c) { return _jsx(Button, { inline: true, "data-color": c[1], onClick: _this.onClickSwatch, style: { background: Color.toStyle(c[1]) } }, c[1]); }) });
    };
    CombinedColorControl.prototype.render = function () {
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        var _a = Color.toRgb(this.props.value), r = _a[0], g = _a[1], b = _a[2];
        var inner = _jsxs(_Fragment, { children: [this.swatch(), _jsx(ControlRow, { label: 'RGB', className: 'msp-control-label-short', control: _jsxs("div", { style: { display: 'flex', textAlignLast: 'center', left: '80px' }, children: [_jsx(TextInput, { onChange: this.onR, numeric: true, value: r, delayMs: 250, style: { order: 1, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', onEnter: this.props.onEnter, blurOnEnter: true, blurOnEscape: true }), _jsx(TextInput, { onChange: this.onG, numeric: true, value: g, delayMs: 250, style: { order: 2, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', onEnter: this.props.onEnter, blurOnEnter: true, blurOnEscape: true }), _jsx(TextInput, { onChange: this.onB, numeric: true, value: b, delayMs: 250, style: { order: 3, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', onEnter: this.props.onEnter, blurOnEnter: true, blurOnEscape: true }), _jsx("input", { onInput: this.onRGB, type: 'color', value: Color.toHexStyle(this.props.value), style: { order: 4, flex: '1 1 auto', minWidth: '32px', width: '32px', height: '32px', padding: '0 2px 0 2px', background: 'none', border: 'none', cursor: 'pointer' } })] }) }), _jsxs("div", { style: { display: 'flex', textAlignLast: 'center' }, children: [_jsx(Button, { onClick: this.onLighten, style: { order: 1, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', children: "Lighten" }), _jsx(Button, { onClick: this.onDarken, style: { order: 1, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', children: "Darken" })] })] });
        if (this.props.hideNameRow) {
            return inner;
        }
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { title: this.props.param.description, label: label, control: _jsx(Button, { onClick: this.toggleExpanded, inline: true, className: 'msp-combined-color-button', style: { background: Color.toStyle(this.props.value) } }) }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: inner })] });
    };
    return CombinedColorControl;
}(React.PureComponent));
export { CombinedColorControl };
var _colors = void 0;
export function ColorOptions() {
    if (_colors)
        return _colors;
    _colors = _jsx(_Fragment, { children: DefaultColorSwatch.map(function (v) {
            return _jsx("option", { value: v[1], style: { background: "".concat(Color.toStyle(v[1])) }, children: stringToWords(v[0]) }, v[1]);
        }) });
    return _colors;
}
var DefaultColorSwatchMap = (function () {
    var map = new Map();
    for (var _i = 0, DefaultColorSwatch_1 = DefaultColorSwatch; _i < DefaultColorSwatch_1.length; _i++) {
        var v = DefaultColorSwatch_1[_i];
        map.set(v[1], v[0]);
    }
    return map;
})();
export function ColorValueOption(color) {
    return !DefaultColorSwatchMap.has(color) ? _jsx("option", { value: color, style: { background: "".concat(Color.toStyle(color)) }, children: Color.toRgbString(color) }, Color.toHexString(color)) : null;
}
