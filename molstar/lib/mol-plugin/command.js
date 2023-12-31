/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __awaiter, __generator } from "tslib";
import { UUID } from '../mol-util';
export { PluginCommand, PluginCommandManager };
function PluginCommand() {
    var ret = (function (ctx, params) { return ctx.commands.dispatch(ret, params || {}); });
    ret.subscribe = function (ctx, action) { return ctx.commands.subscribe(ret, action); };
    ret.id = UUID.create22();
    return ret;
}
var PluginCommandManager = /** @class */ (function () {
    function PluginCommandManager() {
        this.subs = new Map();
        this.disposing = false;
    }
    PluginCommandManager.prototype.subscribe = function (cmd, action) {
        var _this = this;
        var actions = this.subs.get(cmd.id);
        if (!actions) {
            actions = [];
            this.subs.set(cmd.id, actions);
        }
        actions.push(action);
        return {
            unsubscribe: function () {
                var actions = _this.subs.get(cmd.id);
                if (!actions)
                    return;
                var idx = actions.indexOf(action);
                if (idx < 0)
                    return;
                for (var i = idx + 1; i < actions.length; i++) {
                    actions[i - 1] = actions[i];
                }
                actions.pop();
            }
        };
    };
    /** Resolves after all actions have completed */
    PluginCommandManager.prototype.dispatch = function (cmd, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.disposing) {
                reject('disposed');
                return;
            }
            var actions = _this.subs.get(cmd.id);
            if (!actions) {
                resolve();
                return;
            }
            _this.resolve({ cmd: cmd, params: params, resolve: resolve, reject: reject });
        });
    };
    PluginCommandManager.prototype.dispose = function () {
        this.subs.clear();
    };
    PluginCommandManager.prototype.resolve = function (instance) {
        return __awaiter(this, void 0, void 0, function () {
            var actions, _i, actions_1, a, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        actions = this.subs.get(instance.cmd.id);
                        if (!actions) {
                            instance.resolve();
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        _i = 0, actions_1 = actions;
                        _a.label = 2;
                    case 2:
                        if (!(_i < actions_1.length)) return [3 /*break*/, 5];
                        a = actions_1[_i];
                        return [4 /*yield*/, a(instance.params)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        instance.resolve();
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        instance.reject(e_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return PluginCommandManager;
}());
