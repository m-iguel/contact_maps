/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { StateSelection } from '../../mol-state';
import { RxEventHelper } from '../../mol-util/rx-event-helper';
export { SubstructureParentHelper };
var SubstructureParentHelper = /** @class */ (function () {
    function SubstructureParentHelper(plugin) {
        var _this = this;
        this.plugin = plugin;
        this.ev = RxEventHelper.create();
        this.events = {
            updated: this.ev(),
            removed: this.ev(),
        };
        // private decorators = new Map<string, string[]>();
        this.root = new Map();
        this.tracked = new Map();
        plugin.state.data.events.object.created.subscribe(function (e) {
            _this.addMapping(e.state, e.ref, e.obj);
        });
        plugin.state.data.events.object.removed.subscribe(function (e) {
            if (_this.removeMapping(e.ref)) {
                _this.events.removed.next({ ref: e.ref, obj: e.obj });
            }
        });
        plugin.state.data.events.object.updated.subscribe(function (e) {
            if (_this.updateMapping(e.state, e.ref, e.oldObj, e.obj)) {
                _this.events.updated.next({ ref: e.ref, oldObj: e.oldObj, obj: e.obj });
            }
        });
    }
    SubstructureParentHelper.prototype.getDecorator = function (root) {
        var tree = this.plugin.state.data.tree;
        var children = tree.children.get(root);
        if (children.size !== 1)
            return root;
        var child = children.first();
        if (tree.transforms.get(child).transformer.definition.isDecorator) {
            return this.getDecorator(child);
        }
        return root;
    };
    /** Returns the root node of given structure if existing, takes decorators into account */
    SubstructureParentHelper.prototype.get = function (s, ignoreDecorators) {
        if (ignoreDecorators === void 0) { ignoreDecorators = false; }
        var r = this.root.get(s);
        if (!r)
            return;
        if (ignoreDecorators)
            return this.plugin.state.data.cells.get(r.ref);
        return this.plugin.state.data.cells.get(this.getDecorator(r.ref));
    };
    SubstructureParentHelper.prototype.addMapping = function (state, ref, obj) {
        if (!PluginStateObject.Molecule.Structure.is(obj))
            return false;
        this.tracked.set(ref, obj.data);
        // if the structure is already present in the tree, do not rewrite the root.
        if (this.root.has(obj.data)) {
            var e = this.root.get(obj.data);
            e.count++;
        }
        else {
            var parent_1 = state.select(StateSelection.Generators.byRef(ref).rootOfType([PluginStateObject.Molecule.Structure]))[0];
            if (!parent_1) {
                this.root.set(obj.data, { ref: ref, count: 1 });
            }
            else {
                this.root.set(obj.data, { ref: parent_1.transform.ref, count: 1 });
            }
        }
        return true;
    };
    SubstructureParentHelper.prototype.removeMapping = function (ref) {
        if (!this.tracked.has(ref))
            return false;
        var s = this.tracked.get(ref);
        this.tracked.delete(ref);
        var root = this.root.get(s);
        if (root.count > 1) {
            root.count--;
        }
        else {
            this.root.delete(s);
        }
        return true;
    };
    SubstructureParentHelper.prototype.updateMapping = function (state, ref, oldObj, obj) {
        if (!PluginStateObject.Molecule.Structure.is(obj))
            return false;
        this.removeMapping(ref);
        this.addMapping(state, ref, obj);
        return true;
    };
    SubstructureParentHelper.prototype.dispose = function () {
        this.ev.dispose();
    };
    return SubstructureParentHelper;
}());
