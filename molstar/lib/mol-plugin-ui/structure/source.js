import { __awaiter, __extends, __generator, __spreadArray } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Model } from '../../mol-model/structure';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { StateSelection } from '../../mol-state';
import { CollapsableControls } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, ExpandGroup, IconButton } from '../controls/common';
import { BookmarksOutlinedSvg, MoleculeSvg } from '../controls/icons';
import { ParameterControls } from '../controls/parameters';
import { UpdateTransformControl } from '../state/update-transform';
import { StructureFocusControls } from './focus';
import { StructureSelectionStatsControls } from './selection';
var StructureSourceControls = /** @class */ (function (_super) {
    __extends(StructureSourceControls, _super);
    function StructureSourceControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.item = function (ref) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var selected = _this.plugin.managers.structure.hierarchy.seletionSet;
            var label;
            switch (ref.kind) {
                case 'model': {
                    var model = (_a = ref.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
                    if (model && Model.TrajectoryInfo.get(model).size > 1) {
                        label = "".concat((_b = ref.cell.obj) === null || _b === void 0 ? void 0 : _b.data.entryId, " | Model ").concat(Model.TrajectoryInfo.get(model).index + 1, " of ").concat(Model.TrajectoryInfo.get(model).size);
                    }
                    label = "".concat((_c = ref.cell.obj) === null || _c === void 0 ? void 0 : _c.data.entryId, " | ").concat((_d = ref.cell.obj) === null || _d === void 0 ? void 0 : _d.label);
                    break;
                }
                case 'structure': {
                    var model = (_e = ref.cell.obj) === null || _e === void 0 ? void 0 : _e.data.models[0];
                    if (model && Model.TrajectoryInfo.get(model).size > 1) {
                        label = "".concat(model.entryId, " | ").concat((_f = ref.cell.obj) === null || _f === void 0 ? void 0 : _f.label, " (Model ").concat(Model.TrajectoryInfo.get(model).index + 1, " of ").concat(Model.TrajectoryInfo.get(model).size, ")");
                        break;
                    }
                    else if (model) {
                        label = "".concat(model.entryId, " | ").concat((_g = ref.cell.obj) === null || _g === void 0 ? void 0 : _g.label);
                        break;
                    }
                    else {
                        label = "".concat((_h = ref.cell.obj) === null || _h === void 0 ? void 0 : _h.label);
                        break;
                    }
                }
                default:
                    label = (_j = ref.cell.obj) === null || _j === void 0 ? void 0 : _j.label;
                    break;
            }
            var item = { kind: 'item', label: label || ref.kind, selected: selected.has(ref.cell.transform.ref), value: [ref] };
            return item;
        };
        _this.getTrajectoryItems = function (t) {
            var _a;
            if (t.models.length === 0)
                return _this.item(t);
            return __spreadArray([ActionMenu.Header((_a = t.cell.obj) === null || _a === void 0 ? void 0 : _a.label)], t.models.map(_this.getModelItems), true);
        };
        _this.getModelItems = function (m) {
            var _a, _b, _c;
            if (m.structures.length === 0)
                return _this.item(m);
            if (m.structures.length === 1) {
                var selected = _this.plugin.managers.structure.hierarchy.seletionSet;
                var ref = m.structures[0];
                return { label: "".concat((_a = m.cell.obj) === null || _a === void 0 ? void 0 : _a.label, " | ").concat((_b = ref.cell.obj) === null || _b === void 0 ? void 0 : _b.label), selected: selected.has(ref.cell.transform.ref), value: [m, ref] };
            }
            return __spreadArray([ActionMenu.Header((_c = m.cell.obj) === null || _c === void 0 ? void 0 : _c.label)], m.structures.map(_this.item), true);
        };
        _this.selectHierarchy = function (items) {
            if (!items || items.length === 0)
                return;
            var refs = [];
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var i = items_1[_i];
                for (var _a = 0, _b = i.value; _a < _b.length; _a++) {
                    var r = _b[_a];
                    refs.push(r);
                }
            }
            _this.plugin.managers.structure.hierarchy.updateCurrent(refs, items[0].selected ? 'remove' : 'add');
        };
        _this.toggleHierarchy = function () { return _this.setState({ show: _this.state.show !== 'hierarchy' ? 'hierarchy' : void 0 }); };
        _this.togglePreset = function () { return _this.setState({ show: _this.state.show !== 'presets' ? 'presets' : void 0 }); };
        _this.applyPreset = function (item) {
            _this.setState({ show: void 0 });
            if (!item)
                return;
            var mng = _this.plugin.managers.structure;
            var trajectories = mng.hierarchy.selection.trajectories;
            mng.hierarchy.applyPreset(trajectories, item.value);
        };
        _this.updateModelQueueParams = void 0;
        _this.isUpdatingModel = false;
        _this.updateStructureModel = function (params) {
            _this.updateModelQueueParams = params;
            _this._updateStructureModel();
        };
        _this.updateStructure = function (params) {
            var selection = _this.plugin.managers.structure.hierarchy.selection;
            var s = selection.structures[0];
            return _this.plugin.managers.structure.hierarchy.updateStructure(s, params);
        };
        return _this;
    }
    StructureSourceControls.prototype.defaultState = function () {
        return {
            header: 'Structure',
            isCollapsed: false,
            isBusy: false,
            brand: { accent: 'purple', svg: MoleculeSvg }
        };
    };
    StructureSourceControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, function () { return _this.forceUpdate(); });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (v) {
            _this.setState({ isBusy: v });
        });
    };
    Object.defineProperty(StructureSourceControls.prototype, "hierarchyItems", {
        get: function () {
            var mng = this.plugin.managers.structure.hierarchy;
            var current = mng.current;
            var ret = [];
            if (current.trajectories.length > 1) {
                ret.push(__spreadArray([
                    ActionMenu.Header('Trajectories')
                ], current.trajectories.map(this.item), true));
            }
            if (current.models.length > 1 || current.trajectories.length > 1) {
                ret.push(__spreadArray([
                    ActionMenu.Header('Models')
                ], current.models.map(this.item), true));
            }
            if (current.trajectories.length === 1 && current.models.length === 1) {
                ret.push.apply(ret, current.structures.map(this.item));
            }
            else if (current.structures.length > 0) {
                ret.push(__spreadArray([
                    ActionMenu.Header('Structures')
                ], current.structures.map(this.item), true));
            }
            return ret;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureSourceControls.prototype, "isEmpty", {
        get: function () {
            var _a = this.plugin.managers.structure.hierarchy.current, structures = _a.structures, models = _a.models, trajectories = _a.trajectories;
            return trajectories.length === 0 && models.length === 0 && structures.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureSourceControls.prototype, "label", {
        get: function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            var _q = this.plugin.managers.structure.hierarchy.selection, structures = _q.structures, models = _q.models, trajectories = _q.trajectories;
            if (structures.length === 1) {
                var s = structures[0];
                if (((_b = (_a = s.model) === null || _a === void 0 ? void 0 : _a.trajectory) === null || _b === void 0 ? void 0 : _b.models) && s.model.trajectory.models.length === 1)
                    return (_c = s.cell.obj) === null || _c === void 0 ? void 0 : _c.data.label;
                if (s.model)
                    return "".concat((_d = s.model.cell.obj) === null || _d === void 0 ? void 0 : _d.label, " | ").concat((_e = s.cell.obj) === null || _e === void 0 ? void 0 : _e.data.label);
                return (_f = s.cell.obj) === null || _f === void 0 ? void 0 : _f.data.label;
            }
            if (structures.length > 1) {
                var p = structures[0];
                var t = (_g = p === null || p === void 0 ? void 0 : p.model) === null || _g === void 0 ? void 0 : _g.trajectory;
                var sameTraj = true;
                for (var _i = 0, structures_1 = structures; _i < structures_1.length; _i++) {
                    var s = structures_1[_i];
                    if (((_h = s === null || s === void 0 ? void 0 : s.model) === null || _h === void 0 ? void 0 : _h.trajectory) !== t) {
                        sameTraj = false;
                        break;
                    }
                }
                return sameTraj && t ? "".concat((_j = t.cell.obj) === null || _j === void 0 ? void 0 : _j.label, " | ").concat(structures.length, " structures") : "".concat(structures.length, " structures");
            }
            if (models.length > 0) {
                var t = models[0].trajectory;
                if (models.length === 1) {
                    var model = (_k = models[0].cell.obj) === null || _k === void 0 ? void 0 : _k.data;
                    if (model && Model.TrajectoryInfo.get(model).size > 1) {
                        return "".concat((_l = t === null || t === void 0 ? void 0 : t.cell.obj) === null || _l === void 0 ? void 0 : _l.label, " | Model ").concat(Model.TrajectoryInfo.get(model).index + 1, " of ").concat(Model.TrajectoryInfo.get(model).size);
                    }
                    else {
                        return "".concat((_m = t === null || t === void 0 ? void 0 : t.cell.obj) === null || _m === void 0 ? void 0 : _m.label, " | Model");
                    }
                }
                var sameTraj = true;
                for (var _r = 0, models_1 = models; _r < models_1.length; _r++) {
                    var m = models_1[_r];
                    if (m.trajectory !== t) {
                        sameTraj = false;
                        break;
                    }
                }
                return sameTraj ? "".concat((_o = t === null || t === void 0 ? void 0 : t.cell.obj) === null || _o === void 0 ? void 0 : _o.label, " | ").concat(models.length, " models") : "".concat(models.length, " models");
            }
            if (trajectories.length > 0) {
                return trajectories.length === 1 ? "".concat((_p = trajectories[0].cell.obj) === null || _p === void 0 ? void 0 : _p.label, " trajectory") : "".concat(trajectories.length, " trajectories");
            }
            if (trajectories.length === 0 && models.length === 0 && structures.length === 0) {
                return 'Nothing Loaded';
            }
            return 'Nothing Selected';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureSourceControls.prototype, "presetActions", {
        get: function () {
            var actions = [];
            var trajectories = this.plugin.managers.structure.hierarchy.selection.trajectories;
            if (trajectories.length === 0)
                return actions;
            var providers = this.plugin.builders.structure.hierarchy.getPresets(trajectories[0].cell.obj);
            if (trajectories.length > 1) {
                var providerSet_1 = new Set(providers);
                for (var i = 1; i < trajectories.length; i++) {
                    var providers_3 = this.plugin.builders.structure.hierarchy.getPresets(trajectories[i].cell.obj);
                    var current = new Set(providers_3);
                    for (var _i = 0, providers_1 = providers_3; _i < providers_1.length; _i++) {
                        var p = providers_1[_i];
                        if (!current.has(p))
                            providerSet_1.delete(p);
                    }
                }
                providers = providers.filter(function (p) { return providerSet_1.has(p); });
            }
            for (var _a = 0, providers_2 = providers; _a < providers_2.length; _a++) {
                var p = providers_2[_a];
                actions.push(ActionMenu.Item(p.display.name, p, { description: p.display.description }));
            }
            return actions;
        },
        enumerable: false,
        configurable: true
    });
    StructureSourceControls.prototype._updateStructureModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var params, selection, m;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.updateModelQueueParams || this.isUpdatingModel)
                            return [2 /*return*/];
                        params = this.updateModelQueueParams;
                        this.updateModelQueueParams = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        this.isUpdatingModel = true;
                        selection = this.plugin.managers.structure.hierarchy.selection;
                        m = selection.structures[0].model;
                        return [4 /*yield*/, this.plugin.state.updateTransform(this.plugin.state.data, m.cell.transform.ref, params, 'Model Index')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.isUpdatingModel = false;
                        this._updateStructureModel();
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(StructureSourceControls.prototype, "modelIndex", {
        get: function () {
            var _a, _b;
            var selection = this.plugin.managers.structure.hierarchy.selection;
            if (selection.structures.length !== 1)
                return null;
            var m = selection.structures[0].model;
            if (!m || m.cell.transform.transformer !== StateTransforms.Model.ModelFromTrajectory)
                return null;
            if (!m.cell.obj || Model.TrajectoryInfo.get(m.cell.obj.data).size <= 1)
                return null;
            var params = (_a = m.cell.params) === null || _a === void 0 ? void 0 : _a.definition;
            if (!params)
                return null;
            return _jsx(ParameterControls, { params: params, values: (_b = m.cell.params) === null || _b === void 0 ? void 0 : _b.values, onChangeValues: this.updateStructureModel, isDisabled: this.state.isBusy });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureSourceControls.prototype, "structureType", {
        get: function () {
            var _a;
            var selection = this.plugin.managers.structure.hierarchy.selection;
            if (selection.structures.length !== 1)
                return null;
            var s = selection.structures[0];
            var params = (_a = s.cell.params) === null || _a === void 0 ? void 0 : _a.definition;
            if (!params || !s.cell.parent)
                return null;
            return _jsx(UpdateTransformControl, { state: s.cell.parent, transform: s.cell.transform, customHeader: 'none', customUpdate: this.updateStructure, noMargin: true, autoHideApply: true });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureSourceControls.prototype, "transform", {
        get: function () {
            var selection = this.plugin.managers.structure.hierarchy.selection;
            if (selection.structures.length !== 1)
                return null;
            var pivot = selection.structures[0];
            if (!pivot.cell.parent)
                return null;
            var t = StateSelection.tryFindDecorator(this.plugin.state.data, pivot.cell.transform.ref, StateTransforms.Model.TransformStructureConformation);
            if (!t)
                return;
            return _jsx(ExpandGroup, { header: "Conformation Transform", children: _jsx(UpdateTransformControl, { state: t.parent, transform: t.transform, customHeader: 'none', noMargin: true, autoHideApply: true }) });
        },
        enumerable: false,
        configurable: true
    });
    StructureSourceControls.prototype.renderControls = function () {
        var disabled = this.state.isBusy || this.isEmpty;
        var presets = this.presetActions;
        var label = this.label;
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', style: { marginTop: '1px' }, children: [_jsx(Button, { noOverflow: true, flex: true, onClick: this.toggleHierarchy, disabled: disabled, title: label, children: label }), presets.length > 0 && _jsx(IconButton, { svg: BookmarksOutlinedSvg, className: 'msp-form-control', flex: '40px', onClick: this.togglePreset, title: 'Apply a structure presets to the current hierarchy.', toggleState: this.state.show === 'presets', disabled: disabled })] }), this.state.show === 'hierarchy' && _jsx(ActionMenu, { items: this.hierarchyItems, onSelect: this.selectHierarchy, multiselect: true }), this.state.show === 'presets' && _jsx(ActionMenu, { items: presets, onSelect: this.applyPreset }), this.modelIndex, this.structureType, this.transform, _jsxs("div", { style: { marginTop: '6px' }, children: [_jsx(StructureFocusControls, {}), _jsx(StructureSelectionStatsControls, { hideOnEmpty: true })] })] });
    };
    return StructureSourceControls;
}(CollapsableControls));
export { StructureSourceControls };
