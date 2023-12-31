/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { StateObject, StateObjectSelector } from './object';
import { StateTree } from './tree';
import { StateTransform } from './transform';
import { StateTransformer } from './transformer';
import { Task } from '../mol-task';
import { StateSelection } from './state/selection';
import { RxEventHelper } from '../mol-util/rx-event-helper';
import { StateBuilder } from './state/builder';
import { StateActionManager } from './action/manager';
import { LogEntry } from '../mol-util/log-entry';
import { now, formatTimespan } from '../mol-util/now';
import { ParamDefinition } from '../mol-util/param-definition';
import { StateTreeSpine } from './tree/spine';
import { AsyncQueue } from '../mol-util/async-queue';
import { arraySetAdd, arraySetRemove } from '../mol-util/array';
import { UniqueArray } from '../mol-data/generic';
import { assignIfUndefined } from '../mol-util/object';
export { State };
var State = /** @class */ (function () {
    function State(rootObject, params) {
        var _this = this;
        this.errorFree = true;
        this.ev = RxEventHelper.create();
        this.globalContext = void 0;
        this.events = {
            cell: {
                stateUpdated: this.ev(),
                created: this.ev(),
                removed: this.ev(),
            },
            object: {
                updated: this.ev(),
                created: this.ev(),
                removed: this.ev()
            },
            log: this.ev(),
            changed: this.ev(),
            historyUpdated: this.ev()
        };
        this.behaviors = {
            currentObject: this.ev.behavior({ state: this, ref: StateTransform.RootRef }),
            isUpdating: this.ev.behavior(false),
        };
        this.actions = new StateActionManager();
        this.cells = new Map();
        this.spine = new StateTreeSpine.Impl(this.cells);
        this.tryGetCellData = function (ref) {
            var _a, _b;
            var ret = (_b = (_a = _this.cells.get(ref)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
            if (!ref)
                throw new Error("Cell '".concat(ref, "' data undefined."));
            return ret;
        };
        this.historyCapacity = 5;
        this.history = [];
        this.undoingHistory = false;
        this.inTransaction = false;
        this.inTransactionError = false;
        this._inUpdate = false;
        this.reverted = false;
        this.updateQueue = new AsyncQueue();
        this._tree = StateTree.createEmpty(StateTransform.createRoot(params && params.rootState)).asTransient();
        var tree = this._tree;
        var root = tree.root;
        this.runTask = params.runTask;
        if ((params === null || params === void 0 ? void 0 : params.historyCapacity) !== void 0)
            this.historyCapacity = params.historyCapacity;
        this.cells.set(root.ref, {
            parent: this,
            transform: root,
            sourceRef: void 0,
            obj: rootObject,
            status: 'ok',
            state: __assign({}, root.state),
            errorText: void 0,
            params: {
                definition: {},
                values: {}
            },
            paramsNormalizedVersion: root.version,
            dependencies: { dependentBy: [], dependsOn: [] },
            cache: {}
        });
        this.globalContext = params && params.globalContext;
    }
    Object.defineProperty(State.prototype, "tree", {
        get: function () { return this._tree; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(State.prototype, "transforms", {
        get: function () { return this._tree.transforms; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(State.prototype, "current", {
        get: function () { return this.behaviors.currentObject.value.ref; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(State.prototype, "root", {
        get: function () { return this.cells.get(this._tree.root.ref); },
        enumerable: false,
        configurable: true
    });
    State.prototype.build = function () { return new StateBuilder.Root(this.tree, this); };
    State.prototype.addHistory = function (tree, label) {
        if (this.historyCapacity === 0)
            return;
        this.history.unshift([tree, label || 'Update']);
        if (this.history.length > this.historyCapacity)
            this.history.pop();
        this.events.historyUpdated.next({ state: this });
    };
    State.prototype.clearHistory = function () {
        if (this.history.length === 0)
            return;
        this.history = [];
        this.events.historyUpdated.next({ state: this });
    };
    Object.defineProperty(State.prototype, "latestUndoLabel", {
        get: function () {
            return this.history.length > 0 ? this.history[0][1] : void 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(State.prototype, "canUndo", {
        get: function () {
            return this.history.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    State.prototype.undo = function () {
        var _this = this;
        return Task.create('Undo', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var e;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        e = this.history.shift();
                        if (!e)
                            return [2 /*return*/];
                        this.events.historyUpdated.next({ state: this });
                        this.undoingHistory = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, this.updateTree(e[0], { canUndo: false }).runInContext(ctx)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.undoingHistory = false;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    State.prototype.getSnapshot = function () {
        return { tree: StateTree.toJSON(this._tree) };
    };
    State.prototype.setSnapshot = function (snapshot) {
        var tree = StateTree.fromJSON(snapshot.tree);
        return this.updateTree(tree);
    };
    State.prototype.setCurrent = function (ref) {
        this.behaviors.currentObject.next({ state: this, ref: ref });
    };
    State.prototype.updateCellState = function (ref, stateOrProvider) {
        var cell = this.cells.get(ref);
        if (!cell)
            return;
        var update = typeof stateOrProvider === 'function' ? stateOrProvider(cell.state) : stateOrProvider;
        if (StateTransform.assignState(cell.state, update)) {
            cell.transform = this._tree.assignState(cell.transform.ref, update);
            this.events.cell.stateUpdated.next({ state: this, ref: ref, cell: cell });
        }
    };
    State.prototype.dispose = function () {
        this.ev.dispose();
        this.actions.dispose();
    };
    /**
     * Select Cells using the provided selector.
     * @example state.query(StateSelection.Generators.byRef('test').ancestorOfType(type))
     * @example state.query('test')
     */
    State.prototype.select = function (selector) {
        return StateSelection.select(selector, this);
    };
    /**
     * Select Cells by building a query generated on the fly.
     * @example state.select(q => q.byRef('test').subtree())
     */
    State.prototype.selectQ = function (selector) {
        if (typeof selector === 'string')
            return StateSelection.select(selector, this);
        return StateSelection.select(selector(StateSelection.Generators), this);
    };
    /**
     * Creates a Task that applies the specified StateAction (i.e. must use run* on the result)
     * If no ref is specified, apply to root.
     */
    State.prototype.applyAction = function (action, params, ref) {
        var _this = this;
        if (ref === void 0) { ref = StateTransform.RootRef; }
        return Task.create('Apply Action', function (ctx) {
            var cell = _this.cells.get(ref);
            if (!cell)
                throw new Error("'".concat(ref, "' does not exist."));
            if (cell.status !== 'ok')
                throw new Error("Action cannot be applied to a cell with status '".concat(cell.status, "'"));
            return runTask(action.definition.run({ ref: ref, cell: cell, a: cell.obj, params: params, state: _this }, _this.globalContext), ctx);
        });
    };
    /** Apply series of updates to the state. If any of them fail, revert to the original state. */
    State.prototype.transaction = function (edits, options) {
        var _this = this;
        return Task.create('State Transaction', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var isNested, snapshot, restored, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isNested = this.inTransaction;
                        snapshot = this._tree.asImmutable();
                        restored = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 8, 9]);
                        if (!isNested)
                            this.behaviors.isUpdating.next(true);
                        this.inTransaction = true;
                        this.inTransactionError = false;
                        return [4 /*yield*/, edits(ctx)];
                    case 2:
                        _a.sent();
                        if (!this.inTransactionError) return [3 /*break*/, 4];
                        restored = true;
                        return [4 /*yield*/, this.updateTree(snapshot).runInContext(ctx)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 9];
                    case 5:
                        e_1 = _a.sent();
                        if (!!restored) return [3 /*break*/, 7];
                        restored = true;
                        return [4 /*yield*/, this.updateTree(snapshot).runInContext(ctx)];
                    case 6:
                        _a.sent();
                        this.events.log.next(LogEntry.error('Error during state transaction, reverting'));
                        _a.label = 7;
                    case 7:
                        if (isNested) {
                            this.inTransactionError = true;
                            throw e_1;
                        }
                        if (options === null || options === void 0 ? void 0 : options.rethrowErrors) {
                            throw e_1;
                        }
                        else {
                            console.error(e_1);
                        }
                        return [3 /*break*/, 9];
                    case 8:
                        if (!isNested) {
                            this.inTransaction = false;
                            this.events.changed.next({ state: this, inTransaction: false });
                            this.behaviors.isUpdating.next(false);
                            if (!restored) {
                                if (options === null || options === void 0 ? void 0 : options.canUndo)
                                    this.addHistory(snapshot, typeof options.canUndo === 'string' ? options.canUndo : void 0);
                                else
                                    this.clearHistory();
                            }
                        }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
    };
    Object.defineProperty(State.prototype, "inUpdate", {
        /**
         * Determines whether the state is currently "inside" updateTree function.
         * This is different from "isUpdating" which wraps entire transactions.
         */
        get: function () { return this._inUpdate; },
        enumerable: false,
        configurable: true
    });
    State.prototype.updateTree = function (tree, options) {
        var _this = this;
        var params = { tree: tree, options: options };
        return Task.create('Update Tree', function (taskCtx) { return __awaiter(_this, void 0, void 0, function () {
            var removed, snapshot, reverted, ret, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.updateQueue.enqueue(params)];
                    case 1:
                        removed = _b.sent();
                        if (!removed)
                            return [2 /*return*/];
                        this._inUpdate = true;
                        snapshot = (options === null || options === void 0 ? void 0 : options.canUndo) ? this._tree.asImmutable() : void 0;
                        reverted = false;
                        if (!this.inTransaction)
                            this.behaviors.isUpdating.next(true);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, , 7, 8]);
                        if (StateBuilder.is(tree)) {
                            if (tree.editInfo.applied)
                                throw new Error('This builder has already been applied. Create a new builder for further state updates');
                            tree.editInfo.applied = true;
                        }
                        this.reverted = false;
                        if (!(options && (options.revertIfAborted || options.revertOnError))) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._revertibleTreeUpdate(taskCtx, params, options)];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this._updateTree(taskCtx, params)];
                    case 5:
                        _a = _b.sent();
                        _b.label = 6;
                    case 6:
                        ret = _a;
                        reverted = this.reverted;
                        if (ret.ctx.hadError)
                            this.inTransactionError = true;
                        if (!ret.cell)
                            return [2 /*return*/];
                        return [2 /*return*/, new StateObjectSelector(ret.cell.transform.ref, this)];
                    case 7:
                        this._inUpdate = false;
                        this.updateQueue.handled(params);
                        if (!this.inTransaction) {
                            this.behaviors.isUpdating.next(false);
                            if (!(options === null || options === void 0 ? void 0 : options.canUndo)) {
                                if (!this.undoingHistory)
                                    this.clearHistory();
                            }
                            else if (!reverted) {
                                this.addHistory(snapshot, typeof options.canUndo === 'string' ? options.canUndo : void 0);
                            }
                        }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); }, function () {
            _this.updateQueue.remove(params);
        });
    };
    State.prototype._revertibleTreeUpdate = function (taskCtx, params, options) {
        return __awaiter(this, void 0, void 0, function () {
            var old, ret, revert;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        old = this.tree;
                        return [4 /*yield*/, this._updateTree(taskCtx, params)];
                    case 1:
                        ret = _a.sent();
                        revert = ((ret.ctx.hadError || ret.ctx.wasAborted) && options.revertOnError) || (ret.ctx.wasAborted && options.revertIfAborted);
                        if (!revert) return [3 /*break*/, 3];
                        this.reverted = true;
                        return [4 /*yield*/, this._updateTree(taskCtx, { tree: old, options: params.options })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [2 /*return*/, ret];
                }
            });
        });
    };
    State.prototype._updateTree = function (taskCtx, params) {
        return __awaiter(this, void 0, void 0, function () {
            var updated, ctx, cell;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updated = false;
                        ctx = this.updateTreeAndCreateCtx(params.tree, taskCtx, params.options);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, update(ctx)];
                    case 2:
                        updated = _a.sent();
                        if (StateBuilder.isTo(params.tree)) {
                            cell = this.select(params.tree.ref)[0];
                            return [2 /*return*/, { ctx: ctx, cell: cell }];
                        }
                        return [2 /*return*/, { ctx: ctx }];
                    case 3:
                        this.spine.current = undefined;
                        if (updated)
                            this.events.changed.next({ state: this, inTransaction: this.inTransaction });
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    State.prototype.updateTreeAndCreateCtx = function (tree, taskCtx, options) {
        var _tree = (StateBuilder.is(tree) ? tree.getTree() : tree).asTransient();
        var oldTree = this._tree;
        this._tree = _tree;
        var cells = this.cells;
        var ctx = {
            parent: this,
            editInfo: StateBuilder.is(tree) ? tree.editInfo : void 0,
            errorFree: this.errorFree,
            taskCtx: taskCtx,
            oldTree: oldTree,
            tree: _tree,
            cells: this.cells,
            spine: this.spine,
            results: [],
            options: __assign(__assign({}, StateUpdateDefaultOptions), options),
            changed: false,
            hadError: false,
            wasAborted: false,
            newCurrent: void 0,
            getCellData: function (ref) { var _a; return (_a = cells.get(ref).obj) === null || _a === void 0 ? void 0 : _a.data; }
        };
        this.errorFree = true;
        return ctx;
    };
    return State;
}());
(function (State) {
    function create(rootObject, params) {
        return new State(rootObject, params);
    }
    State.create = create;
    var ObjectEvent;
    (function (ObjectEvent) {
        function isCell(e, cell) {
            return !!cell && e.ref === cell.transform.ref && e.state === cell.parent;
        }
        ObjectEvent.isCell = isCell;
    })(ObjectEvent = State.ObjectEvent || (State.ObjectEvent = {}));
})(State || (State = {}));
var StateUpdateDefaultOptions = {
    doNotLogTiming: false,
    doNotUpdateCurrent: true,
    revertIfAborted: false,
    revertOnError: false,
    canUndo: false
};
function update(ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var fastTrack, deletes, deletedObjects, roots, current, hasCurrent, _i, deletes_1, d, newCurrent_1, i, cell, _a, deletes_2, d, cell, obj, init, _b, _c, cell, i, d, parent_1, _d, _e, cell, _f, roots_1, root, newCurrent, _g, _h, update_1, transform, current, currentCell;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    fastTrack = !!(ctx.editInfo && ctx.editInfo.count === 1 && ctx.editInfo.lastUpdate && ctx.editInfo.sourceTree === ctx.oldTree);
                    deletedObjects = [];
                    if (fastTrack) {
                        deletes = [];
                        roots = [ctx.editInfo.lastUpdate];
                    }
                    else {
                        // find all nodes that will definitely be deleted.
                        // this is done in "post order", meaning that leaves will be deleted first.
                        deletes = findDeletes(ctx);
                        current = ctx.parent.current;
                        hasCurrent = false;
                        for (_i = 0, deletes_1 = deletes; _i < deletes_1.length; _i++) {
                            d = deletes_1[_i];
                            if (d === current) {
                                hasCurrent = true;
                                break;
                            }
                        }
                        if (hasCurrent) {
                            newCurrent_1 = findNewCurrent(ctx.oldTree, current, deletes, ctx.cells);
                            ctx.parent.setCurrent(newCurrent_1);
                        }
                        for (i = deletes.length - 1; i >= 0; i--) {
                            cell = ctx.cells.get(deletes[i]);
                            if (cell) {
                                dispose(cell.transform, cell.obj, cell === null || cell === void 0 ? void 0 : cell.transform.params, cell.cache, ctx.parent.globalContext);
                            }
                        }
                        for (_a = 0, deletes_2 = deletes; _a < deletes_2.length; _a++) {
                            d = deletes_2[_a];
                            cell = ctx.cells.get(d);
                            if (cell) {
                                cell.parent = void 0;
                                unlinkCell(cell);
                            }
                            obj = cell && cell.obj;
                            ctx.cells.delete(d);
                            deletedObjects.push(obj);
                        }
                        // Find roots where transform version changed or where nodes will be added.
                        roots = findUpdateRoots(ctx.cells, ctx.tree);
                    }
                    init = initCells(ctx, roots);
                    // Notify additions of new cells.
                    for (_b = 0, _c = init.added; _b < _c.length; _b++) {
                        cell = _c[_b];
                        ctx.parent.events.cell.created.next({ state: ctx.parent, ref: cell.transform.ref, cell: cell });
                    }
                    for (i = 0; i < deletes.length; i++) {
                        d = deletes[i];
                        parent_1 = ctx.oldTree.transforms.get(d).parent;
                        ctx.parent.events.object.removed.next({ state: ctx.parent, ref: d, obj: deletedObjects[i] });
                        ctx.parent.events.cell.removed.next({ state: ctx.parent, ref: d, parent: parent_1 });
                    }
                    if (deletedObjects.length)
                        deletedObjects = [];
                    if (init.dependent) {
                        for (_d = 0, _e = init.dependent; _d < _e.length; _d++) {
                            cell = _e[_d];
                            roots.push(cell.transform.ref);
                        }
                    }
                    // Set status of cells that will be updated to 'pending'.
                    initCellStatus(ctx, roots);
                    _f = 0, roots_1 = roots;
                    _j.label = 1;
                case 1:
                    if (!(_f < roots_1.length)) return [3 /*break*/, 4];
                    root = roots_1[_f];
                    return [4 /*yield*/, updateSubtree(ctx, root)];
                case 2:
                    _j.sent();
                    _j.label = 3;
                case 3:
                    _f++;
                    return [3 /*break*/, 1];
                case 4:
                    // Sync cell states
                    if (!ctx.editInfo) {
                        syncNewStates(ctx);
                    }
                    newCurrent = ctx.newCurrent;
                    // Raise object updated events
                    for (_g = 0, _h = ctx.results; _g < _h.length; _g++) {
                        update_1 = _h[_g];
                        if (update_1.action === 'created') {
                            ctx.parent.events.object.created.next({ state: ctx.parent, ref: update_1.ref, obj: update_1.obj });
                            if (!ctx.newCurrent) {
                                transform = ctx.tree.transforms.get(update_1.ref);
                                if (!transform.state.isGhost && update_1.obj !== StateObject.Null)
                                    newCurrent = update_1.ref;
                            }
                        }
                        else if (update_1.action === 'updated') {
                            ctx.parent.events.object.updated.next({ state: ctx.parent, ref: update_1.ref, action: 'in-place', obj: update_1.obj, oldData: update_1.oldData });
                        }
                        else if (update_1.action === 'replaced') {
                            ctx.parent.events.object.updated.next({ state: ctx.parent, ref: update_1.ref, action: 'recreate', obj: update_1.obj, oldObj: update_1.oldObj });
                        }
                    }
                    if (newCurrent) {
                        if (!ctx.options.doNotUpdateCurrent)
                            ctx.parent.setCurrent(newCurrent);
                    }
                    else {
                        current = ctx.parent.current;
                        currentCell = ctx.cells.get(current);
                        if (currentCell && (currentCell.obj === StateObject.Null
                            || (currentCell.status === 'error' && currentCell.errorText === ParentNullErrorText))) {
                            newCurrent = findNewCurrent(ctx.oldTree, current, [], ctx.cells);
                            ctx.parent.setCurrent(newCurrent);
                        }
                    }
                    return [2 /*return*/, deletes.length > 0 || roots.length > 0 || ctx.changed];
            }
        });
    });
}
function findUpdateRoots(cells, tree) {
    var findState = { roots: [], cells: cells };
    StateTree.doPreOrder(tree, tree.root, findState, findUpdateRootsVisitor);
    return findState.roots;
}
function findUpdateRootsVisitor(n, _, s) {
    var cell = s.cells.get(n.ref);
    if (!cell || cell.transform.version !== n.version) {
        s.roots.push(n.ref);
        return false;
    }
    if (cell.status === 'error')
        return false;
    // nothing below a Null object can be an update root
    if (cell && cell.obj === StateObject.Null)
        return false;
    return true;
}
function checkDeleteVisitor(n, _, ctx) {
    if (!ctx.newTree.transforms.has(n.ref) && ctx.cells.has(n.ref))
        ctx.deletes.push(n.ref);
}
function findDeletes(ctx) {
    var deleteCtx = { newTree: ctx.tree, cells: ctx.cells, deletes: [] };
    StateTree.doPostOrder(ctx.oldTree, ctx.oldTree.root, deleteCtx, checkDeleteVisitor);
    return deleteCtx.deletes;
}
function syncNewStatesVisitor(n, tree, ctx) {
    var cell = ctx.cells.get(n.ref);
    if (!cell || !StateTransform.syncState(cell.state, n.state))
        return;
    ctx.parent.events.cell.stateUpdated.next({ state: ctx.parent, ref: n.ref, cell: cell });
}
function syncNewStates(ctx) {
    StateTree.doPreOrder(ctx.tree, ctx.tree.root, ctx, syncNewStatesVisitor);
}
function setCellStatus(ctx, ref, status, errorText) {
    var cell = ctx.cells.get(ref);
    var changed = cell.status !== status;
    cell.status = status;
    cell.errorText = errorText;
    if (changed)
        ctx.parent.events.cell.stateUpdated.next({ state: ctx.parent, ref: ref, cell: cell });
}
function initCellStatusVisitor(t, _, ctx) {
    ctx.cells.get(t.ref).transform = t;
    setCellStatus(ctx, t.ref, 'pending');
}
function initCellStatus(ctx, roots) {
    for (var _i = 0, roots_2 = roots; _i < roots_2.length; _i++) {
        var root = roots_2[_i];
        StateTree.doPreOrder(ctx.tree, ctx.tree.transforms.get(root), ctx, initCellStatusVisitor);
    }
}
function unlinkCell(cell) {
    for (var _i = 0, _a = cell.dependencies.dependsOn; _i < _a.length; _i++) {
        var other = _a[_i];
        arraySetRemove(other.dependencies.dependentBy, cell);
    }
}
function addCellsVisitor(transform, _, _a) {
    var ctx = _a.ctx, added = _a.added, visited = _a.visited;
    visited.add(transform.ref);
    if (ctx.cells.has(transform.ref)) {
        return;
    }
    var cell = {
        parent: ctx.parent,
        transform: transform,
        sourceRef: void 0,
        status: 'pending',
        state: __assign({}, transform.state),
        errorText: void 0,
        params: void 0,
        paramsNormalizedVersion: '',
        dependencies: { dependentBy: [], dependsOn: [] },
        cache: void 0
    };
    ctx.cells.set(transform.ref, cell);
    added.push(cell);
}
// type LinkCellsCtx = { ctx: UpdateContext, visited: Set<Ref>, dependent: UniqueArray<Ref, StateObjectCell> }
function linkCells(target, ctx) {
    if (!target.transform.dependsOn)
        return;
    for (var _i = 0, _a = target.transform.dependsOn; _i < _a.length; _i++) {
        var ref = _a[_i];
        var t = ctx.tree.transforms.get(ref);
        if (!t) {
            throw new Error("Cannot depend on a non-existent transform.");
        }
        var cell = ctx.cells.get(ref);
        arraySetAdd(target.dependencies.dependsOn, cell);
        arraySetAdd(cell.dependencies.dependentBy, target);
    }
}
function initCells(ctx, roots) {
    var initCtx = { ctx: ctx, visited: new Set(), added: [] };
    // Add new cells
    for (var _i = 0, roots_3 = roots; _i < roots_3.length; _i++) {
        var root = roots_3[_i];
        StateTree.doPreOrder(ctx.tree, ctx.tree.transforms.get(root), initCtx, addCellsVisitor);
    }
    // Update links for newly added cells
    for (var _a = 0, _b = initCtx.added; _a < _b.length; _a++) {
        var cell = _b[_a];
        linkCells(cell, ctx);
    }
    var dependent;
    // Find dependent cells
    initCtx.visited.forEach(function (ref) {
        var cell = ctx.cells.get(ref);
        for (var _i = 0, _a = cell.dependencies.dependentBy; _i < _a.length; _i++) {
            var by = _a[_i];
            if (initCtx.visited.has(by.transform.ref))
                continue;
            if (!dependent)
                dependent = UniqueArray.create();
            UniqueArray.add(dependent, by.transform.ref, by);
        }
    });
    // TODO: check if dependent cells are all "proper roots"
    return { added: initCtx.added, dependent: dependent ? dependent.array : void 0 };
}
function findNewCurrent(tree, start, deletes, cells) {
    var deleteSet = new Set(deletes);
    return _findNewCurrent(tree, start, deleteSet, cells);
}
function _findNewCurrent(tree, ref, deletes, cells) {
    if (ref === StateTransform.RootRef)
        return ref;
    var node = tree.transforms.get(ref);
    var siblings = tree.children.get(node.parent).values();
    var prevCandidate = void 0, seenRef = false;
    while (true) {
        var s = siblings.next();
        if (s.done)
            break;
        if (deletes.has(s.value))
            continue;
        var cell = cells.get(s.value);
        if (!cell || cell.status === 'error' || cell.obj === StateObject.Null) {
            continue;
        }
        var t = tree.transforms.get(s.value);
        if (t.state.isGhost)
            continue;
        if (s.value === ref) {
            seenRef = true;
            if (!deletes.has(ref))
                prevCandidate = ref;
            continue;
        }
        if (seenRef)
            return t.ref;
        prevCandidate = t.ref;
    }
    if (prevCandidate)
        return prevCandidate;
    return _findNewCurrent(tree, node.parent, deletes, cells);
}
/** Set status and error text of the cell. Remove all existing objects in the subtree. */
function doError(ctx, ref, errorObject, silent) {
    if (!silent) {
        ctx.hadError = true;
        ctx.parent.errorFree = false;
    }
    var cell = ctx.cells.get(ref);
    if (errorObject) {
        ctx.wasAborted = ctx.wasAborted || Task.isAbort(errorObject);
        var message = '' + errorObject;
        setCellStatus(ctx, ref, 'error', message);
        if (!silent)
            ctx.parent.events.log.next({ type: 'error', timestamp: new Date(), message: message });
    }
    else {
        cell.params = void 0;
    }
    if (cell.obj) {
        var obj = cell.obj;
        cell.obj = void 0;
        cell.cache = void 0;
        ctx.parent.events.object.removed.next({ state: ctx.parent, ref: ref, obj: obj });
    }
    // remove the objects in the child nodes if they exist
    var children = ctx.tree.children.get(ref).values();
    while (true) {
        var next = children.next();
        if (next.done)
            return;
        doError(ctx, next.value, void 0, silent);
    }
}
var ParentNullErrorText = 'Parent is null';
function updateSubtree(ctx, root) {
    return __awaiter(this, void 0, void 0, function () {
        var isNull, start, update_2, time, e_2, children, next;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCellStatus(ctx, root, 'processing');
                    isNull = false;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    start = now();
                    return [4 /*yield*/, updateNode(ctx, root)];
                case 2:
                    update_2 = _a.sent();
                    time = now() - start;
                    if (update_2.action !== 'none')
                        ctx.changed = true;
                    setCellStatus(ctx, root, 'ok');
                    ctx.results.push(update_2);
                    if (update_2.action === 'created') {
                        isNull = update_2.obj === StateObject.Null;
                        if (!isNull && !ctx.options.doNotLogTiming)
                            ctx.parent.events.log.next(LogEntry.info("Created ".concat(update_2.obj.label, " in ").concat(formatTimespan(time), ".")));
                    }
                    else if (update_2.action === 'updated') {
                        isNull = update_2.obj === StateObject.Null;
                        if (!isNull && !ctx.options.doNotLogTiming)
                            ctx.parent.events.log.next(LogEntry.info("Updated ".concat(update_2.obj.label, " in ").concat(formatTimespan(time), ".")));
                    }
                    else if (update_2.action === 'replaced') {
                        isNull = update_2.obj === StateObject.Null;
                        if (!isNull && !ctx.options.doNotLogTiming)
                            ctx.parent.events.log.next(LogEntry.info("Updated ".concat(update_2.obj.label, " in ").concat(formatTimespan(time), ".")));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    ctx.changed = true;
                    if (!ctx.hadError)
                        ctx.newCurrent = root;
                    doError(ctx, root, e_2, false);
                    console.error(e_2);
                    return [2 /*return*/];
                case 4:
                    children = ctx.tree.children.get(root).values();
                    _a.label = 5;
                case 5:
                    if (!true) return [3 /*break*/, 9];
                    next = children.next();
                    if (next.done)
                        return [2 /*return*/];
                    if (!isNull) return [3 /*break*/, 6];
                    doError(ctx, next.value, void 0, true);
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, updateSubtree(ctx, next.value)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [3 /*break*/, 5];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function resolveParams(ctx, transform, src, cell) {
    var prms = transform.transformer.definition.params;
    var definition = prms ? prms(src, ctx.parent.globalContext) : {};
    if (cell.paramsNormalizedVersion !== transform.version) {
        transform.params = ParamDefinition.normalizeParams(definition, transform.params, 'all');
        cell.paramsNormalizedVersion = transform.version;
    }
    else {
        var defaultValues = ParamDefinition.getDefaultValues(definition);
        transform.params = transform.params
            ? assignIfUndefined(transform.params, defaultValues)
            : defaultValues;
    }
    ParamDefinition.resolveRefs(definition, transform.params, ctx.getCellData);
    return { definition: definition, values: transform.params };
}
function updateNode(ctx, currentRef) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var oldTree, tree, current, transform, treeParent, isParentNull, oldParams, oldCache, parentCell, parent, params, obj, oldParams, oldCache, oldData, newParams, updateKind, _b, _c, oldObj, newObj;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    oldTree = ctx.oldTree, tree = ctx.tree;
                    current = ctx.cells.get(currentRef);
                    transform = current.transform;
                    // Special case for Root
                    if (current.transform.ref === StateTransform.RootRef) {
                        return [2 /*return*/, { action: 'none' }];
                    }
                    treeParent = ctx.cells.get(current.transform.parent);
                    isParentNull = (treeParent === null || treeParent === void 0 ? void 0 : treeParent.obj) === StateObject.Null;
                    // Special case for when the immediate parent is null
                    // This could happen then manually applying transforms to
                    // already existing null nudes
                    if (isParentNull) {
                        current.sourceRef = treeParent.transform.ref;
                        if (oldTree.transforms.has(currentRef) && current.params) {
                            oldParams = current.params.values;
                            oldCache = current.cache;
                            dispose(transform, current.obj, oldParams, oldCache, ctx.parent.globalContext);
                            current.params = undefined;
                            current.obj = StateObject.Null;
                            return [2 /*return*/, { ref: currentRef, action: 'updated', obj: current.obj }];
                        }
                        else {
                            current.params = undefined;
                            return [2 /*return*/, { ref: currentRef, action: 'created', obj: StateObject.Null }];
                        }
                    }
                    parentCell = transform.transformer.definition.from.length === 0
                        ? treeParent
                        : StateSelection.findAncestorOfType(tree, ctx.cells, currentRef, transform.transformer.definition.from);
                    if (!parentCell) {
                        throw new Error("No suitable parent found for '".concat(currentRef, "'"));
                    }
                    ctx.spine.current = current;
                    parent = parentCell.obj;
                    current.sourceRef = parentCell.transform.ref;
                    params = resolveParams(ctx, transform, parent, current);
                    if (!(!oldTree.transforms.has(currentRef) || !current.params)) return [3 /*break*/, 2];
                    current.params = params;
                    return [4 /*yield*/, createObject(ctx, current, transform.transformer, parent, params.values)];
                case 1:
                    obj = _d.sent();
                    updateTag(obj, transform);
                    current.obj = obj;
                    return [2 /*return*/, { ref: currentRef, action: 'created', obj: obj }];
                case 2:
                    oldParams = current.params.values;
                    oldCache = current.cache;
                    oldData = (_a = current.obj) === null || _a === void 0 ? void 0 : _a.data;
                    newParams = params.values;
                    current.params = params;
                    if (!(!!current.obj && current.obj !== StateObject.Null)) return [3 /*break*/, 4];
                    return [4 /*yield*/, updateObject(ctx, current, transform.transformer, parent, current.obj, oldParams, newParams)];
                case 3:
                    _b = _d.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _b = StateTransformer.UpdateResult.Recreate;
                    _d.label = 5;
                case 5:
                    updateKind = _b;
                    _c = updateKind;
                    switch (_c) {
                        case StateTransformer.UpdateResult.Recreate: return [3 /*break*/, 6];
                        case StateTransformer.UpdateResult.Updated: return [3 /*break*/, 8];
                        case StateTransformer.UpdateResult.Null: return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 10];
                case 6:
                    oldObj = current.obj;
                    dispose(transform, oldObj, oldParams, oldCache, ctx.parent.globalContext);
                    return [4 /*yield*/, createObject(ctx, current, transform.transformer, parent, newParams)];
                case 7:
                    newObj = _d.sent();
                    updateTag(newObj, transform);
                    current.obj = newObj;
                    return [2 /*return*/, { ref: currentRef, action: 'replaced', oldObj: oldObj, obj: newObj }];
                case 8:
                    updateTag(current.obj, transform);
                    return [2 /*return*/, { ref: currentRef, action: 'updated', oldData: oldData, obj: current.obj }];
                case 9:
                    {
                        dispose(transform, current.obj, oldParams, oldCache, ctx.parent.globalContext);
                        current.obj = StateObject.Null;
                        return [2 /*return*/, { ref: currentRef, action: 'updated', obj: current.obj }];
                    }
                    _d.label = 10;
                case 10: return [2 /*return*/, { action: 'none' }];
            }
        });
    });
}
function dispose(transform, b, params, cache, globalContext) {
    var _a, _b;
    (_b = (_a = transform.transformer.definition).dispose) === null || _b === void 0 ? void 0 : _b.call(_a, {
        b: b !== StateObject.Null ? b : void 0,
        params: params,
        cache: cache
    }, globalContext);
}
function updateTag(obj, transform) {
    if (!obj || obj === StateObject.Null)
        return;
    obj.tags = transform.tags;
}
function runTask(t, ctx) {
    if (typeof t.runInContext === 'function')
        return t.runInContext(ctx);
    return t;
}
function resolveDependencies(cell) {
    if (cell.dependencies.dependsOn.length === 0)
        return void 0;
    var deps = Object.create(null);
    for (var _i = 0, _a = cell.dependencies.dependsOn; _i < _a.length; _i++) {
        var dep = _a[_i];
        if (!dep.obj) {
            throw new Error('Unresolved dependency.');
        }
        deps[dep.transform.ref] = dep.obj;
    }
    return deps;
}
function createObject(ctx, cell, transformer, a, params) {
    if (!cell.cache)
        cell.cache = Object.create(null);
    return runTask(transformer.definition.apply({ a: a, params: params, cache: cell.cache, spine: ctx.spine, dependencies: resolveDependencies(cell) }, ctx.parent.globalContext), ctx.taskCtx);
}
function updateObject(ctx, cell, transformer, a, b, oldParams, newParams) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!transformer.definition.update) {
                return [2 /*return*/, StateTransformer.UpdateResult.Recreate];
            }
            if (!cell.cache)
                cell.cache = Object.create(null);
            return [2 /*return*/, runTask(transformer.definition.update({ a: a, oldParams: oldParams, b: b, newParams: newParams, cache: cell.cache, spine: ctx.spine, dependencies: resolveDependencies(cell) }, ctx.parent.globalContext), ctx.taskCtx)];
        });
    });
}
