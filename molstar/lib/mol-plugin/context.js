/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __awaiter, __generator } from "tslib";
import produce, { setAutoFreeze } from 'immer';
import { List } from 'immutable';
import { merge } from 'rxjs';
import { debounceTime, filter, take, throttleTime } from 'rxjs/operators';
import { Canvas3D, Canvas3DContext, DefaultCanvas3DParams } from '../mol-canvas3d/canvas3d';
import { resizeCanvas } from '../mol-canvas3d/util';
import { Vec2 } from '../mol-math/linear-algebra';
import { CustomProperty } from '../mol-model-props/common/custom-property';
import { DataBuilder } from '../mol-plugin-state/builder/data';
import { StructureBuilder } from '../mol-plugin-state/builder/structure';
import { DataFormatRegistry } from '../mol-plugin-state/formats/registry';
import { StructureSelectionQueryRegistry } from '../mol-plugin-state/helpers/structure-selection-query';
import { PluginAnimationManager } from '../mol-plugin-state/manager/animation';
import { CameraManager } from '../mol-plugin-state/manager/camera';
import { InteractivityManager } from '../mol-plugin-state/manager/interactivity';
import { LociLabelManager } from '../mol-plugin-state/manager/loci-label';
import { PluginStateSnapshotManager } from '../mol-plugin-state/manager/snapshots';
import { StructureComponentManager } from '../mol-plugin-state/manager/structure/component';
import { StructureFocusManager } from '../mol-plugin-state/manager/structure/focus';
import { StructureHierarchyManager } from '../mol-plugin-state/manager/structure/hierarchy';
import { StructureMeasurementManager } from '../mol-plugin-state/manager/structure/measurement';
import { StructureSelectionManager } from '../mol-plugin-state/manager/structure/selection';
import { VolumeHierarchyManager } from '../mol-plugin-state/manager/volume/hierarchy';
import { PluginLayout } from './layout';
import { Representation } from '../mol-repr/representation';
import { StructureRepresentationRegistry } from '../mol-repr/structure/registry';
import { VolumeRepresentationRegistry } from '../mol-repr/volume/registry';
import { StateTransform } from '../mol-state';
import { Scheduler, Task } from '../mol-task';
import { ColorTheme } from '../mol-theme/color';
import { SizeTheme } from '../mol-theme/size';
import { AssetManager } from '../mol-util/assets';
import { Color } from '../mol-util/color';
import { ajaxGet } from '../mol-util/data-source';
import { isDebugMode, isProductionMode } from '../mol-util/debug';
import { EmptyKeyInput, ModifiersKeys } from '../mol-util/input/input-observer';
import { LogEntry } from '../mol-util/log-entry';
import { objectForEach } from '../mol-util/object';
import { RxEventHelper } from '../mol-util/rx-event-helper';
import { PluginAnimationLoop } from './animation-loop';
import { BuiltInPluginBehaviors } from './behavior';
import { PluginBehavior } from './behavior/behavior';
import { PluginCommandManager } from './command';
import { PluginCommands } from './commands';
import { PluginConfig, PluginConfigManager } from './config';
import { PluginState } from './state';
import { SubstructureParentHelper } from './util/substructure-parent-helper';
import { TaskManager } from './util/task-manager';
import { PluginToastManager } from './util/toast';
import { ViewportScreenshotHelper } from './util/viewport-screenshot';
import { PLUGIN_VERSION, PLUGIN_VERSION_DATE } from './version';
import { setSaccharideCompIdMapType } from '../mol-model/structure/structure/carbohydrates/constants';
var PluginContext = /** @class */ (function () {
    function PluginContext(spec) {
        var _this = this;
        var _a;
        this.spec = spec;
        this.runTask = function (task, params) { return _this.managers.task.run(task, params); };
        this.resolveTask = function (object) {
            if (!object)
                return void 0;
            if (Task.is(object))
                return _this.runTask(object);
            return object;
        };
        this.subs = [];
        this.initCanvas3dPromiseCallbacks = [function () { }, function () { }];
        this.disposed = false;
        this.canvasContainer = void 0;
        this.ev = RxEventHelper.create();
        this.config = new PluginConfigManager(this.spec.config); // needed to init state
        this.state = new PluginState(this);
        this.commands = new PluginCommandManager();
        this.canvas3dInit = this.ev.behavior(false);
        this.behaviors = {
            state: {
                isAnimating: this.ev.behavior(false),
                isUpdating: this.ev.behavior(false),
                // TODO: should there be separate "updated" event?
                //   Often, this is used to indicate that the state has updated
                //   and it might not be the best way to react to state updates.
                isBusy: this.ev.behavior(false)
            },
            interaction: {
                hover: this.ev.behavior({ current: Representation.Loci.Empty, modifiers: ModifiersKeys.None, buttons: 0, button: 0 }),
                click: this.ev.behavior({ current: Representation.Loci.Empty, modifiers: ModifiersKeys.None, buttons: 0, button: 0 }),
                drag: this.ev.behavior({ current: Representation.Loci.Empty, modifiers: ModifiersKeys.None, buttons: 0, button: 0, pageStart: Vec2(), pageEnd: Vec2() }),
                key: this.ev.behavior(EmptyKeyInput),
                keyReleased: this.ev.behavior(EmptyKeyInput),
                selectionMode: this.ev.behavior(false),
            },
            labels: {
                highlight: this.ev.behavior({ labels: [] })
            },
            layout: {
                leftPanelTabName: this.ev.behavior('root')
            },
            canvas3d: {
                // TODO: remove in 4.0?
                initialized: this.canvas3dInit.pipe(filter(function (v) { return !!v; }), take(1))
            }
        };
        this.canvas3dInitialized = new Promise(function (res, rej) {
            _this.initCanvas3dPromiseCallbacks = [res, rej];
        });
        this.layout = new PluginLayout(this);
        this.animationLoop = new PluginAnimationLoop(this);
        this.representation = {
            structure: {
                registry: new StructureRepresentationRegistry(),
                themes: { colorThemeRegistry: ColorTheme.createRegistry(), sizeThemeRegistry: SizeTheme.createRegistry() },
            },
            volume: {
                registry: new VolumeRepresentationRegistry(),
                themes: { colorThemeRegistry: ColorTheme.createRegistry(), sizeThemeRegistry: SizeTheme.createRegistry() }
            }
        };
        this.query = {
            structure: {
                registry: new StructureSelectionQueryRegistry()
            }
        };
        this.dataFormats = new DataFormatRegistry();
        this.builders = {
            data: new DataBuilder(this),
            structure: void 0
        };
        this.helpers = {
            substructureParent: new SubstructureParentHelper(this),
            viewportScreenshot: void 0
        };
        this.managers = {
            structure: {
                hierarchy: new StructureHierarchyManager(this),
                component: new StructureComponentManager(this),
                measurement: new StructureMeasurementManager(this),
                selection: new StructureSelectionManager(this),
                focus: new StructureFocusManager(this),
            },
            volume: {
                hierarchy: new VolumeHierarchyManager(this)
            },
            interactivity: void 0,
            camera: new CameraManager(this),
            animation: new PluginAnimationManager(this),
            snapshot: new PluginStateSnapshotManager(this),
            lociLabels: void 0,
            toast: new PluginToastManager(this),
            asset: new AssetManager(),
            task: new TaskManager()
        };
        this.events = {
            log: this.ev(),
            task: this.managers.task.events,
            canvas3d: {
                settingsUpdated: this.ev(),
            }
        };
        this.customModelProperties = new CustomProperty.Registry();
        this.customStructureProperties = new CustomProperty.Registry();
        this.customStructureControls = new Map();
        this.customImportControls = new Map();
        this.genericRepresentationControls = new Map();
        /**
         * Used to store application specific custom state which is then available
         * to State Actions and similar constructs via the PluginContext.
         */
        this.customState = Object.create(null);
        this.log = {
            entries: List(),
            entry: function (e) { return _this.events.log.next(e); },
            error: function (msg) { return _this.events.log.next(LogEntry.error(msg)); },
            message: function (msg) { return _this.events.log.next(LogEntry.message(msg)); },
            info: function (msg) { return _this.events.log.next(LogEntry.info(msg)); },
            warn: function (msg) { return _this.events.log.next(LogEntry.warning(msg)); },
        };
        /**
         * This should be used in all transform related request so that it could be "spoofed" to allow
         * "static" access to resources.
         */
        this.fetch = ajaxGet;
        // the reason for this is that sometimes, transform params get modified inline (i.e. palette.valueLabel)
        // and freezing the params object causes "read-only exception"
        // TODO: is this the best place to do it?
        setAutoFreeze(false);
        setSaccharideCompIdMapType((_a = this.config.get(PluginConfig.Structure.SaccharideCompIdMapType)) !== null && _a !== void 0 ? _a : 'default');
    }
    PluginContext.prototype.build = function () {
        return this.state.data.build();
    };
    PluginContext.prototype.initContainer = function (options) {
        var _a;
        if (this.canvasContainer)
            return true;
        var container = document.createElement('div');
        Object.assign(container.style, {
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            '-webkit-user-select': 'none',
            'user-select': 'none',
            '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
            '-webkit-touch-callout': 'none',
            'touch-action': 'manipulation',
        });
        var canvas = (_a = options === null || options === void 0 ? void 0 : options.canvas3dContext) === null || _a === void 0 ? void 0 : _a.canvas;
        if (!canvas) {
            canvas = document.createElement('canvas');
            if (options === null || options === void 0 ? void 0 : options.checkeredCanvasBackground) {
                Object.assign(canvas.style, {
                    'background-image': 'linear-gradient(45deg, lightgrey 25%, transparent 25%, transparent 75%, lightgrey 75%, lightgrey), linear-gradient(45deg, lightgrey 25%, transparent 25%, transparent 75%, lightgrey 75%, lightgrey)',
                    'background-size': '60px 60px',
                    'background-position': '0 0, 30px 30px'
                });
            }
            container.appendChild(canvas);
        }
        if (!this.initViewer(canvas, container, options === null || options === void 0 ? void 0 : options.canvas3dContext)) {
            return false;
        }
        this.canvasContainer = container;
        return true;
    };
    /**
     * Mount the plugin into the target element (assumes the target has "relative"-like positioninig).
     * If initContainer wasn't called separately before, initOptions will be passed to it.
     */
    PluginContext.prototype.mount = function (target, initOptions) {
        var _a;
        if (this.disposed)
            throw new Error('Cannot mount a disposed context');
        if (!this.initContainer(initOptions))
            return false;
        if (this.canvasContainer.parentElement !== target) {
            (_a = this.canvasContainer.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(this.canvasContainer);
        }
        target.appendChild(this.canvasContainer);
        this.handleResize();
        return true;
    };
    PluginContext.prototype.unmount = function () {
        var _a, _b;
        (_b = (_a = this.canvasContainer) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.removeChild(this.canvasContainer);
    };
    PluginContext.prototype.initViewer = function (canvas, container, canvas3dContext) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            this.layout.setRoot(container);
            if (this.spec.layout && this.spec.layout.initial)
                this.layout.setProps(this.spec.layout.initial);
            if (canvas3dContext) {
                this.canvas3dContext = canvas3dContext;
            }
            else {
                var antialias = !((_a = this.config.get(PluginConfig.General.DisableAntialiasing)) !== null && _a !== void 0 ? _a : false);
                var preserveDrawingBuffer = !((_b = this.config.get(PluginConfig.General.DisablePreserveDrawingBuffer)) !== null && _b !== void 0 ? _b : false);
                var pixelScale = this.config.get(PluginConfig.General.PixelScale) || 1;
                var pickScale = this.config.get(PluginConfig.General.PickScale) || 0.25;
                var pickPadding = (_c = this.config.get(PluginConfig.General.PickPadding)) !== null && _c !== void 0 ? _c : 1;
                var enableWboit = this.config.get(PluginConfig.General.EnableWboit) || false;
                var enableDpoit = this.config.get(PluginConfig.General.EnableDpoit) || false;
                var preferWebGl1 = this.config.get(PluginConfig.General.PreferWebGl1) || false;
                var failIfMajorPerformanceCaveat = !((_d = this.config.get(PluginConfig.General.AllowMajorPerformanceCaveat)) !== null && _d !== void 0 ? _d : false);
                var powerPreference = this.config.get(PluginConfig.General.PowerPreference) || 'high-performance';
                this.canvas3dContext = Canvas3DContext.fromCanvas(canvas, this.managers.asset, { antialias: antialias, preserveDrawingBuffer: preserveDrawingBuffer, pixelScale: pixelScale, pickScale: pickScale, pickPadding: pickPadding, enableWboit: enableWboit, enableDpoit: enableDpoit, preferWebGl1: preferWebGl1, failIfMajorPerformanceCaveat: failIfMajorPerformanceCaveat, powerPreference: powerPreference });
            }
            this.canvas3d = Canvas3D.create(this.canvas3dContext);
            this.canvas3dInit.next(true);
            var props = this.spec.canvas3d;
            var backgroundColor_1 = Color(0xFCFBF9);
            if (!props) {
                (_e = this.canvas3d) === null || _e === void 0 ? void 0 : _e.setProps({ renderer: { backgroundColor: backgroundColor_1 } });
            }
            else {
                if (((_f = props.renderer) === null || _f === void 0 ? void 0 : _f.backgroundColor) === void 0) {
                    props = produce(props, function (p) {
                        if (p.renderer)
                            p.renderer.backgroundColor = backgroundColor_1;
                        else
                            p.renderer = { backgroundColor: backgroundColor_1 };
                    });
                }
                (_g = this.canvas3d) === null || _g === void 0 ? void 0 : _g.setProps(props);
            }
            this.animationLoop.start();
            this.helpers.viewportScreenshot = new ViewportScreenshotHelper(this);
            this.subs.push(this.canvas3d.interaction.click.subscribe(function (e) { return _this.behaviors.interaction.click.next(e); }));
            this.subs.push(this.canvas3d.interaction.drag.subscribe(function (e) { return _this.behaviors.interaction.drag.next(e); }));
            this.subs.push(this.canvas3d.interaction.hover.subscribe(function (e) { return _this.behaviors.interaction.hover.next(e); }));
            this.subs.push(this.canvas3d.input.resize.pipe(debounceTime(50), throttleTime(100, undefined, { leading: false, trailing: true })).subscribe(function () { return _this.handleResize(); }));
            this.subs.push(this.canvas3d.input.keyDown.subscribe(function (e) { return _this.behaviors.interaction.key.next(e); }));
            this.subs.push(this.canvas3d.input.keyUp.subscribe(function (e) { return _this.behaviors.interaction.keyReleased.next(e); }));
            this.subs.push(this.layout.events.updated.subscribe(function () { return requestAnimationFrame(function () { return _this.handleResize(); }); }));
            this.handleResize();
            Scheduler.setImmediate(function () { return _this.initCanvas3dPromiseCallbacks[0](); });
            return true;
        }
        catch (e) {
            this.log.error('' + e);
            console.error(e);
            Scheduler.setImmediate(function () { return _this.initCanvas3dPromiseCallbacks[1](e); });
            return false;
        }
    };
    PluginContext.prototype.handleResize = function () {
        var _a, _b;
        var canvas = (_a = this.canvas3dContext) === null || _a === void 0 ? void 0 : _a.canvas;
        var container = this.layout.root;
        if (container && canvas) {
            var pixelScale = this.config.get(PluginConfig.General.PixelScale) || 1;
            resizeCanvas(canvas, container, pixelScale);
            (_b = this.canvas3d) === null || _b === void 0 ? void 0 : _b.requestResize();
        }
    };
    Object.defineProperty(PluginContext.prototype, "isBusy", {
        /** return true is animating or updating */
        get: function () {
            return this.behaviors.state.isAnimating.value || this.behaviors.state.isUpdating.value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PluginContext.prototype, "selectionMode", {
        get: function () {
            return this.behaviors.interaction.selectionMode.value;
        },
        set: function (mode) {
            this.behaviors.interaction.selectionMode.next(mode);
        },
        enumerable: false,
        configurable: true
    });
    PluginContext.prototype.dataTransaction = function (f, options) {
        return this.runTask(this.state.data.transaction(f, options));
    };
    PluginContext.prototype.clear = function (resetViewportSettings) {
        var _a;
        if (resetViewportSettings === void 0) { resetViewportSettings = false; }
        if (resetViewportSettings)
            (_a = this.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps(DefaultCanvas3DParams);
        return PluginCommands.State.RemoveObject(this, { state: this.state.data, ref: StateTransform.RootRef });
    };
    PluginContext.prototype.dispose = function (options) {
        var _a, _b;
        if (this.disposed)
            return;
        for (var _i = 0, _c = this.subs; _i < _c.length; _i++) {
            var s = _c[_i];
            s.unsubscribe();
        }
        this.subs = [];
        this.animationLoop.stop();
        this.commands.dispose();
        (_a = this.canvas3d) === null || _a === void 0 ? void 0 : _a.dispose();
        (_b = this.canvas3dContext) === null || _b === void 0 ? void 0 : _b.dispose(options);
        this.ev.dispose();
        this.state.dispose();
        this.managers.task.dispose();
        this.helpers.substructureParent.dispose();
        objectForEach(this.managers, function (m) { var _a; return (_a = m === null || m === void 0 ? void 0 : m.dispose) === null || _a === void 0 ? void 0 : _a.call(m); });
        objectForEach(this.managers.structure, function (m) { var _a; return (_a = m === null || m === void 0 ? void 0 : m.dispose) === null || _a === void 0 ? void 0 : _a.call(m); });
        this.unmount();
        this.canvasContainer = undefined;
        this.disposed = true;
    };
    PluginContext.prototype.initBehaviorEvents = function () {
        var _this = this;
        this.subs.push(merge(this.state.data.behaviors.isUpdating, this.state.behaviors.behaviors.isUpdating).subscribe(function (u) {
            if (_this.behaviors.state.isUpdating.value !== u)
                _this.behaviors.state.isUpdating.next(u);
        }));
        var timeoutMs = this.config.get(PluginConfig.General.IsBusyTimeoutMs) || 750;
        var isBusy = this.behaviors.state.isBusy;
        var timeout = void 0;
        var setBusy = function () {
            if (!isBusy.value)
                isBusy.next(true);
        };
        var reset = function () {
            if (timeout !== void 0)
                clearTimeout(timeout);
            timeout = void 0;
        };
        this.subs.push(merge(this.behaviors.state.isUpdating, this.behaviors.state.isAnimating).subscribe(function (v) {
            var isUpdating = _this.behaviors.state.isUpdating.value;
            var isAnimating = _this.behaviors.state.isAnimating.value;
            if (isUpdating || isAnimating) {
                if (!isBusy.value) {
                    reset();
                    timeout = setTimeout(setBusy, timeoutMs);
                }
            }
            else {
                reset();
                isBusy.next(false);
            }
        }));
        this.subs.push(this.behaviors.interaction.selectionMode.subscribe(function (v) {
            var _a;
            if (!v) {
                (_a = _this.managers.interactivity) === null || _a === void 0 ? void 0 : _a.lociSelects.deselectAll();
            }
        }));
    };
    PluginContext.prototype.initBuiltInBehavior = function () {
        var _this = this;
        BuiltInPluginBehaviors.State.registerDefault(this);
        BuiltInPluginBehaviors.Representation.registerDefault(this);
        BuiltInPluginBehaviors.Camera.registerDefault(this);
        BuiltInPluginBehaviors.Misc.registerDefault(this);
        this.subs.push(merge(this.state.data.events.log, this.state.behaviors.events.log).subscribe(function (e) { return _this.events.log.next(e); }));
    };
    PluginContext.prototype.initBehaviors = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tree, _i, _a, cat, _b, _c, b, cat, _d, _e, b, cat;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        tree = this.state.behaviors.build();
                        for (_i = 0, _a = Object.keys(PluginBehavior.Categories); _i < _a.length; _i++) {
                            cat = _a[_i];
                            tree.toRoot().apply(PluginBehavior.CreateCategory, { label: PluginBehavior.Categories[cat] }, { ref: cat, state: { isLocked: true } });
                        }
                        // Init custom properties 1st
                        for (_b = 0, _c = this.spec.behaviors; _b < _c.length; _b++) {
                            b = _c[_b];
                            cat = PluginBehavior.getCategoryId(b.transformer);
                            if (cat !== 'custom-props')
                                continue;
                            tree.to(PluginBehavior.getCategoryId(b.transformer)).apply(b.transformer, b.defaultParams, { ref: b.transformer.id });
                        }
                        return [4 /*yield*/, this.runTask(this.state.behaviors.updateTree(tree, { doNotUpdateCurrent: true, doNotLogTiming: true }))];
                    case 1:
                        _f.sent();
                        tree = this.state.behaviors.build();
                        for (_d = 0, _e = this.spec.behaviors; _d < _e.length; _d++) {
                            b = _e[_d];
                            cat = PluginBehavior.getCategoryId(b.transformer);
                            if (cat === 'custom-props')
                                continue;
                            tree.to(PluginBehavior.getCategoryId(b.transformer)).apply(b.transformer, b.defaultParams, { ref: b.transformer.id });
                        }
                        return [4 /*yield*/, this.runTask(this.state.behaviors.updateTree(tree, { doNotUpdateCurrent: true, doNotLogTiming: true }))];
                    case 2:
                        _f.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PluginContext.prototype.initCustomFormats = function () {
        if (!this.spec.customFormats)
            return;
        for (var _i = 0, _a = this.spec.customFormats; _i < _a.length; _i++) {
            var f = _a[_i];
            this.dataFormats.add(f[0], f[1]);
        }
    };
    PluginContext.prototype.initAnimations = function () {
        if (!this.spec.animations)
            return;
        for (var _i = 0, _a = this.spec.animations; _i < _a.length; _i++) {
            var anim = _a[_i];
            this.managers.animation.register(anim);
        }
    };
    PluginContext.prototype.initDataActions = function () {
        if (!this.spec.actions)
            return;
        for (var _i = 0, _a = this.spec.actions; _i < _a.length; _i++) {
            var a = _a[_i];
            this.state.data.actions.add(a.action);
        }
    };
    PluginContext.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.subs.push(this.events.log.subscribe(function (e) { return _this.log.entries = _this.log.entries.push(e); }));
                        this.initCustomFormats();
                        this.initBehaviorEvents();
                        this.initBuiltInBehavior();
                        this.managers.interactivity = new InteractivityManager(this);
                        this.managers.lociLabels = new LociLabelManager(this);
                        this.builders.structure = new StructureBuilder(this);
                        this.initAnimations();
                        this.initDataActions();
                        return [4 /*yield*/, this.initBehaviors()];
                    case 1:
                        _a.sent();
                        this.log.message("Mol* Plugin ".concat(PLUGIN_VERSION, " [").concat(PLUGIN_VERSION_DATE.toLocaleString(), "]"));
                        if (!isProductionMode)
                            this.log.message("Development mode enabled");
                        if (isDebugMode)
                            this.log.message("Debug mode enabled");
                        return [2 /*return*/];
                }
            });
        });
    };
    return PluginContext;
}());
export { PluginContext };
