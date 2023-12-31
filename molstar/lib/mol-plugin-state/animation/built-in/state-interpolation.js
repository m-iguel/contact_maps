/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { PluginCommands } from '../../../mol-plugin/commands';
import { StateTransform } from '../../../mol-state';
import { shallowEqual } from '../../../mol-util';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { PluginStateAnimation } from '../model';
export var AnimateStateInterpolation = PluginStateAnimation.create({
    name: 'built-in.animate-state-interpolation',
    display: { name: 'Animate State (experimental)' },
    params: function () { return ({
        transtionDurationInMs: PD.Numeric(2000, { min: 100, max: 30000, step: 10 })
    }); },
    canApply: function (plugin) {
        return { canApply: plugin.managers.snapshot.state.entries.size > 1 };
    },
    initialState: function () { return ({}); },
    apply: function (animState, t, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var snapshots, currentT, srcIndex, tarIndex, _src, _tar, src, tar, state, update, _i, src_1, s, _a, tar_1, t_1, e, f, oldState, newState;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        snapshots = ctx.plugin.managers.snapshot.state.entries;
                        if (snapshots.size < 2)
                            return [2 /*return*/, { kind: 'finished' }];
                        currentT = (t.current % ctx.params.transtionDurationInMs) / ctx.params.transtionDurationInMs;
                        srcIndex = Math.floor(t.current / ctx.params.transtionDurationInMs) % snapshots.size;
                        tarIndex = Math.ceil(t.current / ctx.params.transtionDurationInMs);
                        if (tarIndex === srcIndex)
                            tarIndex++;
                        tarIndex = tarIndex % snapshots.size;
                        _src = snapshots.get(srcIndex).snapshot, _tar = snapshots.get(tarIndex).snapshot;
                        if (!_src.data || !_tar.data)
                            return [2 /*return*/, { kind: 'skip' }];
                        src = _src.data.tree.transforms, tar = _tar.data.tree.transforms;
                        state = ctx.plugin.state.data;
                        update = state.build();
                        for (_i = 0, src_1 = src; _i < src_1.length; _i++) {
                            s = src_1[_i];
                            for (_a = 0, tar_1 = tar; _a < tar_1.length; _a++) {
                                t_1 = tar_1[_a];
                                // TODO: better than quadratic alg.
                                // TODO: support for adding/removing nodes
                                if (t_1.ref !== s.ref)
                                    continue;
                                if (t_1.version === s.version)
                                    continue;
                                e = StateTransform.fromJSON(s), f = StateTransform.fromJSON(t_1);
                                oldState = state.cells.get(s.ref);
                                if (!oldState)
                                    continue;
                                newState = void 0;
                                if (!e.transformer.definition.interpolate) {
                                    newState = currentT <= 0.5 ? e.params : f.params;
                                }
                                else {
                                    newState = e.transformer.definition.interpolate(e.params, f.params, currentT, ctx.plugin);
                                }
                                if (!shallowEqual(oldState, newState)) {
                                    update.to(s.ref).update(newState);
                                }
                            }
                        }
                        return [4 /*yield*/, PluginCommands.State.Update(ctx.plugin, { state: state, tree: update, options: { doNotLogTiming: true } })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { kind: 'next', state: {} }];
                }
            });
        });
    }
});
