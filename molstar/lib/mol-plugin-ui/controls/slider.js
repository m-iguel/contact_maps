import { __assign, __extends, __spreadArray } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { TextInput } from './common';
import { noop } from '../../mol-util';
var Slider = /** @class */ (function (_super) {
    __extends(Slider, _super);
    function Slider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isChanging: false, current: 0 };
        _this.begin = function () {
            _this.setState({ isChanging: true });
        };
        _this.end = function (v) {
            _this.setState({ isChanging: false });
            _this.props.onChange(v);
        };
        _this.updateCurrent = function (current) {
            var _a, _b;
            _this.setState({ current: current });
            (_b = (_a = _this.props).onChangeImmediate) === null || _b === void 0 ? void 0 : _b.call(_a, current);
        };
        _this.updateManually = function (v) {
            _this.setState({ isChanging: true });
            var n = v;
            if (_this.props.step === 1)
                n = Math.round(n);
            if (n < _this.props.min)
                n = _this.props.min;
            if (n > _this.props.max)
                n = _this.props.max;
            _this.setState({ current: n, isChanging: true });
        };
        _this.onManualBlur = function () {
            _this.setState({ isChanging: false });
            _this.props.onChange(_this.state.current);
        };
        return _this;
    }
    Slider.getDerivedStateFromProps = function (props, state) {
        if (state.isChanging || props.value === state.current)
            return null;
        return { current: props.value };
    };
    Slider.prototype.render = function () {
        var step = this.props.step;
        if (step === void 0)
            step = 1;
        return _jsxs("div", { className: 'msp-slider', children: [_jsx("div", { children: _jsx(SliderBase, { min: this.props.min, max: this.props.max, step: step, value: this.state.current, disabled: this.props.disabled, onBeforeChange: this.begin, onChange: this.updateCurrent, onAfterChange: this.end }) }), _jsx("div", { children: _jsx(TextInput, { numeric: true, delayMs: 50, value: this.state.current, blurOnEnter: true, onBlur: this.onManualBlur, isDisabled: this.props.disabled, onChange: this.updateManually }) })] });
    };
    return Slider;
}(React.Component));
export { Slider };
var Slider2 = /** @class */ (function (_super) {
    __extends(Slider2, _super);
    function Slider2() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isChanging: false, current: [0, 1] };
        _this.begin = function () {
            _this.setState({ isChanging: true });
        };
        _this.end = function (v) {
            _this.setState({ isChanging: false });
            _this.props.onChange(v);
        };
        _this.updateCurrent = function (current) {
            _this.setState({ current: current });
        };
        _this.updateMax = function (v) {
            var n = v;
            if (_this.props.step === 1)
                n = Math.round(n);
            if (n < _this.state.current[0])
                n = _this.state.current[0];
            else if (n < _this.props.min)
                n = _this.props.min;
            if (n > _this.props.max)
                n = _this.props.max;
            _this.props.onChange([_this.state.current[0], n]);
        };
        _this.updateMin = function (v) {
            var n = v;
            if (_this.props.step === 1)
                n = Math.round(n);
            if (n < _this.props.min)
                n = _this.props.min;
            if (n > _this.state.current[1])
                n = _this.state.current[1];
            else if (n > _this.props.max)
                n = _this.props.max;
            _this.props.onChange([n, _this.state.current[1]]);
        };
        return _this;
    }
    Slider2.getDerivedStateFromProps = function (props, state) {
        if (state.isChanging || (props.value[0] === state.current[0] && props.value[1] === state.current[1]))
            return null;
        return { current: props.value };
    };
    Slider2.prototype.render = function () {
        var step = this.props.step;
        if (step === void 0)
            step = 1;
        return _jsxs("div", { className: 'msp-slider2', children: [_jsx("div", { children: _jsx(TextInput, { numeric: true, delayMs: 50, value: this.state.current[0], onEnter: this.props.onEnter, blurOnEnter: true, isDisabled: this.props.disabled, onChange: this.updateMin }) }), _jsx("div", { children: _jsx(SliderBase, { min: this.props.min, max: this.props.max, step: step, value: this.state.current, disabled: this.props.disabled, onBeforeChange: this.begin, onChange: this.updateCurrent, onAfterChange: this.end, range: true, allowCross: true }) }), _jsx("div", { children: _jsx(TextInput, { numeric: true, delayMs: 50, value: this.state.current[1], onEnter: this.props.onEnter, blurOnEnter: true, isDisabled: this.props.disabled, onChange: this.updateMax }) })] });
    };
    return Slider2;
}(React.Component));
export { Slider2 };
/**
 * The following code was adapted from react-components/slider library.
 *
 * The MIT License (MIT)
 * Copyright (c) 2015-present Alipay.com, https://www.alipay.com/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function classNames(_classes) {
    var classes = [];
    var hasOwn = {}.hasOwnProperty;
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (!arg)
            continue;
        var argType = typeof arg;
        if (argType === 'string' || argType === 'number') {
            classes.push(arg);
        }
        else if (Array.isArray(arg)) {
            classes.push(classNames.apply(null, arg));
        }
        else if (argType === 'object') {
            for (var key in arg) {
                if (hasOwn.call(arg, key) && arg[key]) {
                    classes.push(key);
                }
            }
        }
    }
    return classes.join(' ');
}
function isNotTouchEvent(e) {
    return e.touches.length > 1 || (e.type.toLowerCase() === 'touchend' && e.touches.length > 0);
}
function getTouchPosition(vertical, e) {
    return vertical ? e.touches[0].clientY : e.touches[0].pageX;
}
function getMousePosition(vertical, e) {
    return vertical ? e.clientY : e.pageX;
}
function getHandleCenterPosition(vertical, handle) {
    var coords = handle.getBoundingClientRect();
    return vertical ?
        coords.top + (coords.height * 0.5) :
        coords.left + (coords.width * 0.5);
}
function pauseEvent(e) {
    e.stopPropagation();
    e.preventDefault();
}
var Handle = /** @class */ (function (_super) {
    __extends(Handle, _super);
    function Handle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Handle.prototype.render = function () {
        var _a = this.props, className = _a.className, tipFormatter = _a.tipFormatter, vertical = _a.vertical, offset = _a.offset, value = _a.value, index = _a.index;
        var style = vertical ? { bottom: "".concat(offset, "%") } : { left: "".concat(offset, "%") };
        return (_jsx("div", { className: className, style: style, title: tipFormatter(value, index) }));
    };
    return Handle;
}(React.Component));
export { Handle };
export var SliderBase = /** @class */ (function (_super) {
    __extends(SliderBase, _super);
    function SliderBase(props) {
        var _this = _super.call(this, props) || this;
        _this.sliderElement = React.createRef();
        _this.handleElements = [];
        _this.dragOffset = 0;
        _this.startPosition = 0;
        _this.startValue = 0;
        _this._getPointsCache = void 0;
        _this.onMouseDown = function (e) {
            if (e.button !== 0) {
                return;
            }
            var position = getMousePosition(_this.props.vertical, e);
            if (!_this.isEventFromHandle(e)) {
                _this.dragOffset = 0;
            }
            else {
                var handlePosition = getHandleCenterPosition(_this.props.vertical, e.target);
                _this.dragOffset = position - handlePosition;
                position = handlePosition;
            }
            _this.onStart(position);
            _this.addDocumentEvents('mouse');
            pauseEvent(e);
        };
        _this.onTouchMove = function (e) {
            if (isNotTouchEvent(e)) {
                _this.end('touch');
                return;
            }
            var position = getTouchPosition(_this.props.vertical, e);
            _this.onMove(e, position - _this.dragOffset);
        };
        _this.onTouchStart = function (e) {
            if (isNotTouchEvent(e))
                return;
            var position = getTouchPosition(_this.props.vertical, e);
            if (!_this.isEventFromHandle(e)) {
                _this.dragOffset = 0;
            }
            else {
                var handlePosition = getHandleCenterPosition(_this.props.vertical, e.target);
                _this.dragOffset = position - handlePosition;
                position = handlePosition;
            }
            _this.onStart(position);
            _this.addDocumentEvents('touch');
            pauseEvent(e);
        };
        _this.eventHandlers = {
            'touchmove': function (e) { return _this.onTouchMove(e); },
            'touchend': function (e) { return _this.end('touch'); },
            'mousemove': function (e) { return _this.onMouseMove(e); },
            'mouseup': function (e) { return _this.end('mouse'); },
        };
        _this.calcOffset = function (value) {
            var _a;
            var min = (_a = _this.props, _a.min), max = _a.max;
            var ratio = (value - min) / (max - min);
            return ratio * 100;
        };
        var range = props.range, min = props.min, max = props.max;
        var initialValue = range ? Array.apply(null, Array(+range + 1)).map(function () { return min; }) : min;
        var defaultValue = ('defaultValue' in props ? props.defaultValue : initialValue);
        var value = (props.value !== undefined ? props.value : defaultValue);
        var bounds = (range ? value : [min, value]).map(function (v) { return _this.trimAlignValue(v); });
        var recent;
        if (range && bounds[0] === bounds[bounds.length - 1] && bounds[0] === max) {
            recent = 0;
        }
        else {
            recent = bounds.length - 1;
        }
        _this.state = {
            handle: null,
            recent: recent,
            bounds: bounds,
        };
        return _this;
    }
    SliderBase.prototype.componentDidUpdate = function (prevProps) {
        var _this = this;
        if (!('value' in this.props || 'min' in this.props || 'max' in this.props))
            return;
        var bounds = this.state.bounds;
        if (prevProps.range) {
            var value = this.props.value || bounds;
            var nextBounds = value.map(function (v) { return _this.trimAlignValue(v, _this.props); });
            if (nextBounds.every(function (v, i) { return v === bounds[i]; }))
                return;
            this.setState({ bounds: nextBounds });
            if (bounds.some(function (v) { return _this.isValueOutOfBounds(v, _this.props); })) {
                this.props.onChange(nextBounds);
            }
        }
        else {
            var value = this.props.value !== undefined ? this.props.value : bounds[1];
            var nextValue = this.trimAlignValue(value, this.props);
            if (nextValue === bounds[1] && bounds[0] === prevProps.min)
                return;
            this.setState({ bounds: [prevProps.min, nextValue] });
            if (this.isValueOutOfBounds(bounds[1], this.props)) {
                this.props.onChange(nextValue);
            }
        }
    };
    SliderBase.prototype.onChange = function (state) {
        var props = this.props;
        var isNotControlled = !('value' in props);
        if (isNotControlled) {
            this.setState(state);
        }
        else if (state.handle !== undefined) {
            this.setState({ handle: state.handle });
        }
        var data = __assign(__assign({}, this.state), state);
        var changedValue = props.range ? data.bounds : data.bounds[1];
        props.onChange(changedValue);
    };
    SliderBase.prototype.onMouseMove = function (e) {
        var position = getMousePosition(this.props.vertical, e);
        this.onMove(e, position - this.dragOffset);
    };
    SliderBase.prototype.onMove = function (e, position) {
        pauseEvent(e);
        var props = this.props;
        var state = this.state;
        var diffPosition = position - this.startPosition;
        diffPosition = this.props.vertical ? -diffPosition : diffPosition;
        var diffValue = diffPosition / this.getSliderLength() * (props.max - props.min);
        var value = this.trimAlignValue(this.startValue + diffValue);
        var oldValue = state.bounds[state.handle];
        if (value === oldValue)
            return;
        var nextBounds = __spreadArray([], state.bounds, true);
        nextBounds[state.handle] = value;
        var nextHandle = state.handle;
        if (!!props.pushable) {
            var originalValue = state.bounds[nextHandle];
            this.pushSurroundingHandles(nextBounds, nextHandle, originalValue);
        }
        else if (props.allowCross) {
            nextBounds.sort(function (a, b) { return a - b; });
            nextHandle = nextBounds.indexOf(value);
        }
        this.onChange({
            handle: nextHandle,
            bounds: nextBounds,
        });
    };
    SliderBase.prototype.onStart = function (position) {
        var props = this.props;
        props.onBeforeChange(this.getValue());
        var value = this.calcValueByPos(position);
        this.startValue = value;
        this.startPosition = position;
        var state = this.state;
        var bounds = state.bounds;
        var valueNeedChanging = 1;
        if (this.props.range) {
            var closestBound = 0;
            for (var i = 1; i < bounds.length - 1; ++i) {
                if (value > bounds[i]) {
                    closestBound = i;
                }
            }
            if (Math.abs(bounds[closestBound + 1] - value) < Math.abs(bounds[closestBound] - value)) {
                closestBound = closestBound + 1;
            }
            valueNeedChanging = closestBound;
            var isAtTheSamePoint = (bounds[closestBound + 1] === bounds[closestBound]);
            if (isAtTheSamePoint) {
                valueNeedChanging = state.recent;
            }
            if (isAtTheSamePoint && (value !== bounds[closestBound + 1])) {
                valueNeedChanging = value < bounds[closestBound + 1] ? closestBound : closestBound + 1;
            }
        }
        this.setState({
            handle: valueNeedChanging,
            recent: valueNeedChanging,
        });
        var oldValue = state.bounds[valueNeedChanging];
        if (value === oldValue)
            return;
        var nextBounds = __spreadArray([], state.bounds, true);
        nextBounds[valueNeedChanging] = value;
        this.onChange({ bounds: nextBounds });
    };
    /**
     * Returns an array of possible slider points, taking into account both
     * `marks` and `step`. The result is cached.
     */
    SliderBase.prototype.getPoints = function () {
        var _a;
        var marks = (_a = this.props, _a.marks), step = _a.step, min = _a.min, max = _a.max;
        var cache = this._getPointsCache;
        if (!cache || cache.marks !== marks || cache.step !== step) {
            var pointsObject = __assign({}, marks);
            if (step !== null) {
                for (var point = min; point <= max; point += step) {
                    pointsObject[point] = point;
                }
            }
            var points = Object.keys(pointsObject).map(parseFloat);
            points.sort(function (a, b) { return a - b; });
            this._getPointsCache = { marks: marks, step: step, points: points };
        }
        return this._getPointsCache.points;
    };
    SliderBase.prototype.getPrecision = function (step) {
        var stepString = step.toString();
        var precision = 0;
        if (stepString.indexOf('.') >= 0) {
            precision = stepString.length - stepString.indexOf('.') - 1;
        }
        return precision;
    };
    SliderBase.prototype.getSliderLength = function () {
        var slider = this.sliderElement.current;
        if (!slider) {
            return 0;
        }
        return this.props.vertical ? slider.clientHeight : slider.clientWidth;
    };
    SliderBase.prototype.getSliderStart = function () {
        var slider = this.sliderElement.current;
        var rect = slider.getBoundingClientRect();
        return this.props.vertical ? rect.top : rect.left;
    };
    SliderBase.prototype.getValue = function () {
        var bounds = this.state.bounds;
        return (this.props.range ? bounds : bounds[1]);
    };
    SliderBase.prototype.addDocumentEvents = function (type) {
        if (type === 'touch') {
            document.addEventListener('touchmove', this.eventHandlers.touchmove);
            document.addEventListener('touchend', this.eventHandlers.touchend);
        }
        else if (type === 'mouse') {
            document.addEventListener('mousemove', this.eventHandlers.mousemove);
            document.addEventListener('mouseup', this.eventHandlers.mouseup);
        }
    };
    SliderBase.prototype.calcValue = function (offset) {
        var _a;
        var vertical = (_a = this.props, _a.vertical), min = _a.min, max = _a.max;
        var ratio = Math.abs(offset / this.getSliderLength());
        var value = vertical ? (1 - ratio) * (max - min) + min : ratio * (max - min) + min;
        return value;
    };
    SliderBase.prototype.calcValueByPos = function (position) {
        var pixelOffset = position - this.getSliderStart();
        var nextValue = this.trimAlignValue(this.calcValue(pixelOffset));
        return nextValue;
    };
    SliderBase.prototype.end = function (type) {
        this.removeEvents(type);
        this.props.onAfterChange(this.getValue());
        this.setState({ handle: null });
    };
    SliderBase.prototype.isEventFromHandle = function (e) {
        for (var _i = 0, _a = this.handleElements; _i < _a.length; _i++) {
            var h = _a[_i];
            if (h.current === e.target)
                return true;
        }
        return false;
    };
    SliderBase.prototype.isValueOutOfBounds = function (value, props) {
        return value < props.min || value > props.max;
    };
    SliderBase.prototype.pushHandle = function (bounds, handle, direction, amount) {
        var originalValue = bounds[handle];
        var currentValue = bounds[handle];
        while (direction * (currentValue - originalValue) < amount) {
            if (!this.pushHandleOnePoint(bounds, handle, direction)) {
                // can't push handle enough to create the needed `amount` gap, so we
                // revert its position to the original value
                bounds[handle] = originalValue;
                return false;
            }
            currentValue = bounds[handle];
        }
        // the handle was pushed enough to create the needed `amount` gap
        return true;
    };
    SliderBase.prototype.pushHandleOnePoint = function (bounds, handle, direction) {
        var points = this.getPoints();
        var pointIndex = points.indexOf(bounds[handle]);
        var nextPointIndex = pointIndex + direction;
        if (nextPointIndex >= points.length || nextPointIndex < 0) {
            // reached the minimum or maximum available point, can't push anymore
            return false;
        }
        var nextHandle = handle + direction;
        var nextValue = points[nextPointIndex];
        var threshold = this.props.pushable;
        var diffToNext = direction * (bounds[nextHandle] - nextValue);
        if (!this.pushHandle(bounds, nextHandle, direction, +threshold - diffToNext)) {
            // couldn't push next handle, so we won't push this one either
            return false;
        }
        // push the handle
        bounds[handle] = nextValue;
        return true;
    };
    SliderBase.prototype.pushSurroundingHandles = function (bounds, handle, originalValue) {
        var threshold = this.props.pushable;
        var value = bounds[handle];
        var direction = 0;
        if (bounds[handle + 1] - value < +threshold) {
            direction = +1;
        }
        else if (value - bounds[handle - 1] < +threshold) {
            direction = -1;
        }
        if (direction === 0) {
            return;
        }
        var nextHandle = handle + direction;
        var diffToNext = direction * (bounds[nextHandle] - value);
        if (!this.pushHandle(bounds, nextHandle, direction, +threshold - diffToNext)) {
            // revert to original value if pushing is impossible
            bounds[handle] = originalValue;
        }
    };
    SliderBase.prototype.removeEvents = function (type) {
        if (type === 'touch') {
            document.removeEventListener('touchmove', this.eventHandlers.touchmove);
            document.removeEventListener('touchend', this.eventHandlers.touchend);
        }
        else if (type === 'mouse') {
            document.removeEventListener('mousemove', this.eventHandlers.mousemove);
            document.removeEventListener('mouseup', this.eventHandlers.mouseup);
        }
    };
    SliderBase.prototype.trimAlignValue = function (v, props) {
        var _a, _b;
        var handle = (_a = (this.state || {}), _a.handle), bounds = _a.bounds;
        var marks = (_b = __assign(__assign({}, this.props), (props || {})), _b.marks), step = _b.step, min = _b.min, max = _b.max, allowCross = _b.allowCross;
        var val = v;
        if (val <= min) {
            val = min;
        }
        if (val >= max) {
            val = max;
        }
        /* eslint-disable eqeqeq */
        if (!allowCross && handle != null && handle > 0 && val <= bounds[handle - 1]) {
            val = bounds[handle - 1];
        }
        if (!allowCross && handle != null && handle < bounds.length - 1 && val >= bounds[handle + 1]) {
            val = bounds[handle + 1];
        }
        /* eslint-enable eqeqeq */
        var points = Object.keys(marks).map(parseFloat);
        if (step !== null) {
            var closestStep = (Math.round((val - min) / step) * step) + min;
            points.push(closestStep);
        }
        var diffs = points.map(function (point) { return Math.abs(val - point); });
        var closestPoint = points[diffs.indexOf(Math.min.apply(Math, diffs))];
        return step !== null ? parseFloat(closestPoint.toFixed(this.getPrecision(step))) : closestPoint;
    };
    SliderBase.prototype.render = function () {
        var _a, _b, _c;
        var _this = this;
        var handle = (_a = this.state, _a.handle), bounds = _a.bounds;
        var className = (_b = this.props, _b.className), prefixCls = _b.prefixCls, disabled = _b.disabled, vertical = _b.vertical, range = _b.range, step = _b.step, marks = _b.marks, tipFormatter = _b.tipFormatter;
        var customHandle = this.props.handle;
        var offsets = bounds.map(this.calcOffset);
        var handleClassName = "".concat(prefixCls, "-handle");
        var handlesClassNames = bounds.map(function (v, i) {
            var _a;
            return classNames((_a = {},
                _a[handleClassName] = true,
                _a["".concat(handleClassName, "-").concat(i + 1)] = true,
                _a["".concat(handleClassName, "-lower")] = i === 0,
                _a["".concat(handleClassName, "-upper")] = i === bounds.length - 1,
                _a));
        });
        var isNoTip = (step === null) || (tipFormatter === null);
        var commonHandleProps = {
            prefixCls: prefixCls,
            noTip: isNoTip,
            tipFormatter: tipFormatter,
            vertical: vertical,
        };
        if (this.handleElements.length !== bounds.length) {
            this.handleElements = []; // = [];
            for (var i = 0; i < bounds.length; i++)
                this.handleElements.push(React.createRef());
        }
        var handles = bounds.map(function (v, i) { return React.cloneElement(customHandle, __assign(__assign({}, commonHandleProps), { className: handlesClassNames[i], value: v, offset: offsets[i], dragging: handle === i, index: i, key: i, ref: _this.handleElements[i] })); });
        if (!range) {
            handles.shift();
        }
        var sliderClassName = classNames((_c = {},
            _c[prefixCls] = true,
            _c["".concat(prefixCls, "-with-marks")] = Object.keys(marks).length,
            _c["".concat(prefixCls, "-disabled")] = disabled,
            _c["".concat(prefixCls, "-vertical")] = this.props.vertical,
            _c[className] = !!className,
            _c));
        return (_jsxs("div", { ref: this.sliderElement, className: sliderClassName, onTouchStart: disabled ? noop : this.onTouchStart, onMouseDown: disabled ? noop : this.onMouseDown, children: [_jsx("div", { className: "".concat(prefixCls, "-rail") }), handles] }));
    };
    SliderBase.defaultProps = {
        prefixCls: 'msp-slider-base',
        className: '',
        min: 0,
        max: 100,
        step: 1,
        marks: {},
        handle: _jsx(Handle, { className: '', vertical: false, offset: 0, tipFormatter: function (v) { return v; }, value: 0, index: 0 }),
        onBeforeChange: noop,
        onChange: noop,
        onAfterChange: noop,
        tipFormatter: function (value, index) { return value; },
        disabled: false,
        range: false,
        vertical: false,
        allowCross: true,
        pushable: false,
    };
    return SliderBase;
}(React.Component));
