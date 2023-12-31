import { __assign, __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CollapsableControls } from '../../../mol-plugin-ui/base';
import { ApplyActionControl } from '../../../mol-plugin-ui/state/apply-action';
import { InitAssemblySymmetry3D, AssemblySymmetry3D, AssemblySymmetryPreset, tryCreateAssemblySymmetry } from './behavior';
import { AssemblySymmetryProvider, AssemblySymmetryDataProvider, AssemblySymmetry } from './prop';
import { ParameterControls } from '../../../mol-plugin-ui/controls/parameters';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureHierarchyManager } from '../../../mol-plugin-state/manager/structure/hierarchy';
import { StateAction, StateSelection } from '../../../mol-state';
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { Task } from '../../../mol-task';
import { ExtensionSvg, CheckSvg } from '../../../mol-plugin-ui/controls/icons';
var AssemblySymmetryControls = /** @class */ (function (_super) {
    __extends(AssemblySymmetryControls, _super);
    function AssemblySymmetryControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.paramsOnChange = function (options) {
            _this.updateAssemblySymmetry(options);
        };
        return _this;
    }
    AssemblySymmetryControls.prototype.defaultState = function () {
        return {
            header: 'Assembly Symmetry',
            isCollapsed: false,
            isBusy: false,
            isHidden: true,
            brand: { accent: 'cyan', svg: ExtensionSvg }
        };
    };
    AssemblySymmetryControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, function () {
            _this.setState({
                isHidden: !_this.canEnable(),
                description: StructureHierarchyManager.getSelectedStructuresDescription(_this.plugin)
            });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, function (e) {
            if (e.cell.transform.transformer === AssemblySymmetry3D)
                _this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (v) { return _this.setState({ isBusy: v }); });
    };
    Object.defineProperty(AssemblySymmetryControls.prototype, "pivot", {
        get: function () {
            return this.plugin.managers.structure.hierarchy.selection.structures[0];
        },
        enumerable: false,
        configurable: true
    });
    AssemblySymmetryControls.prototype.canEnable = function () {
        var _a, _b;
        var selection = this.plugin.managers.structure.hierarchy.selection;
        if (selection.structures.length !== 1)
            return false;
        var pivot = this.pivot.cell;
        if (!pivot.obj)
            return false;
        return !!((_b = (_a = InitAssemblySymmetry3D.definition).isApplicable) === null || _b === void 0 ? void 0 : _b.call(_a, pivot.obj, pivot.transform, this.plugin));
    };
    AssemblySymmetryControls.prototype.renderEnable = function () {
        var pivot = this.pivot;
        if (!pivot.cell.parent)
            return null;
        return _jsx(ApplyActionControl, { state: pivot.cell.parent, action: EnableAssemblySymmetry3D, initiallyCollapsed: true, nodeRef: pivot.cell.transform.ref, simpleApply: { header: 'Enable', icon: CheckSvg } });
    };
    AssemblySymmetryControls.prototype.renderNoSymmetries = function () {
        return _jsx("div", { className: 'msp-row-text', children: _jsx("div", { children: "No Symmetries for Assembly" }) });
    };
    Object.defineProperty(AssemblySymmetryControls.prototype, "params", {
        get: function () {
            var _a;
            var structure = (_a = this.pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
            var params = PD.clone(structure ? AssemblySymmetryProvider.getParams(structure) : AssemblySymmetryProvider.defaultParams);
            params.serverUrl.isHidden = true;
            return params;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AssemblySymmetryControls.prototype, "values", {
        get: function () {
            var _a;
            var structure = (_a = this.pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
            if (structure) {
                return AssemblySymmetryProvider.props(structure);
            }
            else {
                return __assign(__assign({}, PD.getDefaultValues(AssemblySymmetryProvider.defaultParams)), { symmetryIndex: -1 });
            }
        },
        enumerable: false,
        configurable: true
    });
    AssemblySymmetryControls.prototype.updateAssemblySymmetry = function (values) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var s, currValues, b, pd, params, _i, _e, components, name_1;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        s = this.pivot;
                        currValues = AssemblySymmetryProvider.props(s.cell.obj.data);
                        if (PD.areEqual(AssemblySymmetryProvider.defaultParams, currValues, values))
                            return [2 /*return*/];
                        if (!s.properties) return [3 /*break*/, 2];
                        b = this.plugin.state.data.build();
                        b.to(s.properties.cell).update(function (old) {
                            old.properties[AssemblySymmetryProvider.descriptor.name] = values;
                        });
                        return [4 /*yield*/, b.commit()];
                    case 1:
                        _f.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        pd = this.plugin.customStructureProperties.getParams((_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data);
                        params = PD.getDefaultValues(pd);
                        params.properties[AssemblySymmetryProvider.descriptor.name] = values;
                        return [4 /*yield*/, this.plugin.builders.structure.insertStructureProperties(s.cell, params)];
                    case 3:
                        _f.sent();
                        _f.label = 4;
                    case 4:
                        _i = 0, _e = this.plugin.managers.structure.hierarchy.currentComponentGroups;
                        _f.label = 5;
                    case 5:
                        if (!(_i < _e.length)) return [3 /*break*/, 11];
                        components = _e[_i];
                        if (!(values.symmetryIndex === -1)) return [3 /*break*/, 8];
                        name_1 = (_d = (_c = (_b = components[0]) === null || _b === void 0 ? void 0 : _b.representations[0]) === null || _c === void 0 ? void 0 : _c.cell.transform.params) === null || _d === void 0 ? void 0 : _d.colorTheme.name;
                        if (!(name_1 === AssemblySymmetry.Tag.Cluster)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.plugin.managers.structure.component.updateRepresentationsTheme(components, { color: 'default' })];
                    case 6:
                        _f.sent();
                        _f.label = 7;
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        tryCreateAssemblySymmetry(this.plugin, s.cell);
                        return [4 /*yield*/, this.plugin.managers.structure.component.updateRepresentationsTheme(components, { color: AssemblySymmetry.Tag.Cluster })];
                    case 9:
                        _f.sent();
                        _f.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 5];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(AssemblySymmetryControls.prototype, "hasAssemblySymmetry3D", {
        get: function () {
            return !this.pivot.cell.parent || !!StateSelection.findTagInSubtree(this.pivot.cell.parent.tree, this.pivot.cell.transform.ref, AssemblySymmetry.Tag.Representation);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AssemblySymmetryControls.prototype, "enable", {
        get: function () {
            return !this.hasAssemblySymmetry3D && this.values.symmetryIndex !== -1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AssemblySymmetryControls.prototype, "noSymmetries", {
        get: function () {
            var _a;
            var structure = (_a = this.pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
            var data = structure && AssemblySymmetryDataProvider.get(structure).value;
            return data && data.filter(function (sym) { return sym.symbol !== 'C1'; }).length === 0;
        },
        enumerable: false,
        configurable: true
    });
    AssemblySymmetryControls.prototype.renderParams = function () {
        return _jsx(_Fragment, { children: _jsx(ParameterControls, { params: this.params, values: this.values, onChangeValues: this.paramsOnChange }) });
    };
    AssemblySymmetryControls.prototype.renderControls = function () {
        if (!this.pivot)
            return null;
        if (this.noSymmetries)
            return this.renderNoSymmetries();
        if (this.enable)
            return this.renderEnable();
        return this.renderParams();
    };
    return AssemblySymmetryControls;
}(CollapsableControls));
export { AssemblySymmetryControls };
var EnableAssemblySymmetry3D = StateAction.build({
    from: PluginStateObject.Molecule.Structure,
})(function (_a, plugin) {
    var a = _a.a, ref = _a.ref, state = _a.state;
    return Task.create('Enable Assembly Symmetry', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, AssemblySymmetryPreset.apply(ref, Object.create(null), plugin)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
