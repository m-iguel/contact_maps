import { __assign, __extends, __spreadArray } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { Mat4, Vec3 } from '../../mol-math/linear-algebra';
import { Script } from '../../mol-script/script';
import { Asset } from '../../mol-util/assets';
import { Color } from '../../mol-util/color';
import { ColorListOptions, ColorListOptionsScale, ColorListOptionsSet, getColorListFromName } from '../../mol-util/color/lists';
import { memoize1, memoizeLatest } from '../../mol-util/memoize';
import { getPrecision } from '../../mol-util/number';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { camelCaseToWords } from '../../mol-util/string';
import { PluginReactContext, PluginUIComponent } from '../base';
import { ActionMenu } from './action-menu';
import { ColorOptions, ColorValueOption, CombinedColorControl } from './color';
import { Button, ControlGroup, ControlRow, ExpandGroup, IconButton, TextInput, ToggleButton } from './common';
import { ArrowDownwardSvg, ArrowDropDownSvg, ArrowRightSvg, ArrowUpwardSvg, BookmarksOutlinedSvg, CheckSvg, ClearSvg, DeleteOutlinedSvg, HelpOutlineSvg, Icon, MoreHorizSvg, WarningSvg } from './icons';
import { legendFor } from './legend';
import { LineGraphComponent } from './line-graph/line-graph-component';
import { Slider, Slider2 } from './slider';
var ParameterControls = /** @class */ (function (_super) {
    __extends(ParameterControls, _super);
    function ParameterControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChange = function (params) {
            var _a;
            var _b, _c;
            (_c = (_b = _this.props).onChange) === null || _c === void 0 ? void 0 : _c.call(_b, params, _this.props.values);
            if (_this.props.onChangeValues) {
                var values = __assign(__assign({}, _this.props.values), (_a = {}, _a[params.name] = params.value, _a));
                _this.props.onChangeValues(values, _this.props.values);
            }
        };
        _this.paramGroups = memoizeLatest(function (params) { return classifyParams(params); });
        return _this;
    }
    ParameterControls.prototype.renderGroup = function (group) {
        var _a;
        if (group.length === 0)
            return null;
        var values = this.props.values;
        var ctrls = null;
        var category = void 0;
        for (var _i = 0, group_1 = group; _i < group_1.length; _i++) {
            var _b = group_1[_i], key = _b[0], p = _b[1], Control = _b[2];
            if ((_a = p.hideIf) === null || _a === void 0 ? void 0 : _a.call(p, values))
                continue;
            if (!ctrls)
                ctrls = [];
            category = p.category;
            ctrls.push(_jsx(Control, { param: p, onChange: this.onChange, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled, name: key, value: values[key] }, key));
        }
        if (!ctrls)
            return null;
        if (category) {
            return [_jsx(ExpandGroup, { header: category, children: ctrls }, category)];
        }
        return ctrls;
    };
    ParameterControls.prototype.renderPart = function (groups) {
        var parts = null;
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var g = groups_1[_i];
            var ctrls = this.renderGroup(g);
            if (!ctrls)
                continue;
            if (!parts)
                parts = [];
            for (var _a = 0, ctrls_1 = ctrls; _a < ctrls_1.length; _a++) {
                var c = ctrls_1[_a];
                parts.push(c);
            }
        }
        return parts;
    };
    ParameterControls.prototype.render = function () {
        var groups = this.paramGroups(this.props.params);
        var essentials = this.renderPart(groups.essentials);
        var advanced = this.renderPart(groups.advanced);
        if (essentials && advanced) {
            return _jsxs(_Fragment, { children: [essentials, _jsx(ExpandGroup, { header: 'Advanced Options', children: advanced })] });
        }
        else if (essentials) {
            return essentials;
        }
        else {
            return advanced;
        }
    };
    return ParameterControls;
}(React.PureComponent));
export { ParameterControls };
var ParameterMappingControl = /** @class */ (function (_super) {
    __extends(ParameterMappingControl, _super);
    function ParameterMappingControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isDisabled: false,
        };
        _this.setSettings = function (p, old) {
            var _a;
            var values = __assign(__assign({}, old), (_a = {}, _a[p.name] = p.value, _a));
            var t = _this.props.mapping.update(values, _this.plugin);
            _this.props.mapping.apply(t, _this.plugin);
        };
        return _this;
    }
    ParameterMappingControl.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, function () { return _this.forceUpdate(); });
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, function (v) {
            _this.setState({ isDisabled: v });
        });
    };
    ParameterMappingControl.prototype.render = function () {
        var t = this.props.mapping.getTarget(this.plugin);
        var values = this.props.mapping.getValues(t, this.plugin);
        var params = this.props.mapping.params(this.plugin);
        return _jsx(ParameterControls, { params: params, values: values, onChange: this.setSettings, isDisabled: this.state.isDisabled });
    };
    return ParameterMappingControl;
}(PluginUIComponent));
export { ParameterMappingControl };
function classifyParams(params) {
    function addParam(k, p, group) {
        var ctrl = controlFor(p);
        if (!ctrl)
            return;
        if (!p.category)
            group.params[0].push([k, p, ctrl]);
        else {
            if (!group.map)
                group.map = new Map();
            var c = group.map.get(p.category);
            if (!c) {
                c = [];
                group.map.set(p.category, c);
                group.params.push(c);
            }
            c.push([k, p, ctrl]);
        }
    }
    function sortGroups(x, y) {
        var a = x[0], b = y[0];
        if (!a || !a[1].category)
            return -1;
        if (!b || !b[1].category)
            return 1;
        return a[1].category < b[1].category ? -1 : 1;
    }
    var keys = Object.keys(params);
    var essentials = { params: [[]], map: void 0 };
    var advanced = { params: [[]], map: void 0 };
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var k = keys_1[_i];
        var p = params[k];
        if (p.isHidden)
            continue;
        if (p.isEssential)
            addParam(k, p, essentials);
        else
            addParam(k, p, advanced);
    }
    essentials.params.sort(sortGroups);
    advanced.params.sort(sortGroups);
    return { essentials: essentials.params, advanced: advanced.params };
}
function controlFor(param) {
    switch (param.type) {
        case 'value': return void 0;
        case 'boolean': return BoolControl;
        case 'number': return typeof param.min !== 'undefined' && typeof param.max !== 'undefined'
            ? NumberRangeControl : NumberInputControl;
        case 'converted': return ConvertedControl;
        case 'conditioned': return ConditionedControl;
        case 'multi-select': return MultiSelectControl;
        case 'color': return CombinedColorControl;
        case 'color-list': return param.offsets ? OffsetColorListControl : ColorListControl;
        case 'vec3': return Vec3Control;
        case 'mat4': return Mat4Control;
        case 'url': return UrlControl;
        case 'file': return FileControl;
        case 'file-list': return FileListControl;
        case 'select': return SelectControl;
        case 'value-ref': return ValueRefControl;
        case 'data-ref': return void 0;
        case 'text': return TextControl;
        case 'interval': return typeof param.min !== 'undefined' && typeof param.max !== 'undefined'
            ? BoundedIntervalControl : IntervalControl;
        case 'group': return GroupControl;
        case 'mapped': return MappedControl;
        case 'line-graph': return LineGraphControl;
        case 'script': return ScriptControl;
        case 'object-list': return ObjectListControl;
        default:
            var _ = param;
            console.warn("".concat(_, " has no associated UI component"));
            return void 0;
    }
}
var ParamHelp = /** @class */ (function (_super) {
    __extends(ParamHelp, _super);
    function ParamHelp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ParamHelp.prototype.render = function () {
        var _a = this.props, legend = _a.legend, description = _a.description;
        var Legend = legend && legendFor(legend);
        return _jsx("div", { className: 'msp-help-text', children: _jsxs("div", { children: [_jsxs("div", { className: 'msp-help-description', children: [_jsx(Icon, { svg: HelpOutlineSvg, inline: true }), description] }), Legend && _jsx("div", { className: 'msp-help-legend', children: _jsx(Legend, { legend: legend }) })] }) });
    };
    return ParamHelp;
}(React.PureComponent));
export { ParamHelp };
function renderSimple(options) {
    var props = options.props, state = options.state, control = options.control, toggleHelp = options.toggleHelp, addOn = options.addOn;
    var _className = [];
    if (props.param.shortLabel)
        _className.push('msp-control-label-short');
    if (props.param.twoColumns)
        _className.push('msp-control-col-2');
    var className = _className.join(' ');
    var label = props.param.label || camelCaseToWords(props.name);
    var help = props.param.help
        ? props.param.help(props.value)
        : { description: props.param.description, legend: props.param.legend };
    var hasHelp = help.description || help.legend;
    var desc = label + (hasHelp ? '. Click for help.' : '');
    return _jsxs(_Fragment, { children: [_jsx(ControlRow, { className: className, title: desc, label: _jsxs(_Fragment, { children: [label, hasHelp &&
                            _jsx("button", { className: 'msp-help msp-btn-link msp-btn-icon msp-control-group-expander', onClick: toggleHelp, title: desc || "".concat(state.showHelp ? 'Hide' : 'Show', " help"), style: { background: 'transparent', textAlign: 'left', padding: '0' }, children: _jsx(Icon, { svg: HelpOutlineSvg }) })] }), control: control }), hasHelp && state.showHelp && _jsx("div", { className: 'msp-control-offset', children: _jsx(ParamHelp, { legend: help.legend, description: help.description }) }), addOn] });
}
var SimpleParam = /** @class */ (function (_super) {
    __extends(SimpleParam, _super);
    function SimpleParam() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { showHelp: false };
        _this.toggleHelp = function () { return _this.setState({ showHelp: !_this.state.showHelp }); };
        return _this;
    }
    SimpleParam.prototype.update = function (value) {
        this.props.onChange({ param: this.props.param, name: this.props.name, value: value });
    };
    SimpleParam.prototype.renderAddOn = function () { return null; };
    SimpleParam.prototype.render = function () {
        return renderSimple({
            props: this.props,
            state: this.state,
            control: this.renderControl(),
            toggleHelp: this.toggleHelp,
            addOn: this.renderAddOn()
        });
    };
    return SimpleParam;
}(React.PureComponent));
export { SimpleParam };
var BoolControl = /** @class */ (function (_super) {
    __extends(BoolControl, _super);
    function BoolControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onClick = function (e) { _this.update(!_this.props.value); e.currentTarget.blur(); };
        return _this;
    }
    BoolControl.prototype.renderControl = function () {
        return _jsxs("button", { onClick: this.onClick, disabled: this.props.isDisabled, children: [_jsx(Icon, { svg: this.props.value ? CheckSvg : ClearSvg }), this.props.value ? 'On' : 'Off'] });
    };
    return BoolControl;
}(SimpleParam));
export { BoolControl };
var LineGraphControl = /** @class */ (function (_super) {
    __extends(LineGraphControl, _super);
    function LineGraphControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isExpanded: false,
            isOverPoint: false,
            message: "".concat(_this.props.param.defaultValue.length, " points"),
        };
        _this.onHover = function (point) {
            _this.setState({ isOverPoint: !_this.state.isOverPoint });
            if (point) {
                _this.setState({ message: _this.pointToLabel(point) });
            }
            else {
                _this.setState({ message: "".concat(_this.props.value.length, " points") });
            }
        };
        _this.onDrag = function (point) {
            _this.setState({ message: _this.pointToLabel(point) });
        };
        _this.onChange = function (value) {
            _this.props.onChange({ name: _this.props.name, param: _this.props.param, value: value });
        };
        _this.toggleExpanded = function (e) {
            _this.setState({ isExpanded: !_this.state.isExpanded });
            e.currentTarget.blur();
        };
        return _this;
    }
    LineGraphControl.prototype.pointToLabel = function (point) {
        var _a, _b;
        if (!point)
            return '';
        var volume = (_b = (_a = this.props.param).getVolume) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (volume) {
            var _c = volume.grid.stats, min = _c.min, max = _c.max, mean = _c.mean, sigma = _c.sigma;
            var v = min + (max - min) * point[0];
            var s = (v - mean) / sigma;
            return "(".concat(v.toFixed(2), " | ").concat(s.toFixed(2), "\u03C3, ").concat(point[1].toFixed(2), ")");
        }
        else {
            return "(".concat(point[0].toFixed(2), ", ").concat(point[1].toFixed(2), ")");
        }
    };
    LineGraphControl.prototype.render = function () {
        var _a, _b;
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: "".concat(this.state.message) }) }), _jsx("div", { className: 'msp-control-offset', style: { display: this.state.isExpanded ? 'block' : 'none', marginTop: 1 }, children: _jsx(LineGraphComponent, { data: this.props.value, volume: (_b = (_a = this.props.param).getVolume) === null || _b === void 0 ? void 0 : _b.call(_a), onChange: this.onChange, onHover: this.onHover, onDrag: this.onDrag }) })] });
    };
    return LineGraphControl;
}(React.PureComponent));
export { LineGraphControl };
var NumberInputControl = /** @class */ (function (_super) {
    __extends(NumberInputControl, _super);
    function NumberInputControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { value: '0' };
        _this.update = function (value) {
            var p = getPrecision(_this.props.param.step || 0.01);
            value = parseFloat(value.toFixed(p));
            _this.props.onChange({ param: _this.props.param, name: _this.props.name, value: value });
        };
        return _this;
    }
    NumberInputControl.prototype.render = function () {
        var placeholder = this.props.param.label || camelCaseToWords(this.props.name);
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        var p = getPrecision(this.props.param.step || 0.01);
        return _jsx(ControlRow, { title: this.props.param.description, label: label, control: _jsx(TextInput, { numeric: true, value: parseFloat(this.props.value.toFixed(p)), onEnter: this.props.onEnter, placeholder: placeholder, isDisabled: this.props.isDisabled, onChange: this.update }) });
    };
    return NumberInputControl;
}(React.PureComponent));
export { NumberInputControl };
var NumberRangeControl = /** @class */ (function (_super) {
    __extends(NumberRangeControl, _super);
    function NumberRangeControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChange = function (v) { _this.update(v); };
        return _this;
    }
    NumberRangeControl.prototype.renderControl = function () {
        var value = typeof this.props.value === 'undefined' ? this.props.param.defaultValue : this.props.value;
        return _jsx(Slider, { value: value, min: this.props.param.min, max: this.props.param.max, step: this.props.param.step, onChange: this.onChange, onChangeImmediate: this.props.param.immediateUpdate ? this.onChange : void 0, disabled: this.props.isDisabled, onEnter: this.props.onEnter });
    };
    return NumberRangeControl;
}(SimpleParam));
export { NumberRangeControl };
var TextControl = /** @class */ (function (_super) {
    __extends(TextControl, _super);
    function TextControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChange = function (e) {
            var value = e.target.value;
            if (value !== _this.props.value) {
                _this.update(value);
            }
        };
        _this.onKeyPress = function (e) {
            if ((e.keyCode === 13 || e.charCode === 13 || e.key === 'Enter')) {
                if (_this.props.onEnter)
                    _this.props.onEnter();
            }
            e.stopPropagation();
        };
        return _this;
    }
    TextControl.prototype.renderControl = function () {
        var placeholder = this.props.param.label || camelCaseToWords(this.props.name);
        return _jsx("input", { type: 'text', value: this.props.value || '', placeholder: placeholder, onChange: this.onChange, onKeyPress: this.props.onEnter ? this.onKeyPress : void 0, disabled: this.props.isDisabled });
    };
    return TextControl;
}(SimpleParam));
export { TextControl };
var PureSelectControl = /** @class */ (function (_super) {
    __extends(PureSelectControl, _super);
    function PureSelectControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChange = function (e) {
            if (typeof _this.props.param.defaultValue === 'number') {
                _this.update(parseInt(e.target.value, 10));
            }
            else {
                _this.update(e.target.value);
            }
        };
        return _this;
    }
    PureSelectControl.prototype.update = function (value) {
        this.props.onChange({ param: this.props.param, name: this.props.name, value: value });
    };
    PureSelectControl.prototype.render = function () {
        var _this = this;
        var isInvalid = this.props.value !== void 0 && !this.props.param.options.some(function (e) { return e[0] === _this.props.value; });
        return _jsxs("select", { className: 'msp-form-control', title: this.props.title, value: this.props.value !== void 0 ? this.props.value : this.props.param.defaultValue, onChange: this.onChange, disabled: this.props.isDisabled, children: [isInvalid && _jsx("option", { value: this.props.value, children: "[Invalid] ".concat(this.props.value) }, this.props.value), this.props.param.options.map(function (_a) {
                    var value = _a[0], label = _a[1];
                    return _jsx("option", { value: value, children: label }, value);
                })] });
    };
    return PureSelectControl;
}(React.PureComponent));
export { PureSelectControl };
var SelectControl = /** @class */ (function (_super) {
    __extends(SelectControl, _super);
    function SelectControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { showHelp: false, showOptions: false };
        _this.onSelect = function (item) {
            if (!item || item.value === _this.props.value) {
                _this.setState({ showOptions: false });
            }
            else {
                _this.setState({ showOptions: false }, function () {
                    _this.props.onChange({ param: _this.props.param, name: _this.props.name, value: item.value });
                });
            }
        };
        _this.toggle = function () { return _this.setState({ showOptions: !_this.state.showOptions }); };
        _this.cycle = function () {
            var options = _this.props.param.options;
            var current = options.findIndex(function (o) { return o[0] === _this.props.value; });
            var next = current === options.length - 1 ? 0 : current + 1;
            _this.props.onChange({ param: _this.props.param, name: _this.props.name, value: options[next][0] });
        };
        _this.items = memoizeLatest(function (param) { return ActionMenu.createItemsFromSelectOptions(param.options); });
        _this.toggleHelp = function () { return _this.setState({ showHelp: !_this.state.showHelp }); };
        return _this;
    }
    SelectControl.prototype.renderControl = function () {
        var _a;
        var items = this.items(this.props.param);
        var current = this.props.value !== undefined ? ActionMenu.findItem(items, this.props.value) : void 0;
        var label = current
            ? current.label
            : typeof this.props.value === 'undefined'
                ? "".concat(((_a = ActionMenu.getFirstItem(items)) === null || _a === void 0 ? void 0 : _a.label) || '', " [Default]")
                : "[Invalid] ".concat(this.props.value);
        var toggle = this.props.param.cycle ? this.cycle : this.toggle;
        var textAlign = this.props.param.cycle ? 'center' : 'left';
        var icon = this.props.param.cycle
            ? (this.props.value === 'on' ? CheckSvg
                : this.props.value === 'off' ? ClearSvg : void 0)
            : void 0;
        return _jsx(ToggleButton, { disabled: this.props.isDisabled, style: { textAlign: textAlign, overflow: 'hidden', textOverflow: 'ellipsis' }, label: label, title: label, icon: icon, toggle: toggle, isSelected: this.state.showOptions });
    };
    SelectControl.prototype.renderAddOn = function () {
        if (!this.state.showOptions)
            return null;
        var items = this.items(this.props.param);
        var current = ActionMenu.findItem(items, this.props.value);
        return _jsx(ActionMenu, { items: items, current: current, onSelect: this.onSelect });
    };
    SelectControl.prototype.render = function () {
        return renderSimple({
            props: this.props,
            state: this.state,
            control: this.renderControl(),
            toggleHelp: this.toggleHelp,
            addOn: this.renderAddOn()
        });
    };
    return SelectControl;
}(React.PureComponent));
export { SelectControl };
var ValueRefControl = /** @class */ (function (_super) {
    __extends(ValueRefControl, _super);
    function ValueRefControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { showHelp: false, showOptions: false };
        _this.onSelect = function (item) {
            if (!item || item.value === _this.props.value) {
                _this.setState({ showOptions: false });
            }
            else {
                _this.setState({ showOptions: false }, function () {
                    _this.props.onChange({ param: _this.props.param, name: _this.props.name, value: { ref: item.value } });
                });
            }
        };
        _this.toggle = function () { return _this.setState({ showOptions: !_this.state.showOptions }); };
        _this.toggleHelp = function () { return _this.setState({ showHelp: !_this.state.showHelp }); };
        return _this;
    }
    Object.defineProperty(ValueRefControl.prototype, "items", {
        get: function () {
            return ActionMenu.createItemsFromSelectOptions(this.props.param.getOptions(this.context));
        },
        enumerable: false,
        configurable: true
    });
    ValueRefControl.prototype.renderControl = function () {
        var _a;
        var items = this.items;
        var current = this.props.value.ref ? ActionMenu.findItem(items, this.props.value.ref) : void 0;
        var label = current
            ? current.label
            : "[Ref] ".concat((_a = this.props.value.ref) !== null && _a !== void 0 ? _a : '');
        return _jsx(ToggleButton, { disabled: this.props.isDisabled, style: { textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }, label: label, title: label, toggle: this.toggle, isSelected: this.state.showOptions });
    };
    ValueRefControl.prototype.renderAddOn = function () {
        if (!this.state.showOptions)
            return null;
        var items = this.items;
        var current = ActionMenu.findItem(items, this.props.value.ref);
        return _jsx(ActionMenu, { items: items, current: current, onSelect: this.onSelect });
    };
    ValueRefControl.prototype.render = function () {
        return renderSimple({
            props: this.props,
            state: this.state,
            control: this.renderControl(),
            toggleHelp: this.toggleHelp,
            addOn: this.renderAddOn()
        });
    };
    return ValueRefControl;
}(React.PureComponent));
export { ValueRefControl };
ValueRefControl.contextType = PluginReactContext;
var IntervalControl = /** @class */ (function (_super) {
    __extends(IntervalControl, _super);
    function IntervalControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isExpanded: false };
        _this.components = {
            0: PD.Numeric(0, { step: _this.props.param.step }, { label: 'Min' }),
            1: PD.Numeric(0, { step: _this.props.param.step }, { label: 'Max' })
        };
        _this.componentChange = function (_a) {
            var name = _a.name, value = _a.value;
            var v = __spreadArray([], _this.props.value, true);
            v[+name] = value;
            _this.change(v);
        };
        _this.toggleExpanded = function (e) {
            _this.setState({ isExpanded: !_this.state.isExpanded });
            e.currentTarget.blur();
        };
        return _this;
    }
    IntervalControl.prototype.change = function (value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value: value });
    };
    IntervalControl.prototype.render = function () {
        var v = this.props.value;
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        var p = getPrecision(this.props.param.step || 0.01);
        var value = "[".concat(v[0].toFixed(p), ", ").concat(v[1].toFixed(p), "]");
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: value }) }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: _jsx(ParameterControls, { params: this.components, values: v, onChange: this.componentChange, onEnter: this.props.onEnter }) })] });
    };
    return IntervalControl;
}(React.PureComponent));
export { IntervalControl };
var BoundedIntervalControl = /** @class */ (function (_super) {
    __extends(BoundedIntervalControl, _super);
    function BoundedIntervalControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChange = function (v) { _this.update(v); };
        return _this;
    }
    BoundedIntervalControl.prototype.renderControl = function () {
        return _jsx(Slider2, { value: this.props.value, min: this.props.param.min, max: this.props.param.max, step: this.props.param.step, onChange: this.onChange, disabled: this.props.isDisabled, onEnter: this.props.onEnter });
    };
    return BoundedIntervalControl;
}(SimpleParam));
export { BoundedIntervalControl };
var ColorControl = /** @class */ (function (_super) {
    __extends(ColorControl, _super);
    function ColorControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChange = function (e) {
            _this.update(Color(parseInt(e.target.value)));
        };
        return _this;
    }
    ColorControl.prototype.stripStyle = function () {
        return {
            background: Color.toStyle(this.props.value),
            position: 'absolute',
            bottom: '0',
            height: '4px',
            right: '0',
            left: '0'
        };
    };
    ColorControl.prototype.renderControl = function () {
        return _jsxs("div", { style: { position: 'relative' }, children: [_jsxs("select", { value: this.props.value, onChange: this.onChange, children: [ColorValueOption(this.props.value), ColorOptions()] }), _jsx("div", { style: this.stripStyle() })] });
    };
    return ColorControl;
}(SimpleParam));
export { ColorControl };
function colorEntryToStyle(e, includeOffset) {
    if (includeOffset === void 0) { includeOffset = false; }
    if (Array.isArray(e)) {
        if (includeOffset)
            return "".concat(Color.toStyle(e[0]), " ").concat((100 * e[1]).toFixed(2), "%");
        return Color.toStyle(e[0]);
    }
    return Color.toStyle(e);
}
var colorGradientInterpolated = memoize1(function (colors) {
    var styles = colors.map(function (c) { return colorEntryToStyle(c, true); });
    return "linear-gradient(to right, ".concat(styles.join(', '), ")");
});
var colorGradientBanded = memoize1(function (colors) {
    var n = colors.length;
    var styles = ["".concat(colorEntryToStyle(colors[0]), " ").concat(100 * (1 / n), "%")];
    // TODO: does this need to support offsets?
    for (var i = 1, il = n - 1; i < il; ++i) {
        styles.push("".concat(colorEntryToStyle(colors[i]), " ").concat(100 * (i / n), "%"), "".concat(colorEntryToStyle(colors[i]), " ").concat(100 * ((i + 1) / n), "%"));
    }
    styles.push("".concat(colorEntryToStyle(colors[n - 1]), " ").concat(100 * ((n - 1) / n), "%"));
    return "linear-gradient(to right, ".concat(styles.join(', '), ")");
});
function colorStripStyle(list, right) {
    if (right === void 0) { right = '0'; }
    return {
        background: colorGradient(list.colors, list.kind === 'set'),
        position: 'absolute',
        bottom: '0',
        height: '4px',
        right: right,
        left: '0'
    };
}
function colorGradient(colors, banded) {
    return banded ? colorGradientBanded(colors) : colorGradientInterpolated(colors);
}
function createColorListHelpers() {
    var addOn = function (l) {
        var preset = getColorListFromName(l[0]);
        return _jsx("div", { style: colorStripStyle({ kind: preset.type !== 'qualitative' ? 'interpolate' : 'set', colors: preset.list }) });
    };
    return {
        ColorPresets: {
            all: ActionMenu.createItemsFromSelectOptions(ColorListOptions, { addOn: addOn }),
            scale: ActionMenu.createItemsFromSelectOptions(ColorListOptionsScale, { addOn: addOn }),
            set: ActionMenu.createItemsFromSelectOptions(ColorListOptionsSet, { addOn: addOn })
        },
        ColorsParam: PD.ObjectList({ color: PD.Color(0x0) }, function (_a) {
            var color = _a.color;
            return Color.toHexString(color).toUpperCase();
        }),
        OffsetColorsParam: PD.ObjectList({ color: PD.Color(0x0), offset: PD.Numeric(0, { min: 0, max: 1, step: 0.01 }) }, function (_a) {
            var color = _a.color, offset = _a.offset;
            return "".concat(Color.toHexString(color).toUpperCase(), " [").concat(offset.toFixed(2), "]");
        }),
        IsInterpolatedParam: PD.Boolean(false, { label: 'Interpolated' })
    };
}
var _colorListHelpers;
function ColorListHelpers() {
    if (_colorListHelpers)
        return _colorListHelpers;
    _colorListHelpers = createColorListHelpers();
    return _colorListHelpers;
}
var ColorListControl = /** @class */ (function (_super) {
    __extends(ColorListControl, _super);
    function ColorListControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { showHelp: false, show: void 0 };
        _this.toggleEdit = function () { return _this.setState({ show: _this.state.show === 'edit' ? void 0 : 'edit' }); };
        _this.togglePresets = function () { return _this.setState({ show: _this.state.show === 'presets' ? void 0 : 'presets' }); };
        _this.selectPreset = function (item) {
            if (!item)
                return;
            _this.setState({ show: void 0 });
            var preset = getColorListFromName(item.value);
            _this.update({ kind: preset.type !== 'qualitative' ? 'interpolate' : 'set', colors: preset.list });
        };
        _this.colorsChanged = function (_a) {
            var value = _a.value;
            _this.update({
                kind: _this.props.value.kind,
                colors: value.map(function (c) { return c.color; })
            });
        };
        _this.isInterpolatedChanged = function (_a) {
            var value = _a.value;
            _this.update({ kind: value ? 'interpolate' : 'set', colors: _this.props.value.colors });
        };
        _this.toggleHelp = function () { return _this.setState({ showHelp: !_this.state.showHelp }); };
        return _this;
    }
    ColorListControl.prototype.update = function (value) {
        this.props.onChange({ param: this.props.param, name: this.props.name, value: value });
    };
    ColorListControl.prototype.renderControl = function () {
        var value = this.props.value;
        // TODO: fix the button right offset
        return _jsxs(_Fragment, { children: [_jsxs("button", { onClick: this.toggleEdit, style: { position: 'relative', paddingRight: '33px' }, children: [value.colors.length === 1 ? '1 color' : "".concat(value.colors.length, " colors"), _jsx("div", { style: colorStripStyle(value, '33px') })] }), _jsx(IconButton, { svg: BookmarksOutlinedSvg, onClick: this.togglePresets, toggleState: this.state.show === 'presets', title: 'Color Presets', style: { padding: 0, position: 'absolute', right: 0, top: 0, width: '32px' } })] });
    };
    ColorListControl.prototype.renderColors = function () {
        if (!this.state.show)
            return null;
        var _a = ColorListHelpers(), ColorPresets = _a.ColorPresets, ColorsParam = _a.ColorsParam, IsInterpolatedParam = _a.IsInterpolatedParam;
        var preset = ColorPresets[this.props.param.presetKind];
        if (this.state.show === 'presets')
            return _jsx(ActionMenu, { items: preset, onSelect: this.selectPreset });
        var values = this.props.value.colors.map(function (color) { return ({ color: color }); });
        return _jsxs("div", { className: 'msp-control-offset', children: [_jsx(ObjectListControl, { name: 'colors', param: ColorsParam, value: values, onChange: this.colorsChanged, isDisabled: this.props.isDisabled, onEnter: this.props.onEnter }), _jsx(BoolControl, { name: 'isInterpolated', param: IsInterpolatedParam, value: this.props.value.kind === 'interpolate', onChange: this.isInterpolatedChanged, isDisabled: this.props.isDisabled, onEnter: this.props.onEnter })] });
    };
    ColorListControl.prototype.render = function () {
        return renderSimple({
            props: this.props,
            state: this.state,
            control: this.renderControl(),
            toggleHelp: this.toggleHelp,
            addOn: this.renderColors()
        });
    };
    return ColorListControl;
}(React.PureComponent));
export { ColorListControl };
var OffsetColorListControl = /** @class */ (function (_super) {
    __extends(OffsetColorListControl, _super);
    function OffsetColorListControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { showHelp: false, show: void 0 };
        _this.toggleEdit = function () { return _this.setState({ show: _this.state.show === 'edit' ? void 0 : 'edit' }); };
        _this.togglePresets = function () { return _this.setState({ show: _this.state.show === 'presets' ? void 0 : 'presets' }); };
        _this.selectPreset = function (item) {
            if (!item)
                return;
            _this.setState({ show: void 0 });
            var preset = getColorListFromName(item.value);
            _this.update({ kind: preset.type !== 'qualitative' ? 'interpolate' : 'set', colors: preset.list });
        };
        _this.colorsChanged = function (_a) {
            var value = _a.value;
            var colors = value.map(function (c) { return [c.color, c.offset]; });
            colors.sort(function (a, b) { return a[1] - b[1]; });
            _this.update({ kind: _this.props.value.kind, colors: colors });
        };
        _this.isInterpolatedChanged = function (_a) {
            var value = _a.value;
            _this.update({ kind: value ? 'interpolate' : 'set', colors: _this.props.value.colors });
        };
        _this.toggleHelp = function () { return _this.setState({ showHelp: !_this.state.showHelp }); };
        return _this;
    }
    OffsetColorListControl.prototype.update = function (value) {
        this.props.onChange({ param: this.props.param, name: this.props.name, value: value });
    };
    OffsetColorListControl.prototype.renderControl = function () {
        var value = this.props.value;
        // TODO: fix the button right offset
        return _jsxs(_Fragment, { children: [_jsxs("button", { onClick: this.toggleEdit, style: { position: 'relative', paddingRight: '33px' }, children: [value.colors.length === 1 ? '1 color' : "".concat(value.colors.length, " colors"), _jsx("div", { style: colorStripStyle(value, '33px') })] }), _jsx(IconButton, { svg: BookmarksOutlinedSvg, onClick: this.togglePresets, toggleState: this.state.show === 'presets', title: 'Color Presets', style: { padding: 0, position: 'absolute', right: 0, top: 0, width: '32px' } })] });
    };
    OffsetColorListControl.prototype.renderColors = function () {
        if (!this.state.show)
            return null;
        var _a = ColorListHelpers(), ColorPresets = _a.ColorPresets, OffsetColorsParam = _a.OffsetColorsParam, IsInterpolatedParam = _a.IsInterpolatedParam;
        var preset = ColorPresets[this.props.param.presetKind];
        if (this.state.show === 'presets')
            return _jsx(ActionMenu, { items: preset, onSelect: this.selectPreset });
        var colors = this.props.value.colors;
        var values = colors.map(function (color, i) {
            if (Array.isArray(color))
                return { color: color[0], offset: color[1] };
            return { color: color, offset: i / colors.length };
        });
        values.sort(function (a, b) { return a.offset - b.offset; });
        return _jsxs("div", { className: 'msp-control-offset', children: [_jsx(ObjectListControl, { name: 'colors', param: OffsetColorsParam, value: values, onChange: this.colorsChanged, isDisabled: this.props.isDisabled, onEnter: this.props.onEnter }), _jsx(BoolControl, { name: 'isInterpolated', param: IsInterpolatedParam, value: this.props.value.kind === 'interpolate', onChange: this.isInterpolatedChanged, isDisabled: this.props.isDisabled, onEnter: this.props.onEnter })] });
    };
    OffsetColorListControl.prototype.render = function () {
        return renderSimple({
            props: this.props,
            state: this.state,
            control: this.renderControl(),
            toggleHelp: this.toggleHelp,
            addOn: this.renderColors()
        });
    };
    return OffsetColorListControl;
}(React.PureComponent));
export { OffsetColorListControl };
var Vec3Control = /** @class */ (function (_super) {
    __extends(Vec3Control, _super);
    function Vec3Control() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isExpanded: false };
        _this.components = {
            0: PD.Numeric(0, { step: _this.props.param.step }, { label: (_this.props.param.fieldLabels && _this.props.param.fieldLabels.x) || 'X' }),
            1: PD.Numeric(0, { step: _this.props.param.step }, { label: (_this.props.param.fieldLabels && _this.props.param.fieldLabels.y) || 'Y' }),
            2: PD.Numeric(0, { step: _this.props.param.step }, { label: (_this.props.param.fieldLabels && _this.props.param.fieldLabels.z) || 'Z' })
        };
        _this.componentChange = function (_a) {
            var name = _a.name, value = _a.value;
            var v = Vec3.copy(Vec3.zero(), _this.props.value);
            v[+name] = value;
            _this.change(v);
        };
        _this.toggleExpanded = function (e) {
            _this.setState({ isExpanded: !_this.state.isExpanded });
            e.currentTarget.blur();
        };
        return _this;
    }
    Vec3Control.prototype.change = function (value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value: value });
    };
    Vec3Control.prototype.render = function () {
        var v = this.props.value;
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        var p = getPrecision(this.props.param.step || 0.01);
        var value = "[".concat(v[0].toFixed(p), ", ").concat(v[1].toFixed(p), ", ").concat(v[2].toFixed(p), "]");
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: value }) }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: _jsx(ParameterControls, { params: this.components, values: v, onChange: this.componentChange, onEnter: this.props.onEnter }) })] });
    };
    return Vec3Control;
}(React.PureComponent));
export { Vec3Control };
var Mat4Control = /** @class */ (function (_super) {
    __extends(Mat4Control, _super);
    function Mat4Control() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isExpanded: false };
        _this.components = {
            json: PD.Text(JSON.stringify(Mat4()), { description: 'JSON array with 4x4 matrix in a column major (j * 4 + i indexing) format' })
        };
        _this.componentChange = function (_a) {
            var name = _a.name, value = _a.value;
            var v = Mat4.copy(Mat4(), _this.props.value);
            if (name === 'json') {
                Mat4.copy(v, JSON.parse(value));
            }
            else {
                v[+name] = value;
            }
            _this.change(v);
        };
        _this.toggleExpanded = function (e) {
            _this.setState({ isExpanded: !_this.state.isExpanded });
            e.currentTarget.blur();
        };
        return _this;
    }
    Mat4Control.prototype.change = function (value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value: value });
    };
    Mat4Control.prototype.changeValue = function (idx) {
        var _this = this;
        return function (v) {
            var m = Mat4.copy(Mat4(), _this.props.value);
            m[idx] = v;
            _this.change(m);
        };
    };
    Object.defineProperty(Mat4Control.prototype, "grid", {
        get: function () {
            var v = this.props.value;
            var rows = [];
            for (var i = 0; i < 4; i++) {
                var row = [];
                for (var j = 0; j < 4; j++) {
                    row.push(_jsx(TextInput, { numeric: true, delayMs: 50, value: Mat4.getValue(v, i, j), onChange: this.changeValue(4 * j + i), className: 'msp-form-control', blurOnEnter: true, isDisabled: this.props.isDisabled }, j));
                }
                rows.push(_jsx("div", { className: 'msp-flex-row', children: row }, i));
            }
            return _jsx("div", { className: 'msp-parameter-matrix', children: rows });
        },
        enumerable: false,
        configurable: true
    });
    Mat4Control.prototype.render = function () {
        var v = {
            json: JSON.stringify(this.props.value)
        };
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: '4\u00D74 Matrix' }) }), this.state.isExpanded && _jsxs("div", { className: 'msp-control-offset', children: [this.grid, _jsx(ParameterControls, { params: this.components, values: v, onChange: this.componentChange, onEnter: this.props.onEnter })] })] });
    };
    return Mat4Control;
}(React.PureComponent));
export { Mat4Control };
var UrlControl = /** @class */ (function (_super) {
    __extends(UrlControl, _super);
    function UrlControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChange = function (e) {
            var value = e.target.value;
            if (value !== Asset.getUrl(_this.props.value || '')) {
                _this.update(Asset.Url(value));
            }
        };
        _this.onKeyPress = function (e) {
            if ((e.keyCode === 13 || e.charCode === 13 || e.key === 'Enter')) {
                if (_this.props.onEnter)
                    _this.props.onEnter();
            }
            e.stopPropagation();
        };
        return _this;
    }
    UrlControl.prototype.renderControl = function () {
        var placeholder = this.props.param.label || camelCaseToWords(this.props.name);
        return _jsx("input", { type: 'text', value: Asset.getUrl(this.props.value || ''), placeholder: placeholder, onChange: this.onChange, onKeyPress: this.props.onEnter ? this.onKeyPress : void 0, disabled: this.props.isDisabled });
    };
    return UrlControl;
}(SimpleParam));
export { UrlControl };
var FileControl = /** @class */ (function (_super) {
    __extends(FileControl, _super);
    function FileControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { showHelp: false };
        _this.onChangeFile = function (e) {
            _this.change(e.target.files[0]);
        };
        _this.toggleHelp = function () { return _this.setState({ showHelp: !_this.state.showHelp }); };
        return _this;
    }
    FileControl.prototype.change = function (value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value: Asset.File(value) });
    };
    FileControl.prototype.renderControl = function () {
        var value = this.props.value;
        return _jsxs("div", { className: 'msp-btn msp-btn-block msp-btn-action msp-loader-msp-btn-file', style: { marginTop: '1px' }, children: [value ? value.name : 'Select a file...', " ", _jsx("input", { disabled: this.props.isDisabled, onChange: this.onChangeFile, type: 'file', multiple: false, accept: this.props.param.accept })] });
    };
    FileControl.prototype.render = function () {
        if (this.props.param.label) {
            return renderSimple({
                props: this.props,
                state: this.state,
                control: this.renderControl(),
                toggleHelp: this.toggleHelp,
                addOn: null
            });
        }
        else {
            return this.renderControl();
        }
    };
    return FileControl;
}(React.PureComponent));
export { FileControl };
var FileListControl = /** @class */ (function (_super) {
    __extends(FileListControl, _super);
    function FileListControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { showHelp: false };
        _this.onChangeFileList = function (e) {
            _this.change(e.target.files);
        };
        _this.toggleHelp = function () { return _this.setState({ showHelp: !_this.state.showHelp }); };
        return _this;
    }
    FileListControl.prototype.change = function (value) {
        var files = [];
        if (value) {
            for (var i = 0, il = value.length; i < il; ++i) {
                files.push(Asset.File(value[i]));
            }
        }
        this.props.onChange({ name: this.props.name, param: this.props.param, value: files });
    };
    FileListControl.prototype.renderControl = function () {
        var value = this.props.value;
        var names = [];
        if (value) {
            for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                var file = value_1[_i];
                names.push(file.name);
            }
        }
        var label = names.length === 0
            ? 'Select files...' : names.length === 1
            ? names[0] : "".concat(names.length, " files selected");
        return _jsxs("div", { className: 'msp-btn msp-btn-block msp-btn-action msp-loader-msp-btn-file', style: { marginTop: '1px' }, children: [label, " ", _jsx("input", { disabled: this.props.isDisabled, onChange: this.onChangeFileList, type: 'file', multiple: true, accept: this.props.param.accept })] });
    };
    FileListControl.prototype.render = function () {
        if (this.props.param.label) {
            return renderSimple({
                props: this.props,
                state: this.state,
                control: this.renderControl(),
                toggleHelp: this.toggleHelp,
                addOn: null
            });
        }
        else {
            return this.renderControl();
        }
    };
    return FileListControl;
}(React.PureComponent));
export { FileListControl };
var MultiSelectControl = /** @class */ (function (_super) {
    __extends(MultiSelectControl, _super);
    function MultiSelectControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isExpanded: false };
        _this.toggleExpanded = function (e) {
            _this.setState({ isExpanded: !_this.state.isExpanded });
            e.currentTarget.blur();
        };
        return _this;
    }
    MultiSelectControl.prototype.change = function (value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value: value });
    };
    MultiSelectControl.prototype.toggle = function (key) {
        var _this = this;
        return function (e) {
            if (_this.props.value.indexOf(key) < 0)
                _this.change(_this.props.value.concat(key));
            else
                _this.change(_this.props.value.filter(function (v) { return v !== key; }));
            e.currentTarget.blur();
        };
    };
    MultiSelectControl.prototype.render = function () {
        var _this = this;
        var current = this.props.value;
        var emptyLabel = this.props.param.emptyValue;
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: current.length === 0 && emptyLabel ? emptyLabel : "".concat(current.length, " of ").concat(this.props.param.options.length) }) }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: this.props.param.options.map(function (_a) {
                        var value = _a[0], label = _a[1];
                        var sel = current.indexOf(value) >= 0;
                        return _jsx(Button, { onClick: _this.toggle(value), disabled: _this.props.isDisabled, style: { marginTop: '1px' }, children: _jsx("span", { style: { float: sel ? 'left' : 'right' }, children: sel ? "\u2713 ".concat(label) : "".concat(label, " \u2717") }) }, value);
                    }) })] });
    };
    return MultiSelectControl;
}(React.PureComponent));
export { MultiSelectControl };
var GroupControl = /** @class */ (function (_super) {
    __extends(GroupControl, _super);
    function GroupControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isExpanded: !!_this.props.param.isExpanded, showPresets: false, showHelp: false };
        _this.onChangeParam = function (e) {
            var _a;
            _this.change(__assign(__assign({}, _this.props.value), (_a = {}, _a[e.name] = e.value, _a)));
        };
        _this.toggleExpanded = function () { return _this.setState({ isExpanded: !_this.state.isExpanded }); };
        _this.toggleShowPresets = function () { return _this.setState({ showPresets: !_this.state.showPresets }); };
        _this.presetItems = memoizeLatest(function (param) { var _a; return ActionMenu.createItemsFromSelectOptions((_a = param.presets) !== null && _a !== void 0 ? _a : []); });
        _this.onSelectPreset = function (item) {
            _this.setState({ showPresets: false });
            _this.change(item === null || item === void 0 ? void 0 : item.value);
        };
        return _this;
    }
    GroupControl.prototype.change = function (value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value: value });
    };
    GroupControl.prototype.pivotedPresets = function () {
        if (!this.props.param.presets)
            return null;
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        return _jsxs("div", { className: 'msp-control-group-wrapper', children: [_jsx("div", { className: 'msp-control-group-header', children: _jsxs("button", { className: 'msp-btn msp-form-control msp-btn-block', onClick: this.toggleShowPresets, children: [_jsx(Icon, { svg: BookmarksOutlinedSvg }), label, " Presets"] }) }), this.state.showPresets && _jsx(ActionMenu, { items: this.presetItems(this.props.param), onSelect: this.onSelectPreset })] });
    };
    GroupControl.prototype.presets = function () {
        if (!this.props.param.presets)
            return null;
        return _jsxs(_Fragment, { children: [_jsx("div", { className: 'msp-control-group-presets-wrapper', children: _jsx("div", { className: 'msp-control-group-header', children: _jsxs("button", { className: 'msp-btn msp-form-control msp-btn-block', onClick: this.toggleShowPresets, children: [_jsx(Icon, { svg: BookmarksOutlinedSvg }), "Presets"] }) }) }), this.state.showPresets && _jsx(ActionMenu, { items: this.presetItems(this.props.param), onSelect: this.onSelectPreset })] });
    };
    GroupControl.prototype.pivoted = function () {
        var key = this.props.param.pivot;
        var params = this.props.param.params;
        var pivot = params[key];
        var Control = controlFor(pivot);
        var ctrl = _jsx(Control, { name: key, param: pivot, value: this.props.value[key], onChange: this.onChangeParam, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled });
        if (!this.state.isExpanded) {
            return _jsxs("div", { className: 'msp-mapped-parameter-group', children: [ctrl, _jsx(IconButton, { svg: MoreHorizSvg, onClick: this.toggleExpanded, toggleState: this.state.isExpanded, title: "More Options" })] });
        }
        var filtered = Object.create(null);
        for (var _i = 0, _a = Object.keys(params); _i < _a.length; _i++) {
            var k = _a[_i];
            if (k !== key)
                filtered[k] = params[k];
        }
        return _jsxs("div", { className: 'msp-mapped-parameter-group', children: [ctrl, _jsx(IconButton, { svg: MoreHorizSvg, onClick: this.toggleExpanded, toggleState: this.state.isExpanded, title: "More Options" }), _jsxs("div", { className: 'msp-control-offset', children: [this.pivotedPresets(), _jsx(ParameterControls, { params: filtered, onEnter: this.props.onEnter, values: this.props.value, onChange: this.onChangeParam, isDisabled: this.props.isDisabled })] })] });
    };
    GroupControl.prototype.render = function () {
        var params = this.props.param.params;
        // Do not show if there are no params.
        if (Object.keys(params).length === 0)
            return null;
        if (this.props.param.pivot)
            return this.pivoted();
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        var controls = _jsx(ParameterControls, { params: params, onChange: this.onChangeParam, values: this.props.value, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled });
        if (this.props.inMapped) {
            return _jsx("div", { className: 'msp-control-offset', children: controls });
        }
        if (this.props.param.isFlat) {
            return controls;
        }
        return _jsxs("div", { className: 'msp-control-group-wrapper', style: { position: 'relative' }, children: [_jsx("div", { className: 'msp-control-group-header', children: _jsxs("button", { className: 'msp-btn msp-form-control msp-btn-block', onClick: this.toggleExpanded, children: [_jsx(Icon, { svg: this.state.isExpanded ? ArrowDropDownSvg : ArrowRightSvg }), label] }) }), this.presets(), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: controls })] });
    };
    return GroupControl;
}(React.PureComponent));
export { GroupControl };
var MappedControl = /** @class */ (function (_super) {
    __extends(MappedControl, _super);
    function MappedControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isExpanded: false };
        // TODO: this could lead to a rare bug where the component is reused with different mapped control.
        // I think there are currently no cases where this could happen in the UI, but still need to watch out..
        _this.valuesCache = {};
        _this.onChangeName = function (e) {
            _this.change({ name: e.value, params: _this.getValues(e.value) });
        };
        _this.onChangeParam = function (e) {
            _this.setValues(_this.props.value.name, e.value);
            _this.change({ name: _this.props.value.name, params: e.value });
        };
        _this.toggleExpanded = function () { return _this.setState({ isExpanded: !_this.state.isExpanded }); };
        return _this;
    }
    MappedControl.prototype.setValues = function (name, values) {
        this.valuesCache[name] = values;
    };
    MappedControl.prototype.getValues = function (name) {
        if (name in this.valuesCache) {
            return this.valuesCache[name];
        }
        else {
            return this.props.param.map(name).defaultValue;
        }
    };
    MappedControl.prototype.change = function (value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value: value });
    };
    MappedControl.prototype.areParamsEmpty = function (params) {
        for (var _i = 0, _a = Object.keys(params); _i < _a.length; _i++) {
            var k = _a[_i];
            if (!params[k].isHidden)
                return false;
        }
        return true;
    };
    MappedControl.prototype.render = function () {
        var _this = this;
        var value = this.props.value || this.props.param.defaultValue;
        var param = this.props.param.map(value.name);
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        var Mapped = controlFor(param);
        var help = this.props.param.help;
        var select = help
            ? __assign(__assign({}, this.props.param.select), { help: function (name) { return help({ name: name, params: _this.getValues(name) }); } }) : this.props.param.select;
        var Select = _jsx(SelectControl, { param: select, isDisabled: this.props.isDisabled, onChange: this.onChangeName, onEnter: this.props.onEnter, name: label, value: value.name });
        if (!Mapped) {
            return Select;
        }
        if (param.type === 'group' && !param.isFlat) {
            if (!this.areParamsEmpty(param.params)) {
                return _jsxs("div", { className: 'msp-mapped-parameter-group', children: [Select, _jsx(IconButton, { svg: MoreHorizSvg, onClick: this.toggleExpanded, toggleState: this.state.isExpanded, title: "".concat(label, " Properties") }), this.state.isExpanded && _jsx(GroupControl, { inMapped: true, param: param, value: value.params, name: value.name, onChange: this.onChangeParam, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled })] });
            }
            return Select;
        }
        return _jsxs(_Fragment, { children: [Select, _jsx(Mapped, { param: param, value: value.params, name: value.name, onChange: this.onChangeParam, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled })] });
    };
    return MappedControl;
}(React.PureComponent));
export { MappedControl };
var ObjectListEditor = /** @class */ (function (_super) {
    __extends(ObjectListEditor, _super);
    function ObjectListEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { current: _this.props.value };
        _this.onChangeParam = function (e) {
            var _a;
            _this.setState({ current: __assign(__assign({}, _this.state.current), (_a = {}, _a[e.name] = e.value, _a)) });
        };
        _this.apply = function () {
            _this.props.apply(_this.state.current);
        };
        return _this;
    }
    ObjectListEditor.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.params !== prevProps.params || this.props.value !== prevProps.value) {
            this.setState({ current: this.props.value });
        }
    };
    ObjectListEditor.prototype.render = function () {
        return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: this.props.params, onChange: this.onChangeParam, values: this.state.current, onEnter: this.apply, isDisabled: this.props.isDisabled }), _jsx("button", { className: "msp-btn msp-btn-block msp-form-control msp-control-top-offset", onClick: this.apply, disabled: this.props.isDisabled, children: this.props.isUpdate ? 'Update' : 'Add' })] });
    };
    return ObjectListEditor;
}(React.PureComponent));
var ObjectListItem = /** @class */ (function (_super) {
    __extends(ObjectListItem, _super);
    function ObjectListItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isExpanded: false };
        _this.update = function (v) {
            // this.setState({ isExpanded: false }); // TODO auto update? mark changed state?
            _this.props.actions.update(v, _this.props.index);
        };
        _this.moveUp = function () {
            _this.props.actions.move(_this.props.index, -1);
        };
        _this.moveDown = function () {
            _this.props.actions.move(_this.props.index, 1);
        };
        _this.remove = function () {
            _this.setState({ isExpanded: false });
            _this.props.actions.remove(_this.props.index);
        };
        _this.toggleExpanded = function (e) {
            _this.setState({ isExpanded: !_this.state.isExpanded });
            e.currentTarget.blur();
        };
        return _this;
    }
    ObjectListItem.prototype.render = function () {
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-param-object-list-item', children: [_jsxs("button", { className: 'msp-btn msp-btn-block msp-form-control', onClick: this.toggleExpanded, children: [_jsx("span", { children: "".concat(this.props.index + 1, ": ") }), this.props.param.getLabel(this.props.value)] }), _jsxs("div", { children: [_jsx(IconButton, { svg: ArrowDownwardSvg, title: 'Move Up', onClick: this.moveUp, small: true }), _jsx(IconButton, { svg: ArrowUpwardSvg, title: 'Move Down', onClick: this.moveDown, small: true }), _jsx(IconButton, { svg: DeleteOutlinedSvg, title: 'Remove', onClick: this.remove, small: true })] })] }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: _jsx(ObjectListEditor, { params: this.props.param.element, apply: this.update, value: this.props.value, isUpdate: true, isDisabled: this.props.isDisabled }) })] });
    };
    return ObjectListItem;
}(React.PureComponent));
var ObjectListControl = /** @class */ (function (_super) {
    __extends(ObjectListControl, _super);
    function ObjectListControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isExpanded: false };
        _this.add = function (v) {
            _this.change(__spreadArray(__spreadArray([], _this.props.value, true), [v], false));
        };
        _this.actions = {
            update: function (v, i) {
                var value = _this.props.value.slice(0);
                value[i] = v;
                _this.change(value);
            },
            move: function (i, dir) {
                var xs = _this.props.value;
                if (xs.length === 1)
                    return;
                var j = (i + dir) % xs.length;
                if (j < 0)
                    j += xs.length;
                xs = xs.slice(0);
                var t = xs[i];
                xs[i] = xs[j];
                xs[j] = t;
                _this.change(xs);
            },
            remove: function (i) {
                var xs = _this.props.value;
                var update = [];
                for (var j = 0; j < xs.length; j++) {
                    if (i !== j)
                        update.push(xs[j]);
                }
                _this.change(update);
            }
        };
        _this.toggleExpanded = function (e) {
            _this.setState({ isExpanded: !_this.state.isExpanded });
            e.currentTarget.blur();
        };
        return _this;
    }
    ObjectListControl.prototype.change = function (value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value: value });
    };
    ObjectListControl.prototype.render = function () {
        var _this = this;
        var v = this.props.value;
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        var value = "".concat(v.length, " item").concat(v.length !== 1 ? 's' : '');
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: value }) }), this.state.isExpanded && _jsxs("div", { className: 'msp-control-offset', children: [this.props.value.map(function (v, i) { return _jsx(ObjectListItem, { param: _this.props.param, value: v, index: i, actions: _this.actions, isDisabled: _this.props.isDisabled }, i); }), _jsx(ControlGroup, { header: 'New Item', children: _jsx(ObjectListEditor, { params: this.props.param.element, apply: this.add, value: this.props.param.ctor(), isDisabled: this.props.isDisabled }) })] })] });
    };
    return ObjectListControl;
}(React.PureComponent));
export { ObjectListControl };
var ConditionedControl = /** @class */ (function (_super) {
    __extends(ConditionedControl, _super);
    function ConditionedControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChangeCondition = function (e) {
            _this.change(_this.props.param.conditionedValue(_this.props.value, e.value));
        };
        _this.onChangeParam = function (e) {
            _this.change(e.value);
        };
        return _this;
    }
    ConditionedControl.prototype.change = function (value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value: value });
    };
    ConditionedControl.prototype.render = function () {
        var value = this.props.value;
        var condition = this.props.param.conditionForValue(value);
        var param = this.props.param.conditionParams[condition];
        var label = this.props.param.label || camelCaseToWords(this.props.name);
        var Conditioned = controlFor(param);
        var select = _jsx(SelectControl, { param: this.props.param.select, isDisabled: this.props.isDisabled, onChange: this.onChangeCondition, onEnter: this.props.onEnter, name: "".concat(label, " Kind"), value: condition });
        if (!Conditioned) {
            return select;
        }
        return _jsxs(_Fragment, { children: [select, _jsx(Conditioned, { param: param, value: value, name: label, onChange: this.onChangeParam, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled })] });
    };
    return ConditionedControl;
}(React.PureComponent));
export { ConditionedControl };
var ConvertedControl = /** @class */ (function (_super) {
    __extends(ConvertedControl, _super);
    function ConvertedControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChange = function (e) {
            _this.props.onChange({
                name: _this.props.name,
                param: _this.props.param,
                value: _this.props.param.toValue(e.value)
            });
        };
        return _this;
    }
    ConvertedControl.prototype.render = function () {
        var value = this.props.param.fromValue(this.props.value);
        var Converted = controlFor(this.props.param.converted);
        if (!Converted)
            return null;
        return _jsx(Converted, { param: this.props.param.converted, value: value, name: this.props.name, onChange: this.onChange, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled });
    };
    return ConvertedControl;
}(React.PureComponent));
export { ConvertedControl };
var ScriptControl = /** @class */ (function (_super) {
    __extends(ScriptControl, _super);
    function ScriptControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChange = function (_a) {
            var _b;
            var name = _a.name, value = _a.value;
            var k = name;
            if (value !== _this.props.value[k]) {
                _this.props.onChange({ param: _this.props.param, name: _this.props.name, value: __assign(__assign({}, _this.props.value), (_b = {}, _b[k] = value, _b)) });
            }
        };
        return _this;
    }
    ScriptControl.prototype.render = function () {
        // TODO: improve!
        var selectParam = {
            defaultValue: this.props.value.language,
            options: PD.objectToOptions(Script.Info),
            type: 'select',
        };
        var select = _jsx(SelectControl, { param: selectParam, isDisabled: this.props.isDisabled, onChange: this.onChange, onEnter: this.props.onEnter, name: 'language', value: this.props.value.language });
        var textParam = {
            defaultValue: this.props.value.language,
            type: 'text',
        };
        var text = _jsx(TextControl, { param: textParam, isDisabled: this.props.isDisabled, onChange: this.onChange, name: 'expression', value: this.props.value.expression });
        return _jsxs(_Fragment, { children: [select, this.props.value.language !== 'mol-script' && _jsxs("div", { className: 'msp-help-text', style: { padding: '10px' }, children: [_jsx(Icon, { svg: WarningSvg }), " Support for PyMOL, VMD, and Jmol selections is an experimental feature and may not always work as intended."] }), text] });
    };
    return ScriptControl;
}(React.PureComponent));
export { ScriptControl };
