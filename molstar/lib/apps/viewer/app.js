/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __generator, __spreadArray } from "tslib";
import { ANVILMembraneOrientation } from '../../extensions/anvil/behavior';
import { CellPack } from '../../extensions/cellpack';
import { DnatcoNtCs } from '../../extensions/dnatco';
import { G3DFormat, G3dProvider } from '../../extensions/g3d/format';
import { Volseg, VolsegVolumeServerConfig } from '../../extensions/volumes-and-segmentations';
import { GeometryExport } from '../../extensions/geo-export';
import { MAQualityAssessment } from '../../extensions/model-archive/quality-assessment/behavior';
import { QualityAssessmentPLDDTPreset, QualityAssessmentQmeanPreset } from '../../extensions/model-archive/quality-assessment/behavior';
import { QualityAssessment } from '../../extensions/model-archive/quality-assessment/prop';
import { ModelExport } from '../../extensions/model-export';
import { Mp4Export } from '../../extensions/mp4-export';
import { PDBeStructureQualityReport } from '../../extensions/pdbe';
import { RCSBAssemblySymmetry, RCSBValidationReport } from '../../extensions/rcsb';
import { ZenodoImport } from '../../extensions/zenodo';
import { Volume } from '../../mol-model/volume';
import { DownloadStructure, PdbDownloadProvider } from '../../mol-plugin-state/actions/structure';
import { DownloadDensity } from '../../mol-plugin-state/actions/volume';
import { PresetStructureRepresentations, StructureRepresentationPresetProvider } from '../../mol-plugin-state/builder/structure/representation-preset';
import { createVolumeRepresentationParams } from '../../mol-plugin-state/helpers/volume-representation-params';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { TrajectoryFromModelAndCoordinates } from '../../mol-plugin-state/transforms/model';
import { createPluginUI } from '../../mol-plugin-ui/react18';
import { DefaultPluginUISpec } from '../../mol-plugin-ui/spec';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { PluginSpec } from '../../mol-plugin/spec';
import { StateObjectRef } from '../../mol-state';
import { Asset } from '../../mol-util/assets';
import '../../mol-util/polyfill';
import { ObjectKeys } from '../../mol-util/type-helpers';
import { Backgrounds } from '../../extensions/backgrounds';
import { SbNcbrPartialCharges, SbNcbrPartialChargesPreset, SbNcbrPartialChargesPropertyProvider } from '../../extensions/sb-ncbr';
import { wwPDBStructConnExtensionFunctions } from '../../extensions/wwpdb/struct-conn';
import { wwPDBChemicalComponentDictionary } from '../../extensions/wwpdb/ccd/behavior';
export { PLUGIN_VERSION as version } from '../../mol-plugin/version';
export { setDebugMode, setProductionMode, setTimingMode, consoleStats } from '../../mol-util/debug';
var CustomFormats = [
    ['g3d', G3dProvider]
];
var Extensions = {
    'volseg': PluginSpec.Behavior(Volseg),
    'backgrounds': PluginSpec.Behavior(Backgrounds),
    'cellpack': PluginSpec.Behavior(CellPack),
    'dnatco-ntcs': PluginSpec.Behavior(DnatcoNtCs),
    'pdbe-structure-quality-report': PluginSpec.Behavior(PDBeStructureQualityReport),
    'rcsb-assembly-symmetry': PluginSpec.Behavior(RCSBAssemblySymmetry),
    'rcsb-validation-report': PluginSpec.Behavior(RCSBValidationReport),
    'anvil-membrane-orientation': PluginSpec.Behavior(ANVILMembraneOrientation),
    'g3d': PluginSpec.Behavior(G3DFormat),
    'model-export': PluginSpec.Behavior(ModelExport),
    'mp4-export': PluginSpec.Behavior(Mp4Export),
    'geo-export': PluginSpec.Behavior(GeometryExport),
    'ma-quality-assessment': PluginSpec.Behavior(MAQualityAssessment),
    'zenodo-import': PluginSpec.Behavior(ZenodoImport),
    'sb-ncbr-partial-charges': PluginSpec.Behavior(SbNcbrPartialCharges),
    'wwpdb-chemical-component-dictionary': PluginSpec.Behavior(wwPDBChemicalComponentDictionary),
};
var DefaultViewerOptions = {
    customFormats: CustomFormats,
    extensions: ObjectKeys(Extensions),
    layoutIsExpanded: true,
    layoutShowControls: true,
    layoutShowRemoteState: true,
    layoutControlsDisplay: 'reactive',
    layoutShowSequence: true,
    layoutShowLog: true,
    layoutShowLeftPanel: true,
    collapseLeftPanel: false,
    collapseRightPanel: false,
    disableAntialiasing: PluginConfig.General.DisableAntialiasing.defaultValue,
    pixelScale: PluginConfig.General.PixelScale.defaultValue,
    pickScale: PluginConfig.General.PickScale.defaultValue,
    pickPadding: PluginConfig.General.PickPadding.defaultValue,
    enableWboit: PluginConfig.General.EnableWboit.defaultValue,
    enableDpoit: PluginConfig.General.EnableDpoit.defaultValue,
    preferWebgl1: PluginConfig.General.PreferWebGl1.defaultValue,
    allowMajorPerformanceCaveat: PluginConfig.General.AllowMajorPerformanceCaveat.defaultValue,
    powerPreference: PluginConfig.General.PowerPreference.defaultValue,
    viewportShowExpand: PluginConfig.Viewport.ShowExpand.defaultValue,
    viewportShowControls: PluginConfig.Viewport.ShowControls.defaultValue,
    viewportShowSettings: PluginConfig.Viewport.ShowSettings.defaultValue,
    viewportShowSelectionMode: PluginConfig.Viewport.ShowSelectionMode.defaultValue,
    viewportShowAnimation: PluginConfig.Viewport.ShowAnimation.defaultValue,
    viewportShowTrajectoryControls: PluginConfig.Viewport.ShowTrajectoryControls.defaultValue,
    pluginStateServer: PluginConfig.State.DefaultServer.defaultValue,
    volumeStreamingServer: PluginConfig.VolumeStreaming.DefaultServer.defaultValue,
    volumeStreamingDisabled: !PluginConfig.VolumeStreaming.Enabled.defaultValue,
    pdbProvider: PluginConfig.Download.DefaultPdbProvider.defaultValue,
    emdbProvider: PluginConfig.Download.DefaultEmdbProvider.defaultValue,
    saccharideCompIdMapType: 'default',
    volumesAndSegmentationsDefaultServer: VolsegVolumeServerConfig.DefaultServer.defaultValue,
};
var Viewer = /** @class */ (function () {
    function Viewer(plugin) {
        this.plugin = plugin;
    }
    Viewer.create = function (elementOrId, options) {
        var _a;
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var definedOptions, _i, _b, p, o, defaultSpec, spec, element, plugin;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        definedOptions = {};
                        // filter for defined properies only so the default values
                        // are property applied
                        for (_i = 0, _b = Object.keys(options); _i < _b.length; _i++) {
                            p = _b[_i];
                            if (options[p] !== void 0)
                                definedOptions[p] = options[p];
                        }
                        o = __assign(__assign({}, DefaultViewerOptions), definedOptions);
                        defaultSpec = DefaultPluginUISpec();
                        spec = {
                            actions: defaultSpec.actions,
                            behaviors: __spreadArray(__spreadArray([], defaultSpec.behaviors, true), o.extensions.map(function (e) { return Extensions[e]; }), true),
                            animations: __spreadArray([], defaultSpec.animations || [], true),
                            customParamEditors: defaultSpec.customParamEditors,
                            customFormats: o === null || o === void 0 ? void 0 : o.customFormats,
                            layout: {
                                initial: {
                                    isExpanded: o.layoutIsExpanded,
                                    showControls: o.layoutShowControls,
                                    controlsDisplay: o.layoutControlsDisplay,
                                    regionState: {
                                        bottom: 'full',
                                        left: o.collapseLeftPanel ? 'collapsed' : 'full',
                                        right: o.collapseRightPanel ? 'hidden' : 'full',
                                        top: 'full',
                                    }
                                },
                            },
                            components: __assign(__assign({}, defaultSpec.components), { controls: __assign(__assign({}, (_a = defaultSpec.components) === null || _a === void 0 ? void 0 : _a.controls), { top: o.layoutShowSequence ? undefined : 'none', bottom: o.layoutShowLog ? undefined : 'none', left: o.layoutShowLeftPanel ? undefined : 'none' }), remoteState: o.layoutShowRemoteState ? 'default' : 'none' }),
                            config: [
                                [PluginConfig.General.DisableAntialiasing, o.disableAntialiasing],
                                [PluginConfig.General.PixelScale, o.pixelScale],
                                [PluginConfig.General.PickScale, o.pickScale],
                                [PluginConfig.General.PickPadding, o.pickPadding],
                                [PluginConfig.General.EnableWboit, o.enableWboit],
                                [PluginConfig.General.EnableDpoit, o.enableDpoit],
                                [PluginConfig.General.PreferWebGl1, o.preferWebgl1],
                                [PluginConfig.General.AllowMajorPerformanceCaveat, o.allowMajorPerformanceCaveat],
                                [PluginConfig.General.PowerPreference, o.powerPreference],
                                [PluginConfig.Viewport.ShowExpand, o.viewportShowExpand],
                                [PluginConfig.Viewport.ShowControls, o.viewportShowControls],
                                [PluginConfig.Viewport.ShowSettings, o.viewportShowSettings],
                                [PluginConfig.Viewport.ShowSelectionMode, o.viewportShowSelectionMode],
                                [PluginConfig.Viewport.ShowAnimation, o.viewportShowAnimation],
                                [PluginConfig.Viewport.ShowTrajectoryControls, o.viewportShowTrajectoryControls],
                                [PluginConfig.State.DefaultServer, o.pluginStateServer],
                                [PluginConfig.State.CurrentServer, o.pluginStateServer],
                                [PluginConfig.VolumeStreaming.DefaultServer, o.volumeStreamingServer],
                                [PluginConfig.VolumeStreaming.Enabled, !o.volumeStreamingDisabled],
                                [PluginConfig.Download.DefaultPdbProvider, o.pdbProvider],
                                [PluginConfig.Download.DefaultEmdbProvider, o.emdbProvider],
                                [PluginConfig.Structure.DefaultRepresentationPreset, ViewerAutoPreset.id],
                                [PluginConfig.Structure.SaccharideCompIdMapType, o.saccharideCompIdMapType],
                                [VolsegVolumeServerConfig.DefaultServer, o.volumesAndSegmentationsDefaultServer],
                            ]
                        };
                        element = typeof elementOrId === 'string'
                            ? document.getElementById(elementOrId)
                            : elementOrId;
                        if (!element)
                            throw new Error("Could not get element with id '".concat(elementOrId, "'"));
                        return [4 /*yield*/, createPluginUI(element, spec, {
                                onBeforeUIRender: function (plugin) {
                                    // the preset needs to be added before the UI renders otherwise
                                    // "Download Structure" wont be able to pick it up
                                    plugin.builders.structure.representation.registerPreset(ViewerAutoPreset);
                                }
                            })];
                    case 1:
                        plugin = _c.sent();
                        return [2 /*return*/, new Viewer(plugin)];
                }
            });
        });
    };
    Viewer.prototype.setRemoteSnapshot = function (id) {
        var url = "".concat(this.plugin.config.get(PluginConfig.State.CurrentServer), "/get/").concat(id);
        return PluginCommands.State.Snapshots.Fetch(this.plugin, { url: url });
    };
    Viewer.prototype.loadSnapshotFromUrl = function (url, type) {
        return PluginCommands.State.Snapshots.OpenUrl(this.plugin, { url: url, type: type });
    };
    Viewer.prototype.loadStructureFromUrl = function (url, format, isBinary, options) {
        if (format === void 0) { format = 'mmcif'; }
        if (isBinary === void 0) { isBinary = false; }
        var params = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
            source: {
                name: 'url',
                params: {
                    url: Asset.Url(url),
                    format: format,
                    isBinary: isBinary,
                    label: options === null || options === void 0 ? void 0 : options.label,
                    options: __assign(__assign({}, params.source.params.options), { representationParams: options === null || options === void 0 ? void 0 : options.representationParams }),
                }
            }
        }));
    };
    Viewer.prototype.loadAllModelsOrAssemblyFromUrl = function (url, format, isBinary, options) {
        if (format === void 0) { format = 'mmcif'; }
        if (isBinary === void 0) { isBinary = false; }
        return __awaiter(this, void 0, void 0, function () {
            var plugin, data, trajectory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plugin = this.plugin;
                        return [4 /*yield*/, plugin.builders.data.download({ url: url, isBinary: isBinary }, { state: { isGhost: true } })];
                    case 1:
                        data = _a.sent();
                        return [4 /*yield*/, plugin.builders.structure.parseTrajectory(data, format)];
                    case 2:
                        trajectory = _a.sent();
                        return [4 /*yield*/, this.plugin.builders.structure.hierarchy.applyPreset(trajectory, 'all-models', { useDefaultIfSingleModel: true, representationPresetParams: options === null || options === void 0 ? void 0 : options.representationParams })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Viewer.prototype.loadStructureFromData = function (data, format, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _data, trajectory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.plugin.builders.data.rawData({ data: data, label: options === null || options === void 0 ? void 0 : options.dataLabel })];
                    case 1:
                        _data = _a.sent();
                        return [4 /*yield*/, this.plugin.builders.structure.parseTrajectory(_data, format)];
                    case 2:
                        trajectory = _a.sent();
                        return [4 /*yield*/, this.plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default')];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Viewer.prototype.loadPdb = function (pdb, options) {
        var params = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
        var provider = this.plugin.config.get(PluginConfig.Download.DefaultPdbProvider);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
            source: {
                name: 'pdb',
                params: {
                    provider: {
                        id: pdb,
                        server: {
                            name: provider,
                            params: PdbDownloadProvider[provider].defaultValue
                        }
                    },
                    options: __assign(__assign({}, params.source.params.options), { representationParams: options === null || options === void 0 ? void 0 : options.representationParams }),
                }
            }
        }));
    };
    Viewer.prototype.loadPdbDev = function (pdbDev) {
        var params = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
            source: {
                name: 'pdb-dev',
                params: {
                    provider: {
                        id: pdbDev,
                        encoding: 'bcif',
                    },
                    options: params.source.params.options,
                }
            }
        }));
    };
    Viewer.prototype.loadEmdb = function (emdb, options) {
        var _a;
        var provider = this.plugin.config.get(PluginConfig.Download.DefaultEmdbProvider);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadDensity, {
            source: {
                name: 'pdb-emd-ds',
                params: {
                    provider: {
                        id: emdb,
                        server: provider,
                    },
                    detail: (_a = options === null || options === void 0 ? void 0 : options.detail) !== null && _a !== void 0 ? _a : 3,
                }
            }
        }));
    };
    Viewer.prototype.loadAlphaFoldDb = function (afdb) {
        var params = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
            source: {
                name: 'alphafolddb',
                params: {
                    id: afdb,
                    options: __assign(__assign({}, params.source.params.options), { representation: 'preset-structure-representation-ma-quality-assessment-plddt' }),
                }
            }
        }));
    };
    Viewer.prototype.loadModelArchive = function (id) {
        var params = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
            source: {
                name: 'modelarchive',
                params: {
                    id: id,
                    options: params.source.params.options,
                }
            }
        }));
    };
    /**
     * @example Load X-ray density from volume server
        viewer.loadVolumeFromUrl({
            url: 'https://www.ebi.ac.uk/pdbe/densities/x-ray/1tqn/cell?detail=3',
            format: 'dscif',
            isBinary: true
        }, [{
            type: 'relative',
            value: 1.5,
            color: 0x3362B2
        }, {
            type: 'relative',
            value: 3,
            color: 0x33BB33,
            volumeIndex: 1
        }, {
            type: 'relative',
            value: -3,
            color: 0xBB3333,
            volumeIndex: 1
        }], {
            entryId: ['2FO-FC', 'FO-FC'],
            isLazy: true
        });
     * *********************
     * @example Load EM density from volume server
        viewer.loadVolumeFromUrl({
            url: 'https://maps.rcsb.org/em/emd-30210/cell?detail=6',
            format: 'dscif',
            isBinary: true
        }, [{
            type: 'relative',
            value: 1,
            color: 0x3377aa
        }], {
            entryId: 'EMD-30210',
            isLazy: true
        });
     */
    Viewer.prototype.loadVolumeFromUrl = function (_a, isovalues, options) {
        var url = _a.url, format = _a.format, isBinary = _a.isBinary;
        return __awaiter(this, void 0, void 0, function () {
            var plugin, update_1;
            var _this = this;
            return __generator(this, function (_b) {
                plugin = this.plugin;
                if (!plugin.dataFormats.get(format)) {
                    throw new Error("Unknown density format: ".concat(format));
                }
                if (options === null || options === void 0 ? void 0 : options.isLazy) {
                    update_1 = this.plugin.build();
                    update_1.toRoot().apply(StateTransforms.Data.LazyVolume, {
                        url: url,
                        format: format,
                        entryId: options === null || options === void 0 ? void 0 : options.entryId,
                        isBinary: isBinary,
                        isovalues: isovalues.map(function (v) { return (__assign({ alpha: 1, volumeIndex: 0 }, v)); })
                    });
                    return [2 /*return*/, update_1.commit()];
                }
                return [2 /*return*/, plugin.dataTransaction(function () { return __awaiter(_this, void 0, void 0, function () {
                        var data, parsed, firstVolume, repr, _i, isovalues_1, iso, volume, volumeData;
                        var _a, _b, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0: return [4 /*yield*/, plugin.builders.data.download({ url: url, isBinary: isBinary }, { state: { isGhost: true } })];
                                case 1:
                                    data = _e.sent();
                                    return [4 /*yield*/, plugin.dataFormats.get(format).parse(plugin, data, { entryId: options === null || options === void 0 ? void 0 : options.entryId })];
                                case 2:
                                    parsed = _e.sent();
                                    firstVolume = (parsed.volume || parsed.volumes[0]);
                                    if (!(firstVolume === null || firstVolume === void 0 ? void 0 : firstVolume.isOk))
                                        throw new Error('Failed to parse any volume.');
                                    repr = plugin.build();
                                    for (_i = 0, isovalues_1 = isovalues; _i < isovalues_1.length; _i++) {
                                        iso = isovalues_1[_i];
                                        volume = (_c = (_a = parsed.volumes) === null || _a === void 0 ? void 0 : _a[(_b = iso.volumeIndex) !== null && _b !== void 0 ? _b : 0]) !== null && _c !== void 0 ? _c : parsed.volume;
                                        volumeData = volume.cell.obj.data;
                                        repr
                                            .to(volume)
                                            .apply(StateTransforms.Representation.VolumeRepresentation3D, createVolumeRepresentationParams(this.plugin, firstVolume.data, {
                                            type: 'isosurface',
                                            typeParams: { alpha: (_d = iso.alpha) !== null && _d !== void 0 ? _d : 1, isoValue: Volume.adjustedIsoValue(volumeData, iso.value, iso.type) },
                                            color: 'uniform',
                                            colorParams: { value: iso.color }
                                        }));
                                    }
                                    return [4 /*yield*/, repr.commit()];
                                case 3:
                                    _e.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * @example
     *  viewer.loadTrajectory({
     *      model: { kind: 'model-url', url: 'villin.gro', format: 'gro' },
     *      coordinates: { kind: 'coordinates-url', url: 'villin.xtc', format: 'xtc', isBinary: true },
     *      preset: 'all-models' // or 'default'
     *  });
     */
    Viewer.prototype.loadTrajectory = function (params) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var plugin, model, data_1, _c, trajectory_1, data_2, _d, provider_1, data, _e, provider, coords, trajectory, preset;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        plugin = this.plugin;
                        if (!(params.model.kind === 'model-data' || params.model.kind === 'model-url')) return [3 /*break*/, 7];
                        if (!(params.model.kind === 'model-data')) return [3 /*break*/, 2];
                        return [4 /*yield*/, plugin.builders.data.rawData({ data: params.model.data, label: params.modelLabel })];
                    case 1:
                        _c = _f.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, plugin.builders.data.download({ url: params.model.url, isBinary: params.model.isBinary, label: params.modelLabel })];
                    case 3:
                        _c = _f.sent();
                        _f.label = 4;
                    case 4:
                        data_1 = _c;
                        return [4 /*yield*/, plugin.builders.structure.parseTrajectory(data_1, (_a = params.model.format) !== null && _a !== void 0 ? _a : 'mmcif')];
                    case 5:
                        trajectory_1 = _f.sent();
                        return [4 /*yield*/, plugin.builders.structure.createModel(trajectory_1)];
                    case 6:
                        model = _f.sent();
                        return [3 /*break*/, 13];
                    case 7:
                        if (!(params.model.kind === 'topology-data')) return [3 /*break*/, 9];
                        return [4 /*yield*/, plugin.builders.data.rawData({ data: params.model.data, label: params.modelLabel })];
                    case 8:
                        _d = _f.sent();
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, plugin.builders.data.download({ url: params.model.url, isBinary: params.model.isBinary, label: params.modelLabel })];
                    case 10:
                        _d = _f.sent();
                        _f.label = 11;
                    case 11:
                        data_2 = _d;
                        provider_1 = plugin.dataFormats.get(params.model.format);
                        return [4 /*yield*/, provider_1.parse(plugin, data_2)];
                    case 12:
                        model = _f.sent();
                        _f.label = 13;
                    case 13:
                        if (!(params.coordinates.kind === 'coordinates-data')) return [3 /*break*/, 15];
                        return [4 /*yield*/, plugin.builders.data.rawData({ data: params.coordinates.data, label: params.coordinatesLabel })];
                    case 14:
                        _e = _f.sent();
                        return [3 /*break*/, 17];
                    case 15: return [4 /*yield*/, plugin.builders.data.download({ url: params.coordinates.url, isBinary: params.coordinates.isBinary, label: params.coordinatesLabel })];
                    case 16:
                        _e = _f.sent();
                        _f.label = 17;
                    case 17:
                        data = _e;
                        provider = plugin.dataFormats.get(params.coordinates.format);
                        return [4 /*yield*/, provider.parse(plugin, data)];
                    case 18:
                        coords = _f.sent();
                        return [4 /*yield*/, plugin.build().toRoot()
                                .apply(TrajectoryFromModelAndCoordinates, {
                                modelRef: model.ref,
                                coordinatesRef: coords.ref
                            }, { dependsOn: [model.ref, coords.ref] })
                                .commit()];
                    case 19:
                        trajectory = _f.sent();
                        return [4 /*yield*/, plugin.builders.structure.hierarchy.applyPreset(trajectory, (_b = params.preset) !== null && _b !== void 0 ? _b : 'default')];
                    case 20:
                        preset = _f.sent();
                        return [2 /*return*/, { model: model, coords: coords, preset: preset }];
                }
            });
        });
    };
    Viewer.prototype.handleResize = function () {
        this.plugin.layout.events.updated.next(void 0);
    };
    return Viewer;
}());
export { Viewer };
export var ViewerAutoPreset = StructureRepresentationPresetProvider({
    id: 'preset-structure-representation-viewer-auto',
    display: {
        name: 'Automatic (w/ Annotation)', group: 'Annotation',
        description: 'Show standard automatic representation but colored by quality assessment (if available in the model).'
    },
    isApplicable: function (a) {
        return (!!a.data.models.some(function (m) { return QualityAssessment.isApplicable(m, 'pLDDT'); }) ||
            !!a.data.models.some(function (m) { return QualityAssessment.isApplicable(m, 'qmean'); }));
    },
    params: function () { return StructureRepresentationPresetProvider.CommonParams; },
    apply: function (ref, params, plugin) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var structureCell, structure;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
                        structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
                        if (!structureCell || !structure)
                            return [2 /*return*/, {}];
                        if (!!!structure.models.some(function (m) { return QualityAssessment.isApplicable(m, 'pLDDT'); })) return [3 /*break*/, 2];
                        return [4 /*yield*/, QualityAssessmentPLDDTPreset.apply(ref, params, plugin)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        if (!!!structure.models.some(function (m) { return QualityAssessment.isApplicable(m, 'qmean'); })) return [3 /*break*/, 4];
                        return [4 /*yield*/, QualityAssessmentQmeanPreset.apply(ref, params, plugin)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        if (!!!structure.models.some(function (m) { return SbNcbrPartialChargesPropertyProvider.isApplicable(m); })) return [3 /*break*/, 6];
                        return [4 /*yield*/, SbNcbrPartialChargesPreset.apply(ref, params, plugin)];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, PresetStructureRepresentations.auto.apply(ref, params, plugin)];
                    case 7: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }
});
export var PluginExtensions = {
    wwPDBStructConn: wwPDBStructConnExtensionFunctions,
};
