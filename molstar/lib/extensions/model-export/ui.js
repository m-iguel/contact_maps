import { __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { useState } from 'react';
import { CollapsableControls } from '../../mol-plugin-ui/base';
import { Button } from '../../mol-plugin-ui/controls/common';
import { GetAppSvg } from '../../mol-plugin-ui/controls/icons';
import { ParameterControls } from '../../mol-plugin-ui/controls/parameters';
import { useBehavior } from '../../mol-plugin-ui/hooks/use-behavior';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { exportHierarchy } from './export';
var ModelExportUI = /** @class */ (function (_super) {
    __extends(ModelExportUI, _super);
    function ModelExportUI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ModelExportUI.prototype.defaultState = function () {
        return {
            header: 'Export Models',
            isCollapsed: true,
            brand: { accent: 'cyan', svg: GetAppSvg }
        };
    };
    ModelExportUI.prototype.renderControls = function () {
        return _jsx(ExportControls, { plugin: this.plugin });
    };
    return ModelExportUI;
}(CollapsableControls));
export { ModelExportUI };
var Params = {
    format: PD.Select('cif', [['cif', 'mmCIF'], ['bcif', 'Binary mmCIF']])
};
var DefaultParams = PD.getDefaultValues(Params);
function ExportControls(_a) {
    var _this = this;
    var plugin = _a.plugin;
    var _b = useState(DefaultParams), params = _b[0], setParams = _b[1];
    var _c = useState(false), exporting = _c[0], setExporting = _c[1];
    useBehavior(plugin.managers.structure.hierarchy.behaviors.selection); // triggers UI update
    var isBusy = useBehavior(plugin.behaviors.state.isBusy);
    var hierarchy = plugin.managers.structure.hierarchy.current;
    var label = 'Nothing to Export';
    if (hierarchy.structures.length === 1) {
        label = 'Export';
    }
    if (hierarchy.structures.length > 1) {
        label = 'Export (as ZIP)';
    }
    var onExport = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setExporting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, exportHierarchy(plugin, { format: params.format })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setExporting(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: Params, values: params, onChangeValues: setParams, isDisabled: isBusy || exporting }), _jsx(Button, { onClick: onExport, style: { marginTop: 1 }, disabled: isBusy || hierarchy.structures.length === 0 || exporting, commit: hierarchy.structures.length ? 'on' : 'off', children: label })] });
}
