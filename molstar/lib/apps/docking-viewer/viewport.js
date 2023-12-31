import { __assign, __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { InteractionsRepresentationProvider } from '../../mol-model-props/computed/representations/interactions';
import { InteractionTypeColorThemeProvider } from '../../mol-model-props/computed/themes/interaction-type';
import { presetStaticComponent, StructureRepresentationPresetProvider } from '../../mol-plugin-state/builder/structure/representation-preset';
import { StructureSelectionQueries, StructureSelectionQuery } from '../../mol-plugin-state/helpers/structure-selection-query';
import { PluginUIComponent } from '../../mol-plugin-ui/base';
import { LociLabels } from '../../mol-plugin-ui/controls';
import { Button } from '../../mol-plugin-ui/controls/common';
import { BackgroundTaskProgress } from '../../mol-plugin-ui/task';
import { Toasts } from '../../mol-plugin-ui/toast';
import { Viewport, ViewportControls } from '../../mol-plugin-ui/viewport';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { MolScriptBuilder as MS } from '../../mol-script/language/builder';
import { StateObjectRef } from '../../mol-state';
import { Color } from '../../mol-util/color';
import { Material } from '../../mol-util/material';
function shinyStyle(plugin) {
    return PluginCommands.Canvas3D.SetSettings(plugin, { settings: {
            renderer: __assign({}, plugin.canvas3d.props.renderer),
            postprocessing: __assign(__assign({}, plugin.canvas3d.props.postprocessing), { occlusion: { name: 'off', params: {} }, shadow: { name: 'off', params: {} }, outline: { name: 'off', params: {} } })
        } });
}
function occlusionStyle(plugin) {
    return PluginCommands.Canvas3D.SetSettings(plugin, { settings: {
            renderer: __assign({}, plugin.canvas3d.props.renderer),
            postprocessing: __assign(__assign({}, plugin.canvas3d.props.postprocessing), { occlusion: { name: 'on', params: {
                        blurKernelSize: 15,
                        multiScale: { name: 'off', params: {} },
                        radius: 5,
                        bias: 0.8,
                        samples: 32,
                        resolutionScale: 1,
                        color: Color(0x000000),
                    } }, outline: { name: 'on', params: {
                        scale: 1.0,
                        threshold: 0.33,
                        color: Color(0x0000),
                        includeTransparent: true,
                    } }, shadow: { name: 'off', params: {} } })
        } });
}
var ligandPlusSurroundings = StructureSelectionQuery('Surrounding Residues (5 \u212B) of Ligand plus Ligand itself', MS.struct.modifier.union([
    MS.struct.modifier.includeSurroundings({
        0: StructureSelectionQueries.ligand.expression,
        radius: 5,
        'as-whole-residues': true
    })
]));
var ligandSurroundings = StructureSelectionQuery('Surrounding Residues (5 \u212B) of Ligand', MS.struct.modifier.union([
    MS.struct.modifier.exceptBy({
        0: ligandPlusSurroundings.expression,
        by: StructureSelectionQueries.ligand.expression
    })
]));
var PresetParams = __assign({}, StructureRepresentationPresetProvider.CommonParams);
var CustomMaterial = Material({ roughness: 0.2, metalness: 0 });
export var StructurePreset = StructureRepresentationPresetProvider({
    id: 'preset-structure',
    display: { name: 'Structure' },
    params: function () { return PresetParams; },
    apply: function (ref, params, plugin) {
        return __awaiter(this, void 0, void 0, function () {
            var structureCell, components, _a, update, builder, typeParams, representations;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
                        if (!structureCell)
                            return [2 /*return*/, {}];
                        _b = {};
                        return [4 /*yield*/, presetStaticComponent(plugin, structureCell, 'ligand')];
                    case 1:
                        _b.ligand = _c.sent();
                        return [4 /*yield*/, presetStaticComponent(plugin, structureCell, 'polymer')];
                    case 2:
                        components = (_b.polymer = _c.sent(),
                            _b);
                        _a = StructureRepresentationPresetProvider.reprBuilder(plugin, params), update = _a.update, builder = _a.builder, typeParams = _a.typeParams;
                        representations = {
                            ligand: builder.buildRepresentation(update, components.ligand, { type: 'ball-and-stick', typeParams: __assign(__assign({}, typeParams), { material: CustomMaterial, sizeFactor: 0.35 }), color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
                            polymer: builder.buildRepresentation(update, components.polymer, { type: 'cartoon', typeParams: __assign(__assign({}, typeParams), { material: CustomMaterial }), color: 'chain-id', colorParams: { palette: plugin.customState.colorPalette } }, { tag: 'polymer' }),
                        };
                        return [4 /*yield*/, update.commit({ revertOnError: true })];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, shinyStyle(plugin)];
                    case 4:
                        _c.sent();
                        plugin.managers.interactivity.setProps({ granularity: 'residue' });
                        return [2 /*return*/, { components: components, representations: representations }];
                }
            });
        });
    }
});
export var IllustrativePreset = StructureRepresentationPresetProvider({
    id: 'preset-illustrative',
    display: { name: 'Illustrative' },
    params: function () { return PresetParams; },
    apply: function (ref, params, plugin) {
        return __awaiter(this, void 0, void 0, function () {
            var structureCell, components, _a, update, builder, typeParams, representations;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
                        if (!structureCell)
                            return [2 /*return*/, {}];
                        _b = {};
                        return [4 /*yield*/, presetStaticComponent(plugin, structureCell, 'ligand')];
                    case 1:
                        _b.ligand = _c.sent();
                        return [4 /*yield*/, presetStaticComponent(plugin, structureCell, 'polymer')];
                    case 2:
                        components = (_b.polymer = _c.sent(),
                            _b);
                        _a = StructureRepresentationPresetProvider.reprBuilder(plugin, params), update = _a.update, builder = _a.builder, typeParams = _a.typeParams;
                        representations = {
                            ligand: builder.buildRepresentation(update, components.ligand, { type: 'spacefill', typeParams: __assign(__assign({}, typeParams), { ignoreLight: true }), color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
                            polymer: builder.buildRepresentation(update, components.polymer, { type: 'spacefill', typeParams: __assign(__assign({}, typeParams), { ignoreLight: true }), color: 'illustrative', colorParams: { palette: plugin.customState.colorPalette } }, { tag: 'polymer' }),
                        };
                        return [4 /*yield*/, update.commit({ revertOnError: true })];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, occlusionStyle(plugin)];
                    case 4:
                        _c.sent();
                        plugin.managers.interactivity.setProps({ granularity: 'residue' });
                        return [2 /*return*/, { components: components, representations: representations }];
                }
            });
        });
    }
});
var SurfacePreset = StructureRepresentationPresetProvider({
    id: 'preset-surface',
    display: { name: 'Surface' },
    params: function () { return PresetParams; },
    apply: function (ref, params, plugin) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var structureCell, structure, components, _b, update, builder, typeParams, representations;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
                        structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
                        if (!structureCell || !structure)
                            return [2 /*return*/, {}];
                        _c = {};
                        return [4 /*yield*/, presetStaticComponent(plugin, structureCell, 'ligand')];
                    case 1:
                        _c.ligand = _d.sent();
                        return [4 /*yield*/, presetStaticComponent(plugin, structureCell, 'polymer')];
                    case 2:
                        components = (_c.polymer = _d.sent(),
                            _c);
                        _b = StructureRepresentationPresetProvider.reprBuilder(plugin, params), update = _b.update, builder = _b.builder, typeParams = _b.typeParams;
                        representations = {
                            ligand: builder.buildRepresentation(update, components.ligand, { type: 'ball-and-stick', typeParams: __assign(__assign({}, typeParams), { material: CustomMaterial, sizeFactor: 0.26 }), color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
                            polymer: builder.buildRepresentation(update, components.polymer, { type: 'molecular-surface', typeParams: __assign(__assign({}, typeParams), { material: CustomMaterial, quality: 'custom', resolution: 0.5, doubleSided: true }), color: 'partial-charge' }, { tag: 'polymer' }),
                        };
                        return [4 /*yield*/, update.commit({ revertOnError: true })];
                    case 3:
                        _d.sent();
                        return [4 /*yield*/, shinyStyle(plugin)];
                    case 4:
                        _d.sent();
                        plugin.managers.interactivity.setProps({ granularity: 'residue' });
                        return [2 /*return*/, { components: components, representations: representations }];
                }
            });
        });
    }
});
var PocketPreset = StructureRepresentationPresetProvider({
    id: 'preset-pocket',
    display: { name: 'Pocket' },
    params: function () { return PresetParams; },
    apply: function (ref, params, plugin) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var structureCell, structure, components, _b, update, builder, typeParams, representations;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
                        structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
                        if (!structureCell || !structure)
                            return [2 /*return*/, {}];
                        _c = {};
                        return [4 /*yield*/, presetStaticComponent(plugin, structureCell, 'ligand')];
                    case 1:
                        _c.ligand = _d.sent();
                        return [4 /*yield*/, plugin.builders.structure.tryCreateComponentFromSelection(structureCell, ligandSurroundings, "surroundings")];
                    case 2:
                        components = (_c.surroundings = _d.sent(),
                            _c);
                        _b = StructureRepresentationPresetProvider.reprBuilder(plugin, params), update = _b.update, builder = _b.builder, typeParams = _b.typeParams;
                        representations = {
                            ligand: builder.buildRepresentation(update, components.ligand, { type: 'ball-and-stick', typeParams: __assign(__assign({}, typeParams), { material: CustomMaterial, sizeFactor: 0.26 }), color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
                            surroundings: builder.buildRepresentation(update, components.surroundings, { type: 'molecular-surface', typeParams: __assign(__assign({}, typeParams), { material: CustomMaterial, includeParent: true, quality: 'custom', resolution: 0.2, doubleSided: true }), color: 'partial-charge' }, { tag: 'surroundings' }),
                        };
                        return [4 /*yield*/, update.commit({ revertOnError: true })];
                    case 3:
                        _d.sent();
                        return [4 /*yield*/, shinyStyle(plugin)];
                    case 4:
                        _d.sent();
                        plugin.managers.interactivity.setProps({ granularity: 'element' });
                        return [2 /*return*/, { components: components, representations: representations }];
                }
            });
        });
    }
});
var InteractionsPreset = StructureRepresentationPresetProvider({
    id: 'preset-interactions',
    display: { name: 'Interactions' },
    params: function () { return PresetParams; },
    apply: function (ref, params, plugin) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var structureCell, structure, components, _b, update, builder, typeParams, representations;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
                        structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
                        if (!structureCell || !structure)
                            return [2 /*return*/, {}];
                        _c = {};
                        return [4 /*yield*/, presetStaticComponent(plugin, structureCell, 'ligand')];
                    case 1:
                        _c.ligand = _d.sent();
                        return [4 /*yield*/, plugin.builders.structure.tryCreateComponentFromSelection(structureCell, ligandSurroundings, "surroundings")];
                    case 2:
                        _c.surroundings = _d.sent();
                        return [4 /*yield*/, presetStaticComponent(plugin, structureCell, 'ligand')];
                    case 3:
                        components = (_c.interactions = _d.sent(),
                            _c);
                        _b = StructureRepresentationPresetProvider.reprBuilder(plugin, params), update = _b.update, builder = _b.builder, typeParams = _b.typeParams;
                        representations = {
                            ligand: builder.buildRepresentation(update, components.ligand, { type: 'ball-and-stick', typeParams: __assign(__assign({}, typeParams), { material: CustomMaterial, sizeFactor: 0.3 }), color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
                            ballAndStick: builder.buildRepresentation(update, components.surroundings, { type: 'ball-and-stick', typeParams: __assign(__assign({}, typeParams), { material: CustomMaterial, sizeFactor: 0.1, sizeAspectRatio: 1 }), color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ball-and-stick' }),
                            interactions: builder.buildRepresentation(update, components.interactions, { type: InteractionsRepresentationProvider, typeParams: __assign(__assign({}, typeParams), { material: CustomMaterial, includeParent: true, parentDisplay: 'between' }), color: InteractionTypeColorThemeProvider }, { tag: 'interactions' }),
                            label: builder.buildRepresentation(update, components.surroundings, { type: 'label', typeParams: __assign(__assign({}, typeParams), { material: CustomMaterial, background: false, borderWidth: 0.1 }), color: 'uniform', colorParams: { value: Color(0x000000) } }, { tag: 'label' }),
                        };
                        return [4 /*yield*/, update.commit({ revertOnError: true })];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, shinyStyle(plugin)];
                    case 5:
                        _d.sent();
                        plugin.managers.interactivity.setProps({ granularity: 'element' });
                        return [2 /*return*/, { components: components, representations: representations }];
                }
            });
        });
    }
});
export var ShowButtons = PluginConfig.item('showButtons', true);
var ViewportComponent = /** @class */ (function (_super) {
    __extends(ViewportComponent, _super);
    function ViewportComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.set = function (preset) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._set(this.plugin.managers.structure.hierarchy.selection.structures, preset)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.structurePreset = function () { return _this.set(StructurePreset); };
        _this.illustrativePreset = function () { return _this.set(IllustrativePreset); };
        _this.surfacePreset = function () { return _this.set(SurfacePreset); };
        _this.pocketPreset = function () { return _this.set(PocketPreset); };
        _this.interactionsPreset = function () { return _this.set(InteractionsPreset); };
        return _this;
    }
    ViewportComponent.prototype._set = function (structures, preset) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.plugin.managers.structure.component.clear(structures)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.plugin.managers.structure.component.applyPreset(structures, preset)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(ViewportComponent.prototype, "showButtons", {
        get: function () {
            return this.plugin.config.get(ShowButtons);
        },
        enumerable: false,
        configurable: true
    });
    ViewportComponent.prototype.render = function () {
        var _a, _b;
        var VPControls = ((_b = (_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.viewport) === null || _b === void 0 ? void 0 : _b.controls) || ViewportControls;
        return _jsxs(_Fragment, { children: [_jsx(Viewport, {}), this.showButtons && _jsxs("div", { className: 'msp-viewport-top-left-controls', children: [_jsx("div", { style: { marginBottom: '4px' }, children: _jsx(Button, { onClick: this.structurePreset, children: "Structure" }) }), _jsx("div", { style: { marginBottom: '4px' }, children: _jsx(Button, { onClick: this.illustrativePreset, children: "Illustrative" }) }), _jsx("div", { style: { marginBottom: '4px' }, children: _jsx(Button, { onClick: this.surfacePreset, children: "Surface" }) }), _jsx("div", { style: { marginBottom: '4px' }, children: _jsx(Button, { onClick: this.interactionsPreset, children: "Interactions" }) })] }), _jsx(VPControls, {}), _jsx(BackgroundTaskProgress, {}), _jsxs("div", { className: 'msp-highlight-toast-wrapper', children: [_jsx(LociLabels, {}), _jsx(Toasts, {})] })] });
    };
    return ViewportComponent;
}(PluginUIComponent));
export { ViewportComponent };
