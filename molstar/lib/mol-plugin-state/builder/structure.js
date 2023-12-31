/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator, __spreadArray } from "tslib";
import { StateObjectRef } from '../../mol-state';
import { PluginStateObject as SO } from '../objects';
import { StateTransforms } from '../transforms';
import { StructureRepresentationBuilder } from './structure/representation';
import { Task } from '../../mol-task';
import { StructureElement } from '../../mol-model/structure';
import { ModelSymmetry } from '../../mol-model-formats/structure/property/symmetry';
import { SpacegroupCell } from '../../mol-math/geometry';
import { TrajectoryHierarchyBuilder } from './structure/hierarchy';
var StructureBuilder = /** @class */ (function () {
    function StructureBuilder(plugin) {
        this.plugin = plugin;
        this.hierarchy = new TrajectoryHierarchyBuilder(this.plugin);
        this.representation = new StructureRepresentationBuilder(this.plugin);
    }
    Object.defineProperty(StructureBuilder.prototype, "dataState", {
        get: function () {
            return this.plugin.state.data;
        },
        enumerable: false,
        configurable: true
    });
    StructureBuilder.prototype.parseTrajectoryData = function (data, format) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, trajectory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = typeof format === 'string' ? this.plugin.dataFormats.get(format) : format;
                        if (!provider)
                            throw new Error("'".concat(format, "' is not a supported data format."));
                        return [4 /*yield*/, provider.parse(this.plugin, data)];
                    case 1:
                        trajectory = (_a.sent()).trajectory;
                        return [2 /*return*/, trajectory];
                }
            });
        });
    };
    StructureBuilder.prototype.parseTrajectoryBlob = function (data, params) {
        var state = this.dataState;
        var trajectory = state.build().to(data)
            .apply(StateTransforms.Data.ParseBlob, params, { state: { isGhost: true } })
            .apply(StateTransforms.Model.TrajectoryFromBlob, void 0);
        return trajectory.commit({ revertOnError: true });
    };
    StructureBuilder.prototype.parseTrajectory = function (data, params) {
        var cell = StateObjectRef.resolveAndCheck(this.dataState, data);
        if (!cell)
            throw new Error('Invalid data cell.');
        if (SO.Data.Blob.is(cell.obj)) {
            return this.parseTrajectoryBlob(data, params);
        }
        else {
            return this.parseTrajectoryData(data, params);
        }
    };
    StructureBuilder.prototype.createModel = function (trajectory, params, initialState) {
        var state = this.dataState;
        var model = state.build().to(trajectory)
            .apply(StateTransforms.Model.ModelFromTrajectory, params || { modelIndex: 0 }, { state: initialState });
        return model.commit({ revertOnError: true });
    };
    StructureBuilder.prototype.insertModelProperties = function (model, params, initialState) {
        var state = this.dataState;
        var props = state.build().to(model)
            .apply(StateTransforms.Model.CustomModelProperties, params, { state: initialState });
        return props.commit({ revertOnError: true });
    };
    StructureBuilder.prototype.tryCreateUnitcell = function (model, params, initialState) {
        var _a, _b, _c;
        var state = this.dataState;
        var m = (_b = (_a = StateObjectRef.resolveAndCheck(state, model)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (!m)
            return;
        var cell = (_c = ModelSymmetry.Provider.get(m)) === null || _c === void 0 ? void 0 : _c.spacegroup.cell;
        if (SpacegroupCell.isZero(cell))
            return;
        var unitcell = state.build().to(model)
            .apply(StateTransforms.Representation.ModelUnitcell3D, params, { state: initialState });
        return unitcell.commit({ revertOnError: true });
    };
    StructureBuilder.prototype.createStructure = function (modelRef, params, initialState, tags) {
        var _a;
        var state = this.dataState;
        if (!params) {
            var model = StateObjectRef.resolveAndCheck(state, modelRef);
            if (model) {
                var symm = ModelSymmetry.Provider.get((_a = model.obj) === null || _a === void 0 ? void 0 : _a.data);
                if (!symm || (symm === null || symm === void 0 ? void 0 : symm.assemblies.length) === 0)
                    params = { name: 'model', params: {} };
            }
        }
        var structure = state.build().to(modelRef)
            .apply(StateTransforms.Model.StructureFromModel, { type: params || { name: 'assembly', params: {} } }, { state: initialState, tags: tags });
        return structure.commit({ revertOnError: true });
    };
    StructureBuilder.prototype.insertStructureProperties = function (structure, params) {
        var state = this.dataState;
        var props = state.build().to(structure)
            .apply(StateTransforms.Model.CustomStructureProperties, params);
        return props.commit({ revertOnError: true });
    };
    StructureBuilder.prototype.isComponentTransform = function (cell) {
        return cell.transform.transformer === StateTransforms.Model.StructureComponent;
    };
    /** returns undefined if the component is empty/null */
    StructureBuilder.prototype.tryCreateComponent = function (structure, params, key, tags) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var state, root, keyTag, component, selector;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        state = this.dataState;
                        root = state.build().to(structure);
                        keyTag = "structure-component-".concat(key);
                        component = root.applyOrUpdateTagged(keyTag, StateTransforms.Model.StructureComponent, params, {
                            tags: tags ? __spreadArray(__spreadArray([], tags, true), [keyTag], false) : [keyTag]
                        });
                        return [4 /*yield*/, component.commit()];
                    case 1:
                        _c.sent();
                        selector = component.selector;
                        if (!(!selector.isOk || ((_b = (_a = selector.cell) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data.elementCount) === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, state.build().delete(selector.ref).commit()];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                    case 3: return [2 /*return*/, selector];
                }
            });
        });
    };
    StructureBuilder.prototype.tryCreateComponentFromExpression = function (structure, expression, key, params) {
        return this.tryCreateComponent(structure, {
            type: { name: 'expression', params: expression },
            nullIfEmpty: true,
            label: ((params === null || params === void 0 ? void 0 : params.label) || '').trim()
        }, key, params === null || params === void 0 ? void 0 : params.tags);
    };
    StructureBuilder.prototype.tryCreateComponentStatic = function (structure, type, params) {
        return this.tryCreateComponent(structure, {
            type: { name: 'static', params: type },
            nullIfEmpty: true,
            label: ((params === null || params === void 0 ? void 0 : params.label) || '').trim()
        }, "static-".concat(type), params === null || params === void 0 ? void 0 : params.tags);
    };
    StructureBuilder.prototype.tryCreateComponentFromSelection = function (structure, selection, key, params) {
        var _this = this;
        return this.plugin.runTask(Task.create('Query Component', function (taskCtx) { return __awaiter(_this, void 0, void 0, function () {
            var _a, label, tags, structureData, transformParams, _b, _c, _d;
            var _e, _f;
            var _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _a = params || {}, label = _a.label, tags = _a.tags;
                        label = (label || '').trim();
                        structureData = (_h = (_g = StateObjectRef.resolveAndCheck(this.dataState, structure)) === null || _g === void 0 ? void 0 : _g.obj) === null || _h === void 0 ? void 0 : _h.data;
                        if (!structureData)
                            return [2 /*return*/];
                        if (!selection.referencesCurrent) return [3 /*break*/, 2];
                        _e = {};
                        _f = {
                            name: 'bundle'
                        };
                        _d = (_c = StructureElement.Bundle).fromSelection;
                        return [4 /*yield*/, selection.getSelection(this.plugin, taskCtx, structureData)];
                    case 1:
                        _b = (_e.type = (_f.params = _d.apply(_c, [_j.sent()]),
                            _f),
                            _e.nullIfEmpty = true,
                            _e.label = label || selection.label,
                            _e);
                        return [3 /*break*/, 3];
                    case 2:
                        _b = {
                            type: { name: 'expression', params: selection.expression },
                            nullIfEmpty: true,
                            label: label || selection.label
                        };
                        _j.label = 3;
                    case 3:
                        transformParams = _b;
                        if (!selection.ensureCustomProperties) return [3 /*break*/, 5];
                        return [4 /*yield*/, selection.ensureCustomProperties({ runtime: taskCtx, assetManager: this.plugin.managers.asset }, structureData)];
                    case 4:
                        _j.sent();
                        _j.label = 5;
                    case 5: return [2 /*return*/, this.tryCreateComponent(structure, transformParams, key, tags)];
                }
            });
        }); }));
    };
    return StructureBuilder;
}());
export { StructureBuilder };
