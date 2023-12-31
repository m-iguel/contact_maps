/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __extends, __generator, __spreadArray } from "tslib";
import { VisualQualityOptions } from '../../../mol-geo/geometry/base';
import { InteractionsProvider } from '../../../mol-model-props/computed/interactions';
import { Structure, StructureElement, StructureSelection } from '../../../mol-model/structure';
import { structureAreEqual, structureAreIntersecting, structureIntersect, structureSubtract, structureUnion } from '../../../mol-model/structure/query/utils/structure-set';
import { setSubtreeVisibility } from '../../../mol-plugin/behavior/static/state';
import { Task } from '../../../mol-task';
import { shallowEqual, UUID } from '../../../mol-util';
import { ColorNames } from '../../../mol-util/color/names';
import { objectForEach } from '../../../mol-util/object';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StatefulPluginComponent } from '../../component';
import { setStructureOverpaint } from '../../helpers/structure-overpaint';
import { createStructureColorThemeParams, createStructureSizeThemeParams } from '../../helpers/structure-representation-params';
import { StructureSelectionQueries } from '../../helpers/structure-selection-query';
import { StructureRepresentation3D } from '../../transforms/representation';
import { Clipping } from '../../../mol-theme/clipping';
import { setStructureClipping } from '../../helpers/structure-clipping';
import { setStructureTransparency } from '../../helpers/structure-transparency';
import { StructureFocusRepresentation } from '../../../mol-plugin/behavior/dynamic/selection/structure-focus-representation';
import { setStructureSubstance } from '../../helpers/structure-substance';
import { Material } from '../../../mol-util/material';
import { Clip } from '../../../mol-util/clip';
export { StructureComponentManager };
var StructureComponentManager = /** @class */ (function (_super) {
    __extends(StructureComponentManager, _super);
    function StructureComponentManager(plugin) {
        var _this = _super.call(this, { options: PD.getDefaultValues(StructureComponentManager.OptionsParams) }) || this;
        _this.plugin = plugin;
        _this.events = {
            optionsUpdated: _this.ev()
        };
        return _this;
    }
    Object.defineProperty(StructureComponentManager.prototype, "currentStructures", {
        get: function () {
            return this.plugin.managers.structure.hierarchy.selection.structures;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureComponentManager.prototype, "pivotStructure", {
        get: function () {
            return this.currentStructures[0];
        },
        enumerable: false,
        configurable: true
    });
    // To be used only from PluginState.setSnapshot
    StructureComponentManager.prototype._setSnapshotState = function (options) {
        this.updateState({ options: options });
        this.events.optionsUpdated.next(void 0);
    };
    StructureComponentManager.prototype.setOptions = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var interactionChanged, update, _i, _a, s, _b, _c, c;
            var _this = this;
            return __generator(this, function (_d) {
                interactionChanged = options.interactions !== this.state.options.interactions;
                this.updateState({ options: options });
                this.events.optionsUpdated.next(void 0);
                update = this.dataState.build();
                for (_i = 0, _a = this.currentStructures; _i < _a.length; _i++) {
                    s = _a[_i];
                    for (_b = 0, _c = s.components; _b < _c.length; _b++) {
                        c = _c[_b];
                        this.updateReprParams(update, c);
                    }
                }
                return [2 /*return*/, this.plugin.dataTransaction(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, update.commit()];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, this.plugin.state.updateBehavior(StructureFocusRepresentation, function (p) {
                                            p.ignoreHydrogens = options.hydrogens !== 'all';
                                            p.ignoreHydrogensVariant = options.hydrogens === 'only-polar' ? 'non-polar' : 'all';
                                            p.ignoreLight = options.ignoreLight;
                                            p.material = options.materialStyle;
                                            p.clip = options.clipObjects;
                                        })];
                                case 2:
                                    _a.sent();
                                    if (!interactionChanged) return [3 /*break*/, 4];
                                    return [4 /*yield*/, this.updateInterationProps()];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    StructureComponentManager.prototype.updateReprParams = function (update, component) {
        var _a = this.state.options, hydrogens = _a.hydrogens, quality = _a.visualQuality, ignoreLight = _a.ignoreLight, material = _a.materialStyle, clip = _a.clipObjects;
        var ignoreHydrogens = hydrogens !== 'all';
        var ignoreHydrogensVariant = hydrogens === 'only-polar' ? 'non-polar' : 'all';
        for (var _i = 0, _b = component.representations; _i < _b.length; _i++) {
            var r = _b[_i];
            if (r.cell.transform.transformer !== StructureRepresentation3D)
                continue;
            var params = r.cell.transform.params;
            if (!!params.type.params.ignoreHydrogens !== ignoreHydrogens || params.type.params.ignoreHydrogensVariant !== ignoreHydrogensVariant || params.type.params.quality !== quality || params.type.params.ignoreLight !== ignoreLight || !shallowEqual(params.type.params.material, material) || !PD.areEqual(Clip.Params, params.type.params.clip, clip)) {
                update.to(r.cell).update(function (old) {
                    old.type.params.ignoreHydrogens = ignoreHydrogens;
                    old.type.params.ignoreHydrogensVariant = ignoreHydrogensVariant;
                    old.type.params.quality = quality;
                    old.type.params.ignoreLight = ignoreLight;
                    old.type.params.material = material;
                    old.type.params.clip = clip;
                });
            }
        }
    };
    StructureComponentManager.prototype.updateInterationProps = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var _i, _d, s, interactionParams, oldParams, pd, params;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _i = 0, _d = this.currentStructures;
                        _e.label = 1;
                    case 1:
                        if (!(_i < _d.length)) return [3 /*break*/, 6];
                        s = _d[_i];
                        interactionParams = InteractionsProvider.getParams((_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data);
                        if (!s.properties) return [3 /*break*/, 3];
                        oldParams = (_b = s.properties.cell.transform.params) === null || _b === void 0 ? void 0 : _b.properties[InteractionsProvider.descriptor.name];
                        if (PD.areEqual(interactionParams, oldParams, this.state.options.interactions))
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, this.dataState.build().to(s.properties.cell)
                                .update(function (old) {
                                old.properties[InteractionsProvider.descriptor.name] = _this.state.options.interactions;
                            })
                                .commit()];
                    case 2:
                        _e.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        pd = this.plugin.customStructureProperties.getParams((_c = s.cell.obj) === null || _c === void 0 ? void 0 : _c.data);
                        params = PD.getDefaultValues(pd);
                        if (PD.areEqual(interactionParams, params.properties[InteractionsProvider.descriptor.name], this.state.options.interactions))
                            return [3 /*break*/, 5];
                        params.properties[InteractionsProvider.descriptor.name] = this.state.options.interactions;
                        return [4 /*yield*/, this.plugin.builders.structure.insertStructureProperties(s.cell, params)];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    StructureComponentManager.prototype.applyPreset = function (structures, provider, params) {
        var _this = this;
        return this.plugin.dataTransaction(function () { return __awaiter(_this, void 0, void 0, function () {
            var _i, structures_1, s, preset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, structures_1 = structures;
                        _a.label = 1;
                    case 1:
                        if (!(_i < structures_1.length)) return [3 /*break*/, 5];
                        s = structures_1[_i];
                        return [4 /*yield*/, this.plugin.builders.structure.representation.applyPreset(s.cell, provider, params)];
                    case 2:
                        preset = _a.sent();
                        return [4 /*yield*/, this.syncPreset(s, preset)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        }); }, { canUndo: 'Preset' });
    };
    StructureComponentManager.prototype.syncPreset = function (root, preset) {
        if (!preset || !preset.components)
            return this.clearComponents([root]);
        var keptRefs = new Set();
        objectForEach(preset.components, function (c) {
            if (c)
                keptRefs.add(c.ref);
        });
        if (preset.representations) {
            objectForEach(preset.representations, function (r) {
                if (r)
                    keptRefs.add(r.ref);
            });
        }
        if (keptRefs.size === 0)
            return this.clearComponents([root]);
        var changed = false;
        var update = this.dataState.build();
        var sync = function (r) {
            if (!keptRefs.has(r.cell.transform.ref)) {
                changed = true;
                update.delete(r.cell);
            }
        };
        for (var _i = 0, _a = root.components; _i < _a.length; _i++) {
            var c = _a[_i];
            sync(c);
            for (var _b = 0, _c = c.representations; _b < _c.length; _b++) {
                var r = _c[_b];
                sync(r);
            }
            if (c.genericRepresentations) {
                for (var _d = 0, _e = c.genericRepresentations; _d < _e.length; _d++) {
                    var r = _e[_d];
                    sync(r);
                }
            }
        }
        if (root.genericRepresentations) {
            for (var _f = 0, _g = root.genericRepresentations; _f < _g.length; _f++) {
                var r = _g[_f];
                sync(r);
            }
        }
        if (changed)
            return update.commit();
    };
    StructureComponentManager.prototype.clear = function (structures) {
        return this.clearComponents(structures);
    };
    StructureComponentManager.prototype.selectThis = function (components) {
        var _a;
        var mng = this.plugin.managers.structure.selection;
        mng.clear();
        for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
            var c = components_1[_i];
            var loci = Structure.toSubStructureElementLoci(c.structure.cell.obj.data, (_a = c.cell.obj) === null || _a === void 0 ? void 0 : _a.data);
            mng.fromLoci('set', loci);
        }
    };
    StructureComponentManager.prototype.canBeModified = function (ref) {
        return this.plugin.builders.structure.isComponentTransform(ref.cell);
    };
    StructureComponentManager.prototype.modifyByCurrentSelection = function (components, action) {
        var _this = this;
        return this.plugin.runTask(Task.create('Modify Component', function (taskCtx) { return __awaiter(_this, void 0, void 0, function () {
            var b, _i, components_2, c, selection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        b = this.dataState.build();
                        for (_i = 0, components_2 = components; _i < components_2.length; _i++) {
                            c = components_2[_i];
                            if (!this.canBeModified(c))
                                continue;
                            selection = this.plugin.managers.structure.selection.getStructure(c.structure.cell.obj.data);
                            if (!selection || selection.elementCount === 0)
                                continue;
                            this.modifyComponent(b, c, selection, action);
                        }
                        return [4 /*yield*/, this.dataState.updateTree(b, { canUndo: 'Modify Selection' }).runInContext(taskCtx)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }));
    };
    StructureComponentManager.prototype.toggleVisibility = function (components, reprPivot) {
        if (components.length === 0)
            return;
        if (!reprPivot) {
            var isHidden = !components[0].cell.state.isHidden;
            for (var _i = 0, components_3 = components; _i < components_3.length; _i++) {
                var c = components_3[_i];
                setSubtreeVisibility(this.dataState, c.cell.transform.ref, isHidden);
            }
        }
        else {
            var index = components[0].representations.indexOf(reprPivot);
            var isHidden = !reprPivot.cell.state.isHidden;
            for (var _a = 0, components_4 = components; _a < components_4.length; _a++) {
                var c = components_4[_a];
                // TODO: is it ok to use just the index here? Could possible lead to ugly edge cases, but perhaps not worth the trouble to "fix".
                var repr = c.representations[index];
                if (!repr)
                    continue;
                setSubtreeVisibility(this.dataState, repr.cell.transform.ref, isHidden);
            }
        }
    };
    StructureComponentManager.prototype.removeRepresentations = function (components, pivot) {
        if (components.length === 0)
            return;
        var toRemove = [];
        if (pivot) {
            var index = components[0].representations.indexOf(pivot);
            if (index < 0)
                return;
            for (var _i = 0, components_5 = components; _i < components_5.length; _i++) {
                var c = components_5[_i];
                if (c.representations[index])
                    toRemove.push(c.representations[index]);
            }
        }
        else {
            for (var _a = 0, components_6 = components; _a < components_6.length; _a++) {
                var c = components_6[_a];
                for (var _b = 0, _c = c.representations; _b < _c.length; _b++) {
                    var r = _c[_b];
                    toRemove.push(r);
                }
            }
        }
        return this.plugin.managers.structure.hierarchy.remove(toRemove, true);
    };
    StructureComponentManager.prototype.updateRepresentations = function (components, pivot, params) {
        if (components.length === 0)
            return Promise.resolve();
        var index = components[0].representations.indexOf(pivot);
        if (index < 0)
            return Promise.resolve();
        var update = this.dataState.build();
        for (var _i = 0, components_7 = components; _i < components_7.length; _i++) {
            var c = components_7[_i];
            // TODO: is it ok to use just the index here? Could possible lead to ugly edge cases, but perhaps not worth the trouble to "fix".
            var repr = c.representations[index];
            if (!repr)
                continue;
            if (repr.cell.transform.transformer !== pivot.cell.transform.transformer)
                continue;
            update.to(repr.cell).update(params);
        }
        return update.commit({ canUndo: 'Update Representation' });
    };
    StructureComponentManager.prototype.updateRepresentationsTheme = function (components, paramsOrProvider) {
        var _a, _b, _c, _d;
        if (components.length === 0)
            return;
        var update = this.dataState.build();
        for (var _i = 0, components_8 = components; _i < components_8.length; _i++) {
            var c = components_8[_i];
            var _loop_1 = function (repr) {
                var old = repr.cell.transform.params;
                var params = typeof paramsOrProvider === 'function' ? paramsOrProvider(c, repr) : paramsOrProvider;
                var colorTheme = params.color === 'default'
                    ? createStructureColorThemeParams(this_1.plugin, (_a = c.structure.cell.obj) === null || _a === void 0 ? void 0 : _a.data, old === null || old === void 0 ? void 0 : old.type.name)
                    : params.color
                        ? createStructureColorThemeParams(this_1.plugin, (_b = c.structure.cell.obj) === null || _b === void 0 ? void 0 : _b.data, old === null || old === void 0 ? void 0 : old.type.name, params.color, params.colorParams)
                        : void 0;
                var sizeTheme = params.size === 'default'
                    ? createStructureSizeThemeParams(this_1.plugin, (_c = c.structure.cell.obj) === null || _c === void 0 ? void 0 : _c.data, old === null || old === void 0 ? void 0 : old.type.name)
                    : params.color
                        ? createStructureSizeThemeParams(this_1.plugin, (_d = c.structure.cell.obj) === null || _d === void 0 ? void 0 : _d.data, old === null || old === void 0 ? void 0 : old.type.name, params.size, params.sizeParams)
                        : void 0;
                if (colorTheme || sizeTheme) {
                    update.to(repr.cell).update(function (prev) {
                        if (colorTheme)
                            prev.colorTheme = colorTheme;
                        if (sizeTheme)
                            prev.sizeTheme = sizeTheme;
                    });
                }
            };
            var this_1 = this;
            for (var _e = 0, _f = c.representations; _e < _f.length; _e++) {
                var repr = _f[_e];
                _loop_1(repr);
            }
        }
        return update.commit({ canUndo: 'Update Theme' });
    };
    StructureComponentManager.prototype.addRepresentation = function (components, type) {
        var _this = this;
        if (components.length === 0)
            return;
        var _a = this.state.options, hydrogens = _a.hydrogens, quality = _a.visualQuality, ignoreLight = _a.ignoreLight, material = _a.materialStyle, clip = _a.clipObjects;
        var ignoreHydrogens = hydrogens !== 'all';
        var ignoreHydrogensVariant = hydrogens === 'only-polar' ? 'non-polar' : 'all';
        var typeParams = { ignoreHydrogens: ignoreHydrogens, ignoreHydrogensVariant: ignoreHydrogensVariant, quality: quality, ignoreLight: ignoreLight, material: material, clip: clip };
        return this.plugin.dataTransaction(function () { return __awaiter(_this, void 0, void 0, function () {
            var _i, components_9, component;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, components_9 = components;
                        _a.label = 1;
                    case 1:
                        if (!(_i < components_9.length)) return [3 /*break*/, 4];
                        component = components_9[_i];
                        return [4 /*yield*/, this.plugin.builders.structure.representation.addRepresentation(component.cell, {
                                type: this.plugin.representation.structure.registry.get(type),
                                typeParams: typeParams
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, { canUndo: 'Add Representation' });
    };
    StructureComponentManager.prototype.tryFindComponent = function (structure, selection) {
        var _this = this;
        if (structure.components.length === 0)
            return;
        return this.plugin.runTask(Task.create('Find Component', function (taskCtx) { return __awaiter(_this, void 0, void 0, function () {
            var data, sel, _a, _b, _i, _c, c, comp;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        data = (_d = structure.cell.obj) === null || _d === void 0 ? void 0 : _d.data;
                        if (!data)
                            return [2 /*return*/];
                        _b = (_a = StructureSelection).unionStructure;
                        return [4 /*yield*/, selection.getSelection(this.plugin, taskCtx, data)];
                    case 1:
                        sel = _b.apply(_a, [_f.sent()]);
                        for (_i = 0, _c = structure.components; _i < _c.length; _i++) {
                            c = _c[_i];
                            comp = (_e = c.cell.obj) === null || _e === void 0 ? void 0 : _e.data;
                            if (!comp || !c.cell.parent)
                                continue;
                            if (structureAreEqual(sel, comp))
                                return [2 /*return*/, c.cell];
                        }
                        return [2 /*return*/];
                }
            });
        }); }));
    };
    StructureComponentManager.prototype.add = function (params, structures) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.plugin.dataTransaction(function () { return __awaiter(_this, void 0, void 0, function () {
                        var xs, _a, hydrogens, quality, ignoreLight, material, clip, ignoreHydrogens, ignoreHydrogensVariant, typeParams, componentKey, _i, xs_1, s, component;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    xs = structures || this.currentStructures;
                                    if (xs.length === 0)
                                        return [2 /*return*/];
                                    _a = this.state.options, hydrogens = _a.hydrogens, quality = _a.visualQuality, ignoreLight = _a.ignoreLight, material = _a.materialStyle, clip = _a.clipObjects;
                                    ignoreHydrogens = hydrogens !== 'all';
                                    ignoreHydrogensVariant = hydrogens === 'only-polar' ? 'non-polar' : 'all';
                                    typeParams = { ignoreHydrogens: ignoreHydrogens, ignoreHydrogensVariant: ignoreHydrogensVariant, quality: quality, ignoreLight: ignoreLight, material: material, clip: clip };
                                    componentKey = UUID.create22();
                                    _i = 0, xs_1 = xs;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < xs_1.length)) return [3 /*break*/, 8];
                                    s = xs_1[_i];
                                    component = void 0;
                                    if (!params.options.checkExisting) return [3 /*break*/, 3];
                                    return [4 /*yield*/, this.tryFindComponent(s, params.selection)];
                                case 2:
                                    component = _b.sent();
                                    _b.label = 3;
                                case 3:
                                    if (!!component) return [3 /*break*/, 5];
                                    return [4 /*yield*/, this.plugin.builders.structure.tryCreateComponentFromSelection(s.cell, params.selection, componentKey, {
                                            label: params.options.label || (params.selection === StructureSelectionQueries.current ? 'Custom Selection' : ''),
                                        })];
                                case 4:
                                    component = _b.sent();
                                    _b.label = 5;
                                case 5:
                                    if (params.representation === 'none' || !component)
                                        return [3 /*break*/, 7];
                                    return [4 /*yield*/, this.plugin.builders.structure.representation.addRepresentation(component, {
                                            type: this.plugin.representation.structure.registry.get(params.representation),
                                            typeParams: typeParams
                                        })];
                                case 6:
                                    _b.sent();
                                    _b.label = 7;
                                case 7:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); }, { canUndo: 'Add Selection' })];
            });
        });
    };
    StructureComponentManager.prototype.applyTheme = function (params, structures) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.plugin.dataTransaction(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var xs, getLoci, _i, xs_2, s, p, p, p, p;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    xs = structures || this.currentStructures;
                                    if (xs.length === 0)
                                        return [2 /*return*/];
                                    getLoci = function (s) { return __awaiter(_this, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                _b = (_a = StructureSelection).toLociWithSourceUnits;
                                                return [4 /*yield*/, params.selection.getSelection(this.plugin, ctx, s)];
                                            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                                        }
                                    }); }); };
                                    _i = 0, xs_2 = xs;
                                    _a.label = 1;
                                case 1:
                                    if (!(_i < xs_2.length)) return [3 /*break*/, 14];
                                    s = xs_2[_i];
                                    if (!(params.action.name === 'color')) return [3 /*break*/, 3];
                                    p = params.action.params;
                                    return [4 /*yield*/, setStructureOverpaint(this.plugin, s.components, p.color, getLoci, params.representations)];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 13];
                                case 3:
                                    if (!(params.action.name === 'resetColor')) return [3 /*break*/, 5];
                                    return [4 /*yield*/, setStructureOverpaint(this.plugin, s.components, -1, getLoci, params.representations)];
                                case 4:
                                    _a.sent();
                                    return [3 /*break*/, 13];
                                case 5:
                                    if (!(params.action.name === 'transparency')) return [3 /*break*/, 7];
                                    p = params.action.params;
                                    return [4 /*yield*/, setStructureTransparency(this.plugin, s.components, p.value, getLoci, params.representations)];
                                case 6:
                                    _a.sent();
                                    return [3 /*break*/, 13];
                                case 7:
                                    if (!(params.action.name === 'material')) return [3 /*break*/, 9];
                                    p = params.action.params;
                                    return [4 /*yield*/, setStructureSubstance(this.plugin, s.components, p.material, getLoci, params.representations)];
                                case 8:
                                    _a.sent();
                                    return [3 /*break*/, 13];
                                case 9:
                                    if (!(params.action.name === 'resetMaterial')) return [3 /*break*/, 11];
                                    return [4 /*yield*/, setStructureSubstance(this.plugin, s.components, void 0, getLoci, params.representations)];
                                case 10:
                                    _a.sent();
                                    return [3 /*break*/, 13];
                                case 11:
                                    if (!(params.action.name === 'clipping')) return [3 /*break*/, 13];
                                    p = params.action.params;
                                    return [4 /*yield*/, setStructureClipping(this.plugin, s.components, Clipping.Groups.fromNames(p.excludeGroups), getLoci, params.representations)];
                                case 12:
                                    _a.sent();
                                    _a.label = 13;
                                case 13:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 14: return [2 /*return*/];
                            }
                        });
                    }); }, { canUndo: 'Apply Theme' })];
            });
        });
    };
    StructureComponentManager.prototype.modifyComponent = function (builder, component, by, action) {
        var _a, _b, _c;
        var structure = (_a = component.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structure)
            return;
        if ((action === 'subtract' || action === 'intersect') && !structureAreIntersecting(structure, by))
            return;
        var parent = (_b = component.structure.cell.obj) === null || _b === void 0 ? void 0 : _b.data;
        var modified = action === 'union'
            ? structureUnion(parent, [structure, by])
            : action === 'intersect'
                ? structureIntersect(structure, by)
                : structureSubtract(structure, by);
        if (modified.elementCount === 0) {
            builder.delete(component.cell.transform.ref);
        }
        else {
            var bundle = StructureElement.Bundle.fromSubStructure(parent, modified);
            var params = {
                type: { name: 'bundle', params: bundle },
                nullIfEmpty: true,
                label: (_c = component.cell.obj) === null || _c === void 0 ? void 0 : _c.label
            };
            builder.to(component.cell).update(params);
        }
    };
    StructureComponentManager.prototype.updateLabel = function (component, label) {
        var _a, _b;
        var params = {
            type: (_a = component.cell.params) === null || _a === void 0 ? void 0 : _a.values.type,
            nullIfEmpty: (_b = component.cell.params) === null || _b === void 0 ? void 0 : _b.values.nullIfEmpty,
            label: label
        };
        this.dataState.build().to(component.cell).update(params).commit();
    };
    Object.defineProperty(StructureComponentManager.prototype, "dataState", {
        get: function () {
            return this.plugin.state.data;
        },
        enumerable: false,
        configurable: true
    });
    StructureComponentManager.prototype.clearComponents = function (structures) {
        var deletes = this.dataState.build();
        for (var _i = 0, structures_2 = structures; _i < structures_2.length; _i++) {
            var s = structures_2[_i];
            for (var _a = 0, _b = s.components; _a < _b.length; _a++) {
                var c = _b[_a];
                deletes.delete(c.cell.transform.ref);
            }
        }
        return deletes.commit({ canUndo: 'Clear Selections' });
    };
    return StructureComponentManager;
}(StatefulPluginComponent));
(function (StructureComponentManager) {
    StructureComponentManager.OptionsParams = {
        hydrogens: PD.Select('all', [['all', 'Show All'], ['hide-all', 'Hide All'], ['only-polar', 'Only Polar']], { description: 'Determine display of hydrogen atoms in representations' }),
        visualQuality: PD.Select('auto', VisualQualityOptions, { description: 'Control the visual/rendering quality of representations' }),
        ignoreLight: PD.Boolean(false, { description: 'Ignore light for stylized rendering of representations' }),
        materialStyle: Material.getParam(),
        clipObjects: PD.Group(Clip.Params),
        interactions: PD.Group(InteractionsProvider.defaultParams, { label: 'Non-covalent Interactions' }),
    };
    function getAddParams(plugin, params) {
        var options = plugin.query.structure.registry.options;
        params = __assign({ pivot: plugin.managers.structure.component.pivotStructure, allowNone: true, hideSelection: false, checkExisting: false }, params);
        return {
            selection: PD.Select(options[1][0], options, { isHidden: params === null || params === void 0 ? void 0 : params.hideSelection }),
            representation: getRepresentationTypesSelect(plugin, params === null || params === void 0 ? void 0 : params.pivot, (params === null || params === void 0 ? void 0 : params.allowNone) ? [['none', '< Create Later >']] : []),
            options: PD.Group({
                label: PD.Text(''),
                checkExisting: PD.Boolean(!!(params === null || params === void 0 ? void 0 : params.checkExisting), { help: function () { return ({ description: 'Checks if a selection with the specifield elements already exists to avoid creating duplicate components.' }); } }),
            })
        };
    }
    StructureComponentManager.getAddParams = getAddParams;
    function getThemeParams(plugin, pivot) {
        var options = plugin.query.structure.registry.options;
        return {
            selection: PD.Select(options[1][0], options, { isHidden: false }),
            action: PD.MappedStatic('color', {
                color: PD.Group({
                    color: PD.Color(ColorNames.blue, { isExpanded: true }),
                }, { isFlat: true }),
                resetColor: PD.EmptyGroup({ label: 'Reset Color' }),
                transparency: PD.Group({
                    value: PD.Numeric(0.5, { min: 0, max: 1, step: 0.01 }),
                }, { isFlat: true }),
                material: PD.Group({
                    material: Material.getParam({ isFlat: true }),
                }, { isFlat: true }),
                resetMaterial: PD.EmptyGroup({ label: 'Reset Material' }),
                clipping: PD.Group({
                    excludeGroups: PD.MultiSelect([], PD.objectToOptions(Clipping.Groups.Names)),
                }, { isFlat: true }),
            }),
            representations: PD.MultiSelect([], getRepresentationTypes(plugin, pivot), { emptyValue: 'All' })
        };
    }
    StructureComponentManager.getThemeParams = getThemeParams;
    function getRepresentationTypes(plugin, pivot) {
        var _a, _b;
        return ((_a = pivot === null || pivot === void 0 ? void 0 : pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data)
            ? plugin.representation.structure.registry.getApplicableTypes((_b = pivot.cell.obj) === null || _b === void 0 ? void 0 : _b.data)
            : plugin.representation.structure.registry.types;
    }
    StructureComponentManager.getRepresentationTypes = getRepresentationTypes;
    function getRepresentationTypesSelect(plugin, pivot, custom, label) {
        var types = __spreadArray(__spreadArray([], custom, true), getRepresentationTypes(plugin, pivot), true);
        return PD.Select(types[0][0], types, { label: label });
    }
})(StructureComponentManager || (StructureComponentManager = {}));
