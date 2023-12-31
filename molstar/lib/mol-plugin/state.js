/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __extends, __generator } from "tslib";
import { State } from '../mol-state';
import { PluginStateObject as SO } from '../mol-plugin-state/objects';
import { PluginBehavior } from './behavior';
import { Canvas3DParams } from '../mol-canvas3d/canvas3d';
import { PluginCommands } from './commands';
import { ParamDefinition as PD } from '../mol-util/param-definition';
import { UUID } from '../mol-util';
import { produce } from 'immer';
import { merge } from 'rxjs';
import { PluginComponent } from '../mol-plugin-state/component';
import { PluginConfig } from './config';
export { PluginState };
var PluginState = /** @class */ (function (_super) {
    __extends(PluginState, _super);
    function PluginState(plugin) {
        var _this = _super.call(this) || this;
        _this.plugin = plugin;
        _this.data = State.create(new SO.Root({}), { runTask: _this.plugin.runTask, globalContext: _this.plugin, historyCapacity: _this.plugin.config.get(PluginConfig.State.HistoryCapacity) });
        _this.behaviors = State.create(new PluginBehavior.Root({}), { runTask: _this.plugin.runTask, globalContext: _this.plugin, rootState: { isLocked: true } });
        _this.events = {
            cell: {
                stateUpdated: merge(_this.data.events.cell.stateUpdated, _this.behaviors.events.cell.stateUpdated),
                created: merge(_this.data.events.cell.created, _this.behaviors.events.cell.created),
                removed: merge(_this.data.events.cell.removed, _this.behaviors.events.cell.removed),
            },
            object: {
                created: merge(_this.data.events.object.created, _this.behaviors.events.object.created),
                removed: merge(_this.data.events.object.removed, _this.behaviors.events.object.removed),
                updated: merge(_this.data.events.object.updated, _this.behaviors.events.object.updated)
            }
        };
        _this.snapshotParams = _this.ev.behavior(PluginState.DefaultSnapshotParams);
        _this.setSnapshotParams = function (params) {
            _this.snapshotParams.next(__assign(__assign({}, PluginState.DefaultSnapshotParams), params));
        };
        return _this;
    }
    Object.defineProperty(PluginState.prototype, "animation", {
        get: function () { return this.plugin.managers.animation; },
        enumerable: false,
        configurable: true
    });
    PluginState.prototype.getSnapshot = function (params) {
        var _a, _b;
        var p = __assign(__assign({}, this.snapshotParams.value), params);
        return {
            id: UUID.create22(),
            data: p.data ? this.data.getSnapshot() : void 0,
            behaviour: p.behavior ? this.behaviors.getSnapshot() : void 0,
            animation: p.animation ? this.animation.getSnapshot() : void 0,
            startAnimation: p.startAnimation ? !!p.startAnimation : void 0,
            camera: p.camera ? {
                current: this.plugin.canvas3d.camera.getSnapshot(),
                transitionStyle: p.cameraTransition.name,
                transitionDurationInMs: ((_a = p === null || p === void 0 ? void 0 : p.cameraTransition) === null || _a === void 0 ? void 0 : _a.name) === 'animate' ? p.cameraTransition.params.durationInMs : void 0
            } : void 0,
            canvas3d: p.canvas3d ? { props: (_b = this.plugin.canvas3d) === null || _b === void 0 ? void 0 : _b.props } : void 0,
            interactivity: p.interactivity ? { props: this.plugin.managers.interactivity.props } : void 0,
            structureFocus: this.plugin.managers.structure.focus.getSnapshot(),
            structureSelection: p.structureSelection ? this.plugin.managers.structure.selection.getSnapshot() : void 0,
            structureComponentManager: p.componentManager ? {
                options: this.plugin.managers.structure.component.state.options
            } : void 0,
            durationInMs: p === null || p === void 0 ? void 0 : p.durationInMs
        };
    };
    PluginState.prototype.setSnapshot = function (snapshot) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var settings;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.animation.stop()];
                    case 1:
                        _d.sent();
                        // this needs to go 1st since these changes are already baked into the behavior and data state
                        if ((_a = snapshot.structureComponentManager) === null || _a === void 0 ? void 0 : _a.options)
                            this.plugin.managers.structure.component._setSnapshotState((_b = snapshot.structureComponentManager) === null || _b === void 0 ? void 0 : _b.options);
                        if (!snapshot.behaviour) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.plugin.runTask(this.behaviors.setSnapshot(snapshot.behaviour))];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        if (!snapshot.data) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.plugin.runTask(this.data.setSnapshot(snapshot.data))];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5:
                        if (!((_c = snapshot.canvas3d) === null || _c === void 0 ? void 0 : _c.props)) return [3 /*break*/, 7];
                        settings = PD.normalizeParams(Canvas3DParams, snapshot.canvas3d.props, 'children');
                        return [4 /*yield*/, PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: settings })];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        if (snapshot.interactivity) {
                            if (snapshot.interactivity.props)
                                this.plugin.managers.interactivity.setProps(snapshot.interactivity.props);
                        }
                        if (snapshot.structureFocus) {
                            this.plugin.managers.structure.focus.setSnapshot(snapshot.structureFocus);
                        }
                        if (snapshot.structureSelection) {
                            this.plugin.managers.structure.selection.setSnapshot(snapshot.structureSelection);
                        }
                        if (snapshot.animation) {
                            this.animation.setSnapshot(snapshot.animation);
                        }
                        if (snapshot.camera) {
                            PluginCommands.Camera.Reset(this.plugin, {
                                snapshot: snapshot.camera.current,
                                durationMs: snapshot.camera.transitionStyle === 'animate'
                                    ? snapshot.camera.transitionDurationInMs
                                    : void 0
                            });
                        }
                        if (snapshot.startAnimation) {
                            this.animation.start();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PluginState.prototype.updateTransform = function (state, a, params, canUndo) {
        var tree = state.build().to(a).update(params);
        return PluginCommands.State.Update(this.plugin, { state: state, tree: tree, options: { canUndo: canUndo } });
    };
    PluginState.prototype.updateBehavior = function (behavior, params) {
        var tree = this.behaviors.build();
        if (!this.behaviors.tree.transforms.has(behavior.id)) {
            var defaultParams = behavior.createDefaultParams(void 0, this.plugin);
            tree.to(PluginBehavior.getCategoryId(behavior)).apply(behavior, produce(defaultParams, params), { ref: behavior.id });
        }
        else {
            tree.to(behavior.id).update(params);
        }
        return this.plugin.runTask(this.behaviors.updateTree(tree));
    };
    PluginState.prototype.dispose = function () {
        this.behaviors.cells.forEach(function (cell) {
            var _a, _b, _c, _d;
            if (PluginBehavior.Behavior.is(cell.obj)) {
                (_b = (_a = cell.obj.data).unregister) === null || _b === void 0 ? void 0 : _b.call(_a);
                (_d = (_c = cell.obj.data).dispose) === null || _d === void 0 ? void 0 : _d.call(_c);
            }
        });
        _super.prototype.dispose.call(this);
        this.data.dispose();
        this.behaviors.dispose();
        this.animation.dispose();
    };
    return PluginState;
}(PluginComponent));
(function (PluginState) {
    PluginState.SnapshotParams = {
        durationInMs: PD.Numeric(1500, { min: 100, max: 15000, step: 100 }, { label: 'Duration in ms' }),
        data: PD.Boolean(true),
        behavior: PD.Boolean(false),
        structureSelection: PD.Boolean(false),
        componentManager: PD.Boolean(true),
        animation: PD.Boolean(true),
        startAnimation: PD.Boolean(false),
        canvas3d: PD.Boolean(true),
        interactivity: PD.Boolean(true),
        camera: PD.Boolean(true),
        cameraTransition: PD.MappedStatic('animate', {
            animate: PD.Group({
                durationInMs: PD.Numeric(250, { min: 100, max: 5000, step: 500 }, { label: 'Duration in ms' }),
            }),
            instant: PD.Group({})
        }, { options: [['animate', 'Animate'], ['instant', 'Instant']] }),
        image: PD.Boolean(false),
    };
    PluginState.DefaultSnapshotParams = PD.getDefaultValues(PluginState.SnapshotParams);
})(PluginState || (PluginState = {}));
