/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { PluginCommands } from '../../../mol-plugin/commands';
import { StateSelection } from '../../../mol-state';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { PluginStateObject } from '../../objects';
import { StateTransforms } from '../../transforms';
import { PluginStateAnimation } from '../model';
export var AnimateModelIndex = PluginStateAnimation.create({
    name: 'built-in.animate-model-index',
    display: { name: 'Animate Trajectory' },
    isExportable: true,
    params: function () { return ({
        mode: PD.MappedStatic('loop', {
            palindrome: PD.Group({}),
            loop: PD.Group({ direction: PD.Select('forward', [['forward', 'Forward'], ['backward', 'Backward']]) }),
            once: PD.Group({ direction: PD.Select('forward', [['forward', 'Forward'], ['backward', 'Backward']]) }, { isFlat: true })
        }, { options: [['palindrome', 'Palindrome'], ['loop', 'Loop'], ['once', 'Once']] }),
        duration: PD.MappedStatic('fixed', {
            fixed: PD.Group({
                durationInS: PD.Numeric(5, { min: 1, max: 120, step: 0.1 }, { description: 'Duration in seconds' })
            }, { isFlat: true }),
            computed: PD.Group({
                targetFps: PD.Numeric(30, { min: 5, max: 250, step: 1 }, { label: 'Target FPS' })
            }, { isFlat: true }),
            sequential: PD.Group({
                maxFps: PD.Numeric(30, { min: 5, max: 60, step: 1 })
            }, { isFlat: true })
        })
    }); },
    canApply: function (ctx) {
        var state = ctx.state.data;
        var models = state.select(StateSelection.Generators.ofTransformer(StateTransforms.Model.ModelFromTrajectory));
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var m = models_1[_i];
            var parent_1 = StateSelection.findAncestorOfType(state.tree, state.cells, m.transform.ref, PluginStateObject.Molecule.Trajectory);
            if (parent_1 && parent_1.obj && parent_1.obj.data.frameCount > 1)
                return { canApply: true };
        }
        return { canApply: false, reason: 'No trajectory to animate' };
    },
    getDuration: function (p, ctx) {
        var _a;
        if (((_a = p.duration) === null || _a === void 0 ? void 0 : _a.name) === 'fixed') {
            return { kind: 'fixed', durationMs: p.duration.params.durationInS * 1000 };
        }
        else if (p.duration.name === 'computed') {
            var state = ctx.state.data;
            var models = state.select(StateSelection.Generators.ofTransformer(StateTransforms.Model.ModelFromTrajectory));
            var maxDuration = 0;
            for (var _i = 0, models_2 = models; _i < models_2.length; _i++) {
                var m = models_2[_i];
                var parent_2 = StateSelection.findAncestorOfType(state.tree, state.cells, m.transform.ref, PluginStateObject.Molecule.Trajectory);
                if (!parent_2 || !parent_2.obj)
                    continue;
                var traj = parent_2.obj;
                maxDuration = Math.max(Math.ceil(1000 * traj.data.frameCount / p.duration.params.targetFps), maxDuration);
            }
            return { kind: 'fixed', durationMs: maxDuration };
        }
        return { kind: 'unknown' };
    },
    initialState: function () { return ({}); },
    apply: function (animState, t, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var state, models, update, params, palindromeDirections, isEnd, allSingles, _loop_1, _i, models_3, m;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // limit fps
                        if (ctx.params.duration.name === 'sequential' && t.current > 0 && t.current - t.lastApplied < 1000 / ctx.params.duration.params.maxFps) {
                            return [2 /*return*/, { kind: 'skip' }];
                        }
                        state = ctx.plugin.state.data;
                        models = state.select(StateSelection.Generators.ofTransformer(StateTransforms.Model.ModelFromTrajectory));
                        if (models.length === 0) {
                            // nothing more to do here
                            return [2 /*return*/, { kind: 'finished' }];
                        }
                        update = state.build();
                        params = ctx.params;
                        palindromeDirections = animState.palindromeDirections || {};
                        isEnd = false, allSingles = true;
                        _loop_1 = function (m) {
                            var parent_3 = StateSelection.findAncestorOfType(state.tree, state.cells, m.transform.ref, PluginStateObject.Molecule.Trajectory);
                            if (!parent_3 || !parent_3.obj)
                                return "continue";
                            var traj = parent_3.obj;
                            if (traj.data.frameCount <= 1)
                                return "continue";
                            update.to(m).update(function (old) {
                                var len = traj.data.frameCount;
                                if (len !== 1) {
                                    allSingles = false;
                                }
                                else {
                                    return old;
                                }
                                if (params.duration.name === 'sequential') {
                                    var dir = 1;
                                    if (params.mode.name === 'once') {
                                        dir = params.mode.params.direction === 'backward' ? -1 : 1;
                                        // if we are at start or end already, do nothing.
                                        if ((dir === -1 && old.modelIndex === 0) || (dir === 1 && old.modelIndex === len - 1)) {
                                            isEnd = true;
                                            return old;
                                        }
                                    }
                                    else if (params.mode.name === 'palindrome') {
                                        if (old.modelIndex === 0)
                                            dir = 1;
                                        else if (old.modelIndex === len - 1)
                                            dir = -1;
                                        else
                                            dir = palindromeDirections[m.transform.ref] || 1;
                                    }
                                    palindromeDirections[m.transform.ref] = dir;
                                    var modelIndex = (old.modelIndex + dir) % len;
                                    if (modelIndex < 0)
                                        modelIndex += len;
                                    isEnd = isEnd || (dir === -1 && modelIndex === 0) || (dir === 1 && modelIndex === len - 1);
                                    return { modelIndex: modelIndex };
                                }
                                else {
                                    var durationInMs = params.duration.name === 'fixed'
                                        ? params.duration.params.durationInS * 1000
                                        : Math.ceil(1000 * traj.data.frameCount / params.duration.params.targetFps);
                                    if (params.mode.name === 'once' && t.current >= durationInMs) {
                                        isEnd = true;
                                        return { modelIndex: traj.data.frameCount - 1 };
                                    }
                                    var phase = (t.current % durationInMs) / durationInMs;
                                    if (params.mode.name === 'loop') {
                                        if (params.mode.params.direction === 'backward') {
                                            phase = 1 - phase;
                                        }
                                    }
                                    if (params.mode.name === 'palindrome') {
                                        phase = 2 * phase;
                                        if (phase > 1)
                                            phase = 2 - phase;
                                    }
                                    var modelIndex = Math.min(Math.floor(traj.data.frameCount * phase), traj.data.frameCount - 1);
                                    return { modelIndex: modelIndex };
                                }
                            });
                        };
                        for (_i = 0, models_3 = models; _i < models_3.length; _i++) {
                            m = models_3[_i];
                            _loop_1(m);
                        }
                        if (!!allSingles) return [3 /*break*/, 2];
                        return [4 /*yield*/, PluginCommands.State.Update(ctx.plugin, { state: state, tree: update, options: { doNotLogTiming: true } })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (allSingles || (params.mode.name === 'once' && isEnd))
                            return [2 /*return*/, { kind: 'finished' }];
                        if (params.mode.name === 'palindrome')
                            return [2 /*return*/, { kind: 'next', state: { palindromeDirections: palindromeDirections } }];
                        return [2 /*return*/, { kind: 'next', state: {} }];
                }
            });
        });
    }
});
