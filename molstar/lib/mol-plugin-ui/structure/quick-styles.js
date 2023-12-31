import { __assign, __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PresetStructureRepresentations } from '../../mol-plugin-state/builder/structure/representation-preset';
import { Color } from '../../mol-util/color';
import { CollapsableControls, PurePluginUIComponent } from '../base';
import { Button } from '../controls/common';
import { MagicWandSvg } from '../controls/icons';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PostprocessingParams } from '../../mol-canvas3d/passes/postprocessing';
import { PluginConfig } from '../../mol-plugin/config';
import { StructureComponentManager } from '../../mol-plugin-state/manager/structure/component';
var StructureQuickStylesControls = /** @class */ (function (_super) {
    __extends(StructureQuickStylesControls, _super);
    function StructureQuickStylesControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StructureQuickStylesControls.prototype.defaultState = function () {
        return {
            isCollapsed: false,
            header: 'Quick Styles',
            brand: { accent: 'gray', svg: MagicWandSvg }
        };
    };
    StructureQuickStylesControls.prototype.renderControls = function () {
        return _jsx(_Fragment, { children: _jsx(QuickStyles, {}) });
    };
    return StructureQuickStylesControls;
}(CollapsableControls));
export { StructureQuickStylesControls };
var QuickStyles = /** @class */ (function (_super) {
    __extends(QuickStyles, _super);
    function QuickStyles() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QuickStyles.prototype.default = function () {
        return __awaiter(this, void 0, void 0, function () {
            var structures, preset, provider, p;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        structures = this.plugin.managers.structure.hierarchy.selection.structures;
                        preset = this.plugin.config.get(PluginConfig.Structure.DefaultRepresentationPreset) || PresetStructureRepresentations.auto.id;
                        provider = this.plugin.builders.structure.representation.resolveProvider(preset);
                        return [4 /*yield*/, this.plugin.managers.structure.component.applyPreset(structures, provider)];
                    case 1:
                        _a.sent();
                        this.plugin.managers.structure.component.setOptions(PD.getDefaultValues(StructureComponentManager.OptionsParams));
                        if (this.plugin.canvas3d) {
                            p = PD.getDefaultValues(PostprocessingParams);
                            this.plugin.canvas3d.setProps({
                                postprocessing: { outline: p.outline, occlusion: p.occlusion }
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    QuickStyles.prototype.illustrative = function () {
        return __awaiter(this, void 0, void 0, function () {
            var structures;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        structures = this.plugin.managers.structure.hierarchy.selection.structures;
                        return [4 /*yield*/, this.plugin.managers.structure.component.applyPreset(structures, PresetStructureRepresentations.illustrative)];
                    case 1:
                        _a.sent();
                        if (this.plugin.canvas3d) {
                            this.plugin.canvas3d.setProps({
                                postprocessing: {
                                    outline: {
                                        name: 'on',
                                        params: {
                                            scale: 1,
                                            color: Color(0x000000),
                                            threshold: 0.25,
                                            includeTransparent: true,
                                        }
                                    },
                                    occlusion: {
                                        name: 'on',
                                        params: {
                                            multiScale: { name: 'off', params: {} },
                                            radius: 5,
                                            bias: 0.8,
                                            blurKernelSize: 15,
                                            samples: 32,
                                            resolutionScale: 1,
                                            color: Color(0x000000),
                                        }
                                    },
                                    shadow: { name: 'off', params: {} },
                                }
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    QuickStyles.prototype.stylized = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pp;
            return __generator(this, function (_a) {
                this.plugin.managers.structure.component.setOptions(__assign(__assign({}, this.plugin.managers.structure.component.state.options), { ignoreLight: true }));
                if (this.plugin.canvas3d) {
                    pp = this.plugin.canvas3d.props.postprocessing;
                    this.plugin.canvas3d.setProps({
                        postprocessing: {
                            outline: {
                                name: 'on',
                                params: pp.outline.name === 'on'
                                    ? pp.outline.params
                                    : {
                                        scale: 1,
                                        color: Color(0x000000),
                                        threshold: 0.33,
                                        includeTransparent: true,
                                    }
                            },
                            occlusion: {
                                name: 'on',
                                params: pp.occlusion.name === 'on'
                                    ? pp.occlusion.params
                                    : {
                                        multiScale: { name: 'off', params: {} },
                                        radius: 5,
                                        bias: 0.8,
                                        blurKernelSize: 15,
                                        samples: 32,
                                        resolutionScale: 1,
                                        color: Color(0x000000),
                                    }
                            },
                            shadow: { name: 'off', params: {} },
                        }
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    QuickStyles.prototype.render = function () {
        var _this = this;
        return _jsxs("div", { className: 'msp-flex-row', children: [_jsx(Button, { noOverflow: true, title: 'Applies default representation preset. Set outline and occlusion effects to defaults.', onClick: function () { return _this.default(); }, style: { width: 'auto' }, children: "Default" }), _jsx(Button, { noOverflow: true, title: 'Applies no representation preset. Enables outline and occlusion effects. Enables ignore-light representation parameter.', onClick: function () { return _this.stylized(); }, style: { width: 'auto' }, children: "Stylized" }), _jsx(Button, { noOverflow: true, title: 'Applies illustrative representation preset. Enables outline and occlusion effects. Enables ignore-light parameter.', onClick: function () { return _this.illustrative(); }, style: { width: 'auto' }, children: "Illustrative" })] });
    };
    return QuickStyles;
}(PurePluginUIComponent));
export { QuickStyles };
