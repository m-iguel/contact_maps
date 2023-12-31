import { __assign, __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginUIComponent } from '../base';
import { VolumeStreaming } from '../../mol-plugin/behavior/dynamic/volume-streaming/behavior';
import { ExpandableControlRow, IconButton } from '../controls/common';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ParameterControls } from '../controls/parameters';
import { Slider } from '../controls/slider';
import { Volume } from '../../mol-model/volume';
import { Vec3 } from '../../mol-math/linear-algebra';
import { ColorNames } from '../../mol-util/color/names';
import { toPrecision } from '../../mol-util/number';
import { StateSelection } from '../../mol-state';
import { setSubtreeVisibility } from '../../mol-plugin/behavior/static/state';
import { VisibilityOutlinedSvg, VisibilityOffOutlinedSvg } from '../controls/icons';
var ChannelParams = {
    color: PD.Color(ColorNames.black, { description: 'Display color of the volume.' }),
    wireframe: PD.Boolean(false, { description: 'Control display of the volume as a wireframe.' }),
    opacity: PD.Numeric(0.3, { min: 0, max: 1, step: 0.01 }, { description: 'Opacity of the volume.' })
};
var Bounds = new Map([
    ['em', [-5, 5]],
    ['2fo-fc', [0, 3]],
    ['fo-fc(+ve)', [1, 5]],
    ['fo-fc(-ve)', [-5, -1]],
]);
var Channel = /** @class */ (function (_super) {
    __extends(Channel, _super);
    function Channel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ref = StateSelection.findTagInSubtree(_this.plugin.state.data.tree, _this.props.bCell.transform.ref, _this.props.name);
        _this.getVisible = function () {
            var state = _this.plugin.state.data;
            var ref = _this.ref;
            if (!ref)
                return false;
            return !state.cells.get(ref).state.isHidden;
        };
        _this.toggleVisible = function () {
            var state = _this.plugin.state.data;
            var ref = _this.ref;
            if (!ref)
                return;
            setSubtreeVisibility(state, ref, !state.cells.get(ref).state.isHidden);
        };
        return _this;
    }
    Channel.prototype.componentDidUpdate = function () {
        this.ref = StateSelection.findTagInSubtree(this.plugin.state.data.tree, this.props.bCell.transform.ref, this.props.name);
    };
    Channel.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.data.events.cell.stateUpdated, function (e) {
            if (_this.ref === e.ref)
                _this.forceUpdate();
        });
    };
    Channel.prototype.render = function () {
        var props = this.props;
        var isRelative = props.isRelative, stats = props.stats;
        var channel = props.channels[props.name];
        var min = stats.min, max = stats.max, mean = stats.mean, sigma = stats.sigma;
        var value = Math.round(100 * (channel.isoValue.kind === 'relative' ? channel.isoValue.relativeValue : channel.isoValue.absoluteValue)) / 100;
        var relMin = (min - mean) / sigma;
        var relMax = (max - mean) / sigma;
        if (!this.props.isUnbounded) {
            var bounds = Bounds.get(this.props.name);
            if (this.props.name === 'em') {
                relMin = Math.max(bounds[0], relMin);
                relMax = Math.min(bounds[1], relMax);
            }
            else {
                relMin = bounds[0];
                relMax = bounds[1];
            }
        }
        var vMin = mean + sigma * relMin, vMax = mean + sigma * relMax;
        var step = toPrecision(isRelative ? Math.round(((vMax - vMin) / sigma)) / 100 : sigma / 100, 2);
        var ctrlMin = isRelative ? relMin : vMin;
        var ctrlMax = isRelative ? relMax : vMax;
        return _jsx(ExpandableControlRow, { label: props.label + (props.isRelative ? ' \u03C3' : ''), colorStripe: channel.color, pivot: _jsxs("div", { className: 'msp-volume-channel-inline-controls', children: [_jsx(Slider, { value: value, min: ctrlMin, max: ctrlMax, step: step, onChange: function (v) { return props.changeIso(props.name, v, isRelative); }, onChangeImmediate: function (v) { return props.changeIso(props.name, v, isRelative); }, disabled: props.params.isDisabled, onEnter: props.params.events.onEnter }), _jsx(IconButton, { svg: this.getVisible() ? VisibilityOutlinedSvg : VisibilityOffOutlinedSvg, onClick: this.toggleVisible, toggleState: false, disabled: props.params.isDisabled })] }), controls: _jsx(ParameterControls, { onChange: function (_a) {
                    var name = _a.name, value = _a.value;
                    return props.changeParams(props.name, name, value);
                }, params: ChannelParams, values: channel, onEnter: props.params.events.onEnter, isDisabled: props.params.isDisabled }) });
    };
    return Channel;
}(PluginUIComponent));
var VolumeStreamingCustomControls = /** @class */ (function (_super) {
    __extends(VolumeStreamingCustomControls, _super);
    function VolumeStreamingCustomControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.changeIso = function (name, value, isRelative) {
            var _a;
            var old = _this.props.params;
            _this.newParams(__assign(__assign({}, old), { entry: {
                    name: old.entry.name,
                    params: __assign(__assign({}, old.entry.params), { channels: __assign(__assign({}, old.entry.params.channels), (_a = {}, _a[name] = __assign(__assign({}, old.entry.params.channels[name]), { isoValue: isRelative ? Volume.IsoValue.relative(value) : Volume.IsoValue.absolute(value) }), _a)) })
                } }));
        };
        _this.changeParams = function (name, param, value) {
            var _a, _b;
            var old = _this.props.params;
            _this.newParams(__assign(__assign({}, old), { entry: {
                    name: old.entry.name,
                    params: __assign(__assign({}, old.entry.params), { channels: __assign(__assign({}, old.entry.params.channels), (_a = {}, _a[name] = __assign(__assign({}, old.entry.params.channels[name]), (_b = {}, _b[param] = value, _b)), _a)) })
                } }));
        };
        _this.changeOption = function (_a) {
            var name = _a.name, value = _a.value;
            var old = _this.props.params;
            if (name === 'entry') {
                _this.newParams(__assign(__assign({}, old), { entry: {
                        name: value,
                        params: old.entry.params,
                    } }));
            }
            else {
                var b = _this.props.b.data;
                var isEM = b.info.kind === 'em';
                var isRelative = value.params.isRelative;
                var sampling = b.info.header.sampling[0];
                var oldChannels = old.entry.params.channels;
                var oldView = old.entry.params.view.name === value.name
                    ? old.entry.params.view.params
                    : _this.props.info.params
                        .entry.map(old.entry.name)
                        .params
                        .view.map(value.name).defaultValue;
                var viewParams = __assign({}, oldView);
                if (value.name === 'selection-box') {
                    viewParams.radius = value.params.radius;
                }
                else if (value.name === 'camera-target') {
                    viewParams.radius = value.params.radius;
                    viewParams.dynamicDetailLevel = value.params.dynamicDetailLevel;
                }
                else if (value.name === 'box') {
                    viewParams.bottomLeft = value.params.bottomLeft;
                    viewParams.topRight = value.params.topRight;
                }
                else if (value.name === 'auto') {
                    viewParams.radius = value.params.radius;
                    viewParams.selectionDetailLevel = value.params.selectionDetailLevel;
                }
                viewParams.isUnbounded = !!value.params.isUnbounded;
                _this.newParams(__assign(__assign({}, old), { entry: {
                        name: old.entry.name,
                        params: __assign(__assign({}, old.entry.params), { view: {
                                name: value.name,
                                params: viewParams
                            }, detailLevel: value.params.detailLevel, channels: isEM
                                ? { em: _this.convert(oldChannels.em, sampling.valuesInfo[0], isRelative) }
                                : {
                                    '2fo-fc': _this.convert(oldChannels['2fo-fc'], sampling.valuesInfo[0], isRelative),
                                    'fo-fc(+ve)': _this.convert(oldChannels['fo-fc(+ve)'], sampling.valuesInfo[1], isRelative),
                                    'fo-fc(-ve)': _this.convert(oldChannels['fo-fc(-ve)'], sampling.valuesInfo[1], isRelative)
                                } })
                    } }));
            }
        };
        return _this;
    }
    VolumeStreamingCustomControls.prototype.areInitial = function (params) {
        return PD.areEqual(this.props.info.params, params, this.props.info.initialValues);
    };
    VolumeStreamingCustomControls.prototype.newParams = function (params) {
        this.props.events.onChange(params, this.areInitial(params));
    };
    VolumeStreamingCustomControls.prototype.convert = function (channel, stats, isRelative) {
        return __assign(__assign({}, channel), { isoValue: isRelative
                ? Volume.IsoValue.toRelative(channel.isoValue, stats)
                : Volume.IsoValue.toAbsolute(channel.isoValue, stats) });
    };
    VolumeStreamingCustomControls.prototype.render = function () {
        if (!this.props.b)
            return null;
        var b = this.props.b.data;
        var isEM = b.info.kind === 'em';
        var pivot = isEM ? 'em' : '2fo-fc';
        var params = this.props.params;
        var entry = this.props.info.params
            .entry.map(params.entry.name);
        var detailLevel = entry.params.detailLevel;
        var dynamicDetailLevel = __assign(__assign({}, detailLevel), { label: 'Dynamic Detail', defaultValue: entry.params.view.map('camera-target').params.dynamicDetailLevel.defaultValue });
        var selectionDetailLevel = __assign(__assign({}, detailLevel), { label: 'Selection Detail', defaultValue: entry.params.view.map('auto').params.selectionDetailLevel.defaultValue });
        var sampling = b.info.header.sampling[0];
        var isRelative = params.entry.params.channels[pivot].isoValue.kind === 'relative';
        var isRelativeParam = PD.Boolean(isRelative, { description: 'Use normalized or absolute isocontour scale.', label: 'Normalized' });
        var isUnbounded = !!params.entry.params.view.params.isUnbounded;
        var isUnboundedParam = PD.Boolean(isUnbounded, { description: 'Show full/limited range of iso-values for more fine-grained control.', label: 'Unbounded' });
        var isOff = params.entry.params.view.name === 'off';
        // TODO: factor common things out, cache
        var OptionsParams = {
            entry: PD.Select(params.entry.name, b.data.entries.map(function (info) { return [info.dataId, info.dataId]; }), { isHidden: isOff, description: 'Which entry with volume data to display.' }),
            view: PD.MappedStatic(params.entry.params.view.name, {
                'off': PD.Group({
                    isRelative: PD.Boolean(isRelative, { isHidden: true }),
                    isUnbounded: PD.Boolean(isUnbounded, { isHidden: true }),
                }, { description: 'Display off.' }),
                'box': PD.Group({
                    bottomLeft: PD.Vec3(Vec3.zero()),
                    topRight: PD.Vec3(Vec3.zero()),
                    detailLevel: detailLevel,
                    isRelative: isRelativeParam,
                    isUnbounded: isUnboundedParam,
                }, { description: 'Static box defined by cartesian coords.' }),
                'selection-box': PD.Group({
                    radius: PD.Numeric(5, { min: 0, max: 50, step: 0.5 }, { description: 'Radius in \u212B within which the volume is shown.' }),
                    detailLevel: detailLevel,
                    isRelative: isRelativeParam,
                    isUnbounded: isUnboundedParam,
                }, { description: 'Box around focused element.' }),
                'camera-target': PD.Group({
                    radius: PD.Numeric(0.5, { min: 0, max: 1, step: 0.05 }, { description: 'Radius within which the volume is shown (relative to the field of view).' }),
                    detailLevel: __assign(__assign({}, detailLevel), { isHidden: true }),
                    dynamicDetailLevel: dynamicDetailLevel,
                    isRelative: isRelativeParam,
                    isUnbounded: isUnboundedParam,
                }, { description: 'Box around camera target.' }),
                'cell': PD.Group({
                    detailLevel: detailLevel,
                    isRelative: isRelativeParam,
                    isUnbounded: isUnboundedParam,
                }, { description: 'Box around the structure\'s bounding box.' }),
                'auto': PD.Group({
                    radius: PD.Numeric(5, { min: 0, max: 50, step: 0.5 }, { description: 'Radius in \u212B within which the volume is shown.' }),
                    detailLevel: detailLevel,
                    selectionDetailLevel: selectionDetailLevel,
                    isRelative: isRelativeParam,
                    isUnbounded: isUnboundedParam,
                }, { description: 'Box around focused element.' }),
            }, { options: VolumeStreaming.ViewTypeOptions, description: 'Controls what of the volume is displayed. "Off" hides the volume alltogether. "Bounded box" shows the volume inside the given box. "Around Focus" shows the volume around the element/atom last interacted with. "Around Camera" shows the volume around the point the camera is targeting. "Whole Structure" shows the volume for the whole structure.' })
        };
        var options = {
            entry: params.entry.name,
            view: {
                name: params.entry.params.view.name,
                params: {
                    detailLevel: params.entry.params.detailLevel,
                    radius: params.entry.params.view.params.radius,
                    bottomLeft: params.entry.params.view.params.bottomLeft,
                    topRight: params.entry.params.view.params.topRight,
                    selectionDetailLevel: params.entry.params.view.params.selectionDetailLevel,
                    dynamicDetailLevel: params.entry.params.view.params.dynamicDetailLevel,
                    isRelative: isRelative,
                    isUnbounded: isUnbounded
                }
            }
        };
        if (isOff) {
            return _jsx(ParameterControls, { onChange: this.changeOption, params: OptionsParams, values: options, onEnter: this.props.events.onEnter, isDisabled: this.props.isDisabled });
        }
        return _jsxs(_Fragment, { children: [!isEM && _jsx(Channel, { label: '2Fo-Fc', name: '2fo-fc', bCell: this.props.bCell, channels: params.entry.params.channels, changeIso: this.changeIso, changeParams: this.changeParams, isRelative: isRelative, params: this.props, stats: sampling.valuesInfo[0], isUnbounded: isUnbounded }), !isEM && _jsx(Channel, { label: 'Fo-Fc(+ve)', name: 'fo-fc(+ve)', bCell: this.props.bCell, channels: params.entry.params.channels, changeIso: this.changeIso, changeParams: this.changeParams, isRelative: isRelative, params: this.props, stats: sampling.valuesInfo[1], isUnbounded: isUnbounded }), !isEM && _jsx(Channel, { label: 'Fo-Fc(-ve)', name: 'fo-fc(-ve)', bCell: this.props.bCell, channels: params.entry.params.channels, changeIso: this.changeIso, changeParams: this.changeParams, isRelative: isRelative, params: this.props, stats: sampling.valuesInfo[1], isUnbounded: isUnbounded }), isEM && _jsx(Channel, { label: 'EM', name: 'em', bCell: this.props.bCell, channels: params.entry.params.channels, changeIso: this.changeIso, changeParams: this.changeParams, isRelative: isRelative, params: this.props, stats: sampling.valuesInfo[0], isUnbounded: isUnbounded }), _jsx(ParameterControls, { onChange: this.changeOption, params: OptionsParams, values: options, onEnter: this.props.events.onEnter, isDisabled: this.props.isDisabled })] });
    };
    return VolumeStreamingCustomControls;
}(PluginUIComponent));
export { VolumeStreamingCustomControls };
