import { __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import * as React from 'react';
export function legendFor(legend) {
    switch (legend.kind) {
        case 'scale-legend': return ScaleLegend;
        case 'table-legend': return TableLegend;
        default:
            var _ = legend;
            console.warn("".concat(_, " has no associated UI component"));
            return void 0;
    }
}
var ScaleLegend = /** @class */ (function (_super) {
    __extends(ScaleLegend, _super);
    function ScaleLegend() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScaleLegend.prototype.render = function () {
        var legend = this.props.legend;
        var colors = legend.colors.map(function (c) { return Array.isArray(c) ? "".concat(Color.toStyle(c[0]), " ").concat(100 * c[1], "%") : Color.toStyle(c); }).join(', ');
        return _jsx("div", { className: 'msp-scale-legend', children: _jsxs("div", { style: { background: "linear-gradient(to right, ".concat(colors, ")") }, children: [_jsx("span", { style: { float: 'left' }, children: legend.minLabel }), _jsx("span", { style: { float: 'right' }, children: legend.maxLabel })] }) });
    };
    return ScaleLegend;
}(React.PureComponent));
export { ScaleLegend };
var TableLegend = /** @class */ (function (_super) {
    __extends(TableLegend, _super);
    function TableLegend() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TableLegend.prototype.render = function () {
        var legend = this.props.legend;
        return _jsx("div", { className: 'msp-table-legend', children: legend.table.map(function (value, i) {
                var name = value[0], color = value[1];
                return _jsxs("div", { children: [_jsx("div", { className: 'msp-table-legend-color', style: { backgroundColor: Color.toStyle(color) } }), _jsx("div", { className: 'msp-table-legend-text', children: name })] }, i);
            }) });
    };
    return TableLegend;
}(React.PureComponent));
export { TableLegend };
