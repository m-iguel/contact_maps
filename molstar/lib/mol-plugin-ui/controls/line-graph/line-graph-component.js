import { __extends } from "tslib";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Paul Luna <paulluna0215@gmail.com>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PointComponent } from './point-component';
import * as React from 'react';
import { Vec2 } from '../../../mol-math/linear-algebra';
import { Grid } from '../../../mol-model/volume';
import { arrayMax } from '../../../mol-util/array';
var LineGraphComponent = /** @class */ (function (_super) {
    __extends(LineGraphComponent, _super);
    function LineGraphComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleKeyDown = function (event) {
            // TODO: set canSelectMultiple = true
        };
        _this.handleKeyUp = function (event) {
            // TODO: SET canSelectMultiple = fasle
        };
        _this.handleClick = function (id) { return function (event) {
            // TODO: add point to selected array
        }; };
        _this.handleMouseDown = function (id) { return function (event) {
            if (id === 0 || id === _this.state.points.length - 1) {
                return;
            }
            if (_this.state.canSelectMultiple) {
                return;
            }
            var copyPoint = _this.normalizePoint(Vec2.create(_this.state.points[id][0], _this.state.points[id][1]));
            _this.ghostPoints.push(document.createElementNS(_this.namespace, 'circle'));
            _this.ghostPoints[0].setAttribute('r', '10');
            _this.ghostPoints[0].setAttribute('fill', 'orange');
            _this.ghostPoints[0].setAttribute('cx', "".concat(copyPoint[0]));
            _this.ghostPoints[0].setAttribute('cy', "".concat(copyPoint[1]));
            _this.ghostPoints[0].setAttribute('style', 'display: none');
            _this.gElement.appendChild(_this.ghostPoints[0]);
            _this.updatedX = copyPoint[0];
            _this.updatedY = copyPoint[1];
            _this.selected = [id];
        }; };
        _this.deletePoint = function (i) { return function (event) {
            if (i === 0 || i === _this.state.points.length - 1) {
                return;
            }
            var points = _this.state.points.filter(function (_, j) { return j !== i; });
            points.sort(function (a, b) {
                if (a[0] === b[0]) {
                    if (a[0] === 0) {
                        return a[1] - b[1];
                    }
                    if (a[1] === 1) {
                        return b[1] - a[1];
                    }
                    return a[1] - b[1];
                }
                return a[0] - b[0];
            });
            _this.setState({ points: points });
            _this.change(points);
            event.stopPropagation();
        }; };
        _this.myRef = React.createRef();
        _this.state = {
            points: [
                Vec2.create(0, 0),
                Vec2.create(1, 0)
            ],
            copyPoint: undefined,
            canSelectMultiple: false,
        };
        _this.height = 400;
        _this.width = 600;
        _this.padding = 70;
        _this.selected = undefined;
        _this.ghostPoints = [];
        _this.namespace = 'http://www.w3.org/2000/svg';
        for (var _i = 0, _a = _this.props.data; _i < _a.length; _i++) {
            var point = _a[_i];
            _this.state.points.push(point);
        }
        _this.state.points.sort(function (a, b) {
            if (a[0] === b[0]) {
                if (a[0] === 0) {
                    return a[1] - b[1];
                }
                if (a[1] === 1) {
                    return b[1] - a[1];
                }
                return a[1] - b[1];
            }
            return a[0] - b[0];
        });
        _this.handleDrag = _this.handleDrag.bind(_this);
        _this.handleMultipleDrag = _this.handleMultipleDrag.bind(_this);
        _this.handleDoubleClick = _this.handleDoubleClick.bind(_this);
        _this.refCallBack = _this.refCallBack.bind(_this);
        _this.handlePointUpdate = _this.handlePointUpdate.bind(_this);
        _this.change = _this.change.bind(_this);
        _this.handleKeyUp = _this.handleKeyUp.bind(_this);
        _this.handleLeave = _this.handleLeave.bind(_this);
        _this.handleEnter = _this.handleEnter.bind(_this);
        return _this;
    }
    LineGraphComponent.prototype.render = function () {
        var points = this.renderPoints();
        var lines = this.renderLines();
        var histogram = this.renderHistogram();
        return ([
            _jsx("div", { children: _jsxs("svg", { className: "msp-canvas", ref: this.refCallBack, viewBox: "0 0 ".concat(this.width + this.padding, " ").concat(this.height + this.padding), onMouseMove: this.handleDrag, onMouseUp: this.handlePointUpdate, onMouseLeave: this.handleLeave, onMouseEnter: this.handleEnter, tabIndex: 0, onKeyDown: this.handleKeyDown, onKeyUp: this.handleKeyUp, onDoubleClick: this.handleDoubleClick, children: [_jsxs("g", { stroke: "black", fill: "black", children: [histogram, lines, points] }), _jsx("g", { className: "ghost-points", stroke: "black", fill: "black" })] }) }, "LineGraph"),
            _jsx("div", { id: "modal-root" }, "modal")
        ]);
    };
    LineGraphComponent.prototype.componentDidMount = function () {
        this.gElement = document.getElementsByClassName('ghost-points')[0];
    };
    LineGraphComponent.prototype.change = function (points) {
        var copyPoints = points.slice();
        copyPoints.shift();
        copyPoints.pop();
        this.props.onChange(copyPoints);
    };
    LineGraphComponent.prototype.handleDrag = function (event) {
        if (this.selected === undefined) {
            return;
        }
        var pt = this.myRef.createSVGPoint();
        var updatedCopyPoint;
        var padding = this.padding / 2;
        pt.x = event.clientX;
        pt.y = event.clientY;
        var svgP = pt.matrixTransform(this.myRef.getScreenCTM().inverse());
        updatedCopyPoint = Vec2.create(svgP.x, svgP.y);
        if ((svgP.x < (padding) || svgP.x > (this.width + (padding))) && (svgP.y > (this.height + (padding)) || svgP.y < (padding))) {
            updatedCopyPoint = Vec2.create(this.updatedX, this.updatedY);
        }
        else if (svgP.x < padding) {
            updatedCopyPoint = Vec2.create(padding, svgP.y);
        }
        else if (svgP.x > (this.width + (padding))) {
            updatedCopyPoint = Vec2.create(this.width + padding, svgP.y);
        }
        else if (svgP.y > (this.height + (padding))) {
            updatedCopyPoint = Vec2.create(svgP.x, this.height + padding);
        }
        else if (svgP.y < (padding)) {
            updatedCopyPoint = Vec2.create(svgP.x, padding);
        }
        else {
            updatedCopyPoint = Vec2.create(svgP.x, svgP.y);
        }
        this.updatedX = updatedCopyPoint[0];
        this.updatedY = updatedCopyPoint[1];
        var unNormalizePoint = this.unNormalizePoint(updatedCopyPoint);
        this.ghostPoints[0].setAttribute('style', 'display: visible');
        this.ghostPoints[0].setAttribute('cx', "".concat(updatedCopyPoint[0]));
        this.ghostPoints[0].setAttribute('cy', "".concat(updatedCopyPoint[1]));
        this.props.onDrag(unNormalizePoint);
    };
    LineGraphComponent.prototype.handleMultipleDrag = function () {
        // TODO
    };
    LineGraphComponent.prototype.handlePointUpdate = function (event) {
        var selected = this.selected;
        if (this.state.canSelectMultiple) {
            return;
        }
        if (selected === undefined || selected[0] === 0 || selected[0] === this.state.points.length - 1) {
            this.setState({
                copyPoint: undefined,
            });
            return;
        }
        this.selected = undefined;
        var updatedPoint = this.unNormalizePoint(Vec2.create(this.updatedX, this.updatedY));
        var points = this.state.points.filter(function (_, i) { return i !== selected[0]; });
        points.push(updatedPoint);
        points.sort(function (a, b) {
            if (a[0] === b[0]) {
                if (a[0] === 0) {
                    return a[1] - b[1];
                }
                if (a[1] === 1) {
                    return b[1] - a[1];
                }
                return a[1] - b[1];
            }
            return a[0] - b[0];
        });
        this.setState({
            points: points,
        });
        this.change(points);
        this.gElement.innerHTML = '';
        this.ghostPoints = [];
        document.removeEventListener('mousemove', this.handleDrag, true);
        document.removeEventListener('mouseup', this.handlePointUpdate, true);
    };
    LineGraphComponent.prototype.handleDoubleClick = function (event) {
        var pt = this.myRef.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        var svgP = pt.matrixTransform(this.myRef.getScreenCTM().inverse());
        var points = this.state.points;
        var padding = this.padding / 2;
        if (svgP.x < (padding) ||
            svgP.x > (this.width + (padding)) ||
            svgP.y > (this.height + (padding)) ||
            svgP.y < (this.padding / 2)) {
            return;
        }
        var newPoint = this.unNormalizePoint(Vec2.create(svgP.x, svgP.y));
        points.push(newPoint);
        points.sort(function (a, b) {
            if (a[0] === b[0]) {
                if (a[0] === 0) {
                    return a[1] - b[1];
                }
                if (a[1] === 1) {
                    return b[1] - a[1];
                }
                return a[1] - b[1];
            }
            return a[0] - b[0];
        });
        this.setState({ points: points });
        this.change(points);
    };
    LineGraphComponent.prototype.handleLeave = function () {
        if (this.selected === undefined) {
            return;
        }
        document.addEventListener('mousemove', this.handleDrag, true);
        document.addEventListener('mouseup', this.handlePointUpdate, true);
    };
    LineGraphComponent.prototype.handleEnter = function () {
        document.removeEventListener('mousemove', this.handleDrag, true);
        document.removeEventListener('mouseup', this.handlePointUpdate, true);
    };
    LineGraphComponent.prototype.normalizePoint = function (point) {
        var offset = this.padding / 2;
        var maxX = this.width + offset;
        var maxY = this.height + offset;
        var normalizedX = (point[0] * (maxX - offset)) + offset;
        var normalizedY = (point[1] * (maxY - offset)) + offset;
        var reverseY = (this.height + this.padding) - normalizedY;
        var newPoint = Vec2.create(normalizedX, reverseY);
        return newPoint;
    };
    LineGraphComponent.prototype.unNormalizePoint = function (point) {
        var min = this.padding / 2;
        var maxX = this.width + min;
        var maxY = this.height + min;
        var unNormalizedX = (point[0] - min) / (maxX - min);
        // we have to take into account that we reversed y when we first normalized it.
        var unNormalizedY = ((this.height + this.padding) - point[1] - min) / (maxY - min);
        return Vec2.create(unNormalizedX, unNormalizedY);
    };
    LineGraphComponent.prototype.refCallBack = function (element) {
        if (element) {
            this.myRef = element;
        }
    };
    LineGraphComponent.prototype.renderHistogram = function () {
        if (!this.props.volume)
            return null;
        var histogram = Grid.getHistogram(this.props.volume.grid, 40);
        var bars = [];
        var N = histogram.counts.length;
        var w = this.width / N;
        var offset = this.padding / 2;
        var max = arrayMax(histogram.counts) || 1;
        for (var i = 0; i < N; i++) {
            var x = this.width * i / (N - 1) + offset;
            var y1 = this.height + offset;
            var y2 = this.height * (1 - histogram.counts[i] / max) + offset;
            bars.push(_jsx("line", { x1: x, x2: x, y1: y1, y2: y2, stroke: "#ded9ca", strokeWidth: w }, "histogram".concat(i)));
        }
        return bars;
    };
    LineGraphComponent.prototype.renderPoints = function () {
        var points = [];
        var point;
        for (var i = 0; i < this.state.points.length; i++) {
            if (i !== 0 && i !== this.state.points.length - 1) {
                point = this.normalizePoint(this.state.points[i]);
                points.push(_jsx(PointComponent, { id: i, x: point[0], y: point[1], nX: this.state.points[i][0], nY: this.state.points[i][1], selected: false, delete: this.deletePoint, onmouseover: this.props.onHover, onmousedown: this.handleMouseDown(i), onclick: this.handleClick(i) }, i));
            }
        }
        return points;
    };
    LineGraphComponent.prototype.renderLines = function () {
        var points = [];
        var lines = [];
        var maxX;
        var maxY;
        var normalizedX;
        var normalizedY;
        var reverseY;
        var o = this.padding / 2;
        for (var _i = 0, _a = this.state.points; _i < _a.length; _i++) {
            var point = _a[_i];
            maxX = this.width + o;
            maxY = this.height + this.padding;
            normalizedX = (point[0] * (maxX - o)) + o;
            normalizedY = (point[1] * (maxY - o)) + o;
            reverseY = this.height + this.padding - normalizedY;
            points.push(Vec2.create(normalizedX, reverseY));
        }
        var data = points;
        var size = data.length;
        for (var i = 0; i < size - 1; i++) {
            var x1 = data[i][0];
            var y1 = data[i][1];
            var x2 = data[i + 1][0];
            var y2 = data[i + 1][1];
            lines.push(_jsx("line", { x1: x1, x2: x2, y1: y1, y2: y2, stroke: "#cec9ba", strokeWidth: "5" }, "lineOf".concat(i)));
        }
        return lines;
    };
    return LineGraphComponent;
}(React.Component));
export { LineGraphComponent };
