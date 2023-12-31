/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StateTransformer } from '../transformer';
import { UUID } from '../../mol-util';
import { arraySetRemove } from '../../mol-util/array';
import { RxEventHelper } from '../../mol-util/rx-event-helper';
export { StateActionManager };
var StateActionManager = /** @class */ (function () {
    function StateActionManager() {
        this.ev = RxEventHelper.create();
        this.actions = new Map();
        this.fromTypeIndex = new Map();
        this.events = {
            added: this.ev(),
            removed: this.ev(),
        };
    }
    StateActionManager.prototype.add = function (actionOrTransformer) {
        var action = StateTransformer.is(actionOrTransformer) ? actionOrTransformer.toAction() : actionOrTransformer;
        if (this.actions.has(action.id))
            return this;
        this.actions.set(action.id, action);
        for (var _i = 0, _a = action.definition.from; _i < _a.length; _i++) {
            var t = _a[_i];
            if (this.fromTypeIndex.has(t.type)) {
                this.fromTypeIndex.get(t.type).push(action);
            }
            else {
                this.fromTypeIndex.set(t.type, [action]);
            }
        }
        this.events.added.next(void 0);
        return this;
    };
    StateActionManager.prototype.remove = function (actionOrTransformer) {
        var id = StateTransformer.is(actionOrTransformer)
            ? actionOrTransformer.toAction().id
            : UUID.is(actionOrTransformer)
                ? actionOrTransformer
                : actionOrTransformer.id;
        var action = this.actions.get(id);
        if (!action)
            return this;
        this.actions.delete(id);
        for (var _i = 0, _a = action.definition.from; _i < _a.length; _i++) {
            var t = _a[_i];
            var xs = this.fromTypeIndex.get(t.type);
            if (!xs)
                continue;
            arraySetRemove(xs, action);
            if (xs.length === 0)
                this.fromTypeIndex.delete(t.type);
        }
        this.events.removed.next(void 0);
        return this;
    };
    StateActionManager.prototype.fromCell = function (cell, ctx) {
        var obj = cell.obj;
        if (!obj)
            return [];
        var actions = this.fromTypeIndex.get(obj.type);
        if (!actions)
            return [];
        var hasTest = false;
        for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
            var a = actions_1[_i];
            if (a.definition.isApplicable) {
                hasTest = true;
                break;
            }
        }
        if (!hasTest)
            return actions;
        var ret = [];
        for (var _a = 0, actions_2 = actions; _a < actions_2.length; _a++) {
            var a = actions_2[_a];
            if (a.definition.isApplicable) {
                if (a.definition.isApplicable(obj, cell.transform, ctx)) {
                    ret.push(a);
                }
            }
            else {
                ret.push(a);
            }
        }
        return ret;
    };
    StateActionManager.prototype.dispose = function () {
        this.ev.dispose();
    };
    return StateActionManager;
}());
