/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __assign, __awaiter, __extends, __generator } from "tslib";
import { StatefulPluginComponent } from '../component';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export { PluginAnimationManager };
// TODO: pause functionality (this needs to reset if the state tree changes)
// TODO: handle unregistered animations on state restore
// TODO: better API
var PluginAnimationManager = /** @class */ (function (_super) {
    __extends(PluginAnimationManager, _super);
    function PluginAnimationManager(context) {
        var _this = _super.call(this, { params: { current: '' }, animationState: 'stopped' }) || this;
        _this.context = context;
        _this.map = new Map();
        _this._animations = [];
        _this.currentTime = 0;
        _this._params = void 0;
        _this.events = {
            updated: _this.ev(),
            applied: _this.ev(),
        };
        _this.isStopped = true;
        _this.isApplying = false;
        return _this;
    }
    Object.defineProperty(PluginAnimationManager.prototype, "isEmpty", {
        get: function () { return this._animations.length === 0; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PluginAnimationManager.prototype, "current", {
        get: function () { return this._current; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PluginAnimationManager.prototype, "animations", {
        get: function () { return this._animations; },
        enumerable: false,
        configurable: true
    });
    PluginAnimationManager.prototype.triggerUpdate = function () {
        this.events.updated.next(void 0);
    };
    PluginAnimationManager.prototype.triggerApply = function () {
        this.events.applied.next(void 0);
    };
    PluginAnimationManager.prototype.getParams = function () {
        if (!this._params) {
            this._params = {
                current: PD.Select(this._animations[0] && this._animations[0].name, this._animations.map(function (a) { return [a.name, a.display.name]; }), { label: 'Animation' })
            };
        }
        return this._params;
    };
    PluginAnimationManager.prototype.updateParams = function (newParams) {
        if (this.isEmpty)
            return;
        this.updateState({ params: __assign(__assign({}, this.state.params), newParams) });
        var anim = this.map.get(this.state.params.current);
        var params = anim.params(this.context);
        this._current = {
            anim: anim,
            params: params,
            paramValues: PD.getDefaultValues(params),
            state: {},
            startedTime: -1,
            lastTime: 0
        };
        this.triggerUpdate();
    };
    PluginAnimationManager.prototype.updateCurrentParams = function (values) {
        if (this.isEmpty)
            return;
        this._current.paramValues = __assign(__assign({}, this._current.paramValues), values);
        this.triggerUpdate();
    };
    PluginAnimationManager.prototype.register = function (animation) {
        if (this.map.has(animation.name)) {
            this.context.log.error("Animation '".concat(animation.name, "' is already registered."));
            return;
        }
        this._params = void 0;
        this.map.set(animation.name, animation);
        this._animations.push(animation);
        if (this._animations.length === 1) {
            this.updateParams({ current: animation.name });
        }
        else {
            this.triggerUpdate();
        }
    };
    PluginAnimationManager.prototype.play = function (animation, params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.stop()];
                    case 1:
                        _a.sent();
                        if (!this.map.has(animation.name)) {
                            this.register(animation);
                        }
                        this.updateParams({ current: animation.name });
                        this.updateCurrentParams(params);
                        return [4 /*yield*/, this.start()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PluginAnimationManager.prototype.tick = function (t, isSynchronous, animation) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.currentTime = t;
                        if (this.isStopped)
                            return [2 /*return*/];
                        if (!(isSynchronous || animation)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.applyFrame(animation)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.applyAsync();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PluginAnimationManager.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var anim, initialState, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.updateState({ animationState: 'playing' });
                        if (!this.context.behaviors.state.isAnimating.value) {
                            this.context.behaviors.state.isAnimating.next(true);
                        }
                        this.triggerUpdate();
                        anim = this._current.anim;
                        initialState = this._current.anim.initialState(this._current.paramValues, this.context);
                        if (!anim.setup) return [3 /*break*/, 2];
                        return [4 /*yield*/, anim.setup(this._current.paramValues, initialState, this.context)];
                    case 1:
                        state = _a.sent();
                        if (state)
                            initialState = state;
                        _a.label = 2;
                    case 2:
                        this._current.lastTime = 0;
                        this._current.startedTime = -1;
                        this._current.state = initialState;
                        this.isStopped = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    PluginAnimationManager.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var anim;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isStopped = true;
                        if (!(this.state.animationState !== 'stopped')) return [3 /*break*/, 3];
                        anim = this._current.anim;
                        if (!anim.teardown) return [3 /*break*/, 2];
                        return [4 /*yield*/, anim.teardown(this._current.paramValues, this._current.state, this.context)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.updateState({ animationState: 'stopped' });
                        this.triggerUpdate();
                        _a.label = 3;
                    case 3:
                        if (this.context.behaviors.state.isAnimating.value) {
                            this.context.behaviors.state.isAnimating.next(false);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(PluginAnimationManager.prototype, "isAnimating", {
        get: function () {
            return this.state.animationState === 'playing';
        },
        enumerable: false,
        configurable: true
    });
    PluginAnimationManager.prototype.applyAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isApplying)
                            return [2 /*return*/];
                        this.isApplying = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, this.applyFrame()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.isApplying = false;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PluginAnimationManager.prototype.applyFrame = function (animation) {
        return __awaiter(this, void 0, void 0, function () {
            var t, newState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t = this.currentTime;
                        if (this._current.startedTime < 0)
                            this._current.startedTime = t;
                        return [4 /*yield*/, this._current.anim.apply(this._current.state, { lastApplied: this._current.lastTime, current: t - this._current.startedTime, animation: animation }, { params: this._current.paramValues, plugin: this.context })];
                    case 1:
                        newState = _a.sent();
                        if (newState.kind === 'finished') {
                            this.stop();
                        }
                        else if (newState.kind === 'next') {
                            this._current.state = newState.state;
                            this._current.lastTime = t - this._current.startedTime;
                        }
                        this.triggerApply();
                        return [2 /*return*/];
                }
            });
        });
    };
    PluginAnimationManager.prototype.getSnapshot = function () {
        if (!this.current)
            return { state: this.state };
        return {
            state: this.state,
            current: {
                paramValues: this._current.paramValues,
                state: this._current.anim.stateSerialization ? this._current.anim.stateSerialization.toJSON(this._current.state) : this._current.state
            }
        };
    };
    PluginAnimationManager.prototype.setSnapshot = function (snapshot) {
        if (this.isEmpty)
            return;
        this.updateState({ animationState: snapshot.state.animationState });
        this.updateParams(snapshot.state.params);
        if (snapshot.current) {
            this.current.paramValues = snapshot.current.paramValues;
            this.current.state = this._current.anim.stateSerialization
                ? this._current.anim.stateSerialization.fromJSON(snapshot.current.state)
                : snapshot.current.state;
            this.triggerUpdate();
            if (this.state.animationState === 'playing')
                this.resume();
        }
    };
    PluginAnimationManager.prototype.resume = function () {
        return __awaiter(this, void 0, void 0, function () {
            var anim;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._current.lastTime = 0;
                        this._current.startedTime = -1;
                        anim = this._current.anim;
                        if (!this.context.behaviors.state.isAnimating.value) {
                            this.context.behaviors.state.isAnimating.next(true);
                        }
                        if (!anim.setup) return [3 /*break*/, 2];
                        return [4 /*yield*/, anim.setup(this._current.paramValues, this._current.state, this.context)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.isStopped = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    return PluginAnimationManager;
}(StatefulPluginComponent));
