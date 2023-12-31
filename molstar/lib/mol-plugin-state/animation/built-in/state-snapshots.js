/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { PluginStateAnimation } from '../model';
function setPartialSnapshot(plugin, entry, first) {
    var _a;
    if (first === void 0) { first = false; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!entry.snapshot.data) return [3 /*break*/, 2];
                    return [4 /*yield*/, plugin.runTask(plugin.state.data.setSnapshot(entry.snapshot.data))];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    if (entry.snapshot.camera) {
                        (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.requestCameraReset({
                            snapshot: entry.snapshot.camera.current,
                            durationMs: first || entry.snapshot.camera.transitionStyle === 'instant'
                                ? 0 : entry.snapshot.camera.transitionDurationInMs
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
export var AnimateStateSnapshots = PluginStateAnimation.create({
    name: 'built-in.animate-state-snapshots',
    display: { name: 'State Snapshots' },
    isExportable: true,
    params: function () { return ({}); },
    canApply: function (plugin) {
        var entries = plugin.managers.snapshot.state.entries;
        if (entries.size < 2) {
            return { canApply: false, reason: 'At least 2 states required.' };
        }
        if (entries.some(function (e) { return !!(e === null || e === void 0 ? void 0 : e.snapshot.startAnimation); })) {
            return { canApply: false, reason: 'Nested animations not supported.' };
        }
        return { canApply: plugin.managers.snapshot.state.entries.size > 1 };
    },
    setup: function (_, __, plugin) {
        var pivot = plugin.managers.snapshot.state.entries.get(0);
        setPartialSnapshot(plugin, pivot, true);
    },
    getDuration: function (_, plugin) {
        return {
            kind: 'fixed',
            durationMs: plugin.managers.snapshot.state.entries.toArray().reduce(function (a, b) { var _a; return a + ((_a = b.snapshot.durationInMs) !== null && _a !== void 0 ? _a : 0); }, 0)
        };
    },
    initialState: function (_, plugin) {
        var snapshots = plugin.managers.snapshot.state.entries.toArray();
        return {
            totalDuration: snapshots.reduce(function (a, b) { var _a; return a + ((_a = b.snapshot.durationInMs) !== null && _a !== void 0 ? _a : 0); }, 0),
            snapshots: snapshots,
            currentIndex: 0
        };
    },
    apply: function (animState, t, ctx) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var ctime, i, _i, _b, s;
            return __generator(this, function (_c) {
                if (t.current >= animState.totalDuration) {
                    return [2 /*return*/, { kind: 'finished' }];
                }
                ctime = 0, i = 0;
                for (_i = 0, _b = animState.snapshots; _i < _b.length; _i++) {
                    s = _b[_i];
                    ctime += (_a = s.snapshot.durationInMs) !== null && _a !== void 0 ? _a : 0;
                    if (t.current < ctime) {
                        break;
                    }
                    i++;
                }
                if (i >= animState.snapshots.length)
                    return [2 /*return*/, { kind: 'finished' }];
                if (i === animState.currentIndex) {
                    return [2 /*return*/, { kind: 'skip' }];
                }
                setPartialSnapshot(ctx.plugin, animState.snapshots[i]);
                return [2 /*return*/, { kind: 'next', state: __assign(__assign({}, animState), { currentIndex: i }) }];
            });
        });
    }
});
