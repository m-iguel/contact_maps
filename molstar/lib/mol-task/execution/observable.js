/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { __assign, __awaiter, __generator } from "tslib";
import { Task } from '../task';
import { now } from '../../mol-util/now';
import { Scheduler } from '../util/scheduler';
import { UserTiming } from '../util/user-timing';
export function ExecuteObservable(task, observer, updateRateMs) {
    if (updateRateMs === void 0) { updateRateMs = 250; }
    var info = ProgressInfo(task, observer, updateRateMs);
    var ctx = new ObservableRuntimeContext(info, info.root);
    return execute(task, ctx);
}
export function CreateObservableCtx(task, observer, updateRateMs) {
    if (updateRateMs === void 0) { updateRateMs = 250; }
    var info = ProgressInfo(task, observer, updateRateMs);
    return new ObservableRuntimeContext(info, info.root);
}
export function ExecuteInContext(ctx, task) {
    return execute(task, ctx);
}
export function ExecuteObservableChild(ctx, task, progress) {
    return ctx.runChild(task, progress);
}
function defaultProgress(task) {
    return {
        taskId: task.id,
        taskName: task.name,
        message: '',
        startedTime: 0,
        canAbort: true,
        isIndeterminate: true,
        current: 0,
        max: 0
    };
}
function ProgressInfo(task, observer, updateRateMs) {
    var abortToken = { abortRequested: false, treeAborted: false, reason: '' };
    return {
        updateRateMs: updateRateMs,
        lastNotified: now(),
        observer: observer,
        abortToken: abortToken,
        taskId: task.id,
        root: { progress: defaultProgress(task), children: [] },
        tryAbort: createAbortFunction(abortToken)
    };
}
function createAbortFunction(token) {
    return function (reason) {
        token.abortRequested = true;
        token.reason = reason || token.reason;
    };
}
function cloneTree(root) {
    return { progress: __assign({}, root.progress), children: root.children.map(cloneTree) };
}
function canAbort(root) {
    return root.progress.canAbort && root.children.every(canAbort);
}
function snapshotProgress(info) {
    return { root: cloneTree(info.root), canAbort: canAbort(info.root), requestAbort: info.tryAbort };
}
function execute(task, ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var ret, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    UserTiming.markStart(task);
                    ctx.node.progress.startedTime = now();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 7]);
                    return [4 /*yield*/, task.f(ctx)];
                case 2:
                    ret = _a.sent();
                    UserTiming.markEnd(task);
                    UserTiming.measure(task);
                    if (ctx.info.abortToken.abortRequested) {
                        abort(ctx.info);
                    }
                    return [2 /*return*/, ret];
                case 3:
                    e_1 = _a.sent();
                    if (!Task.isAbort(e_1)) return [3 /*break*/, 6];
                    ctx.isAborted = true;
                    if (!(ctx.node.children.length > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, new Promise(function (res) { ctx.onChildrenFinished = res; })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (task.onAbort) {
                        task.onAbort();
                    }
                    _a.label = 6;
                case 6: throw e_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
function abort(info) {
    if (!info.abortToken.treeAborted) {
        info.abortToken.treeAborted = true;
        abortTree(info.root);
        notifyObserver(info, now());
    }
    throw Task.Aborted(info.abortToken.reason);
}
function abortTree(root) {
    var progress = root.progress;
    progress.isIndeterminate = true;
    progress.canAbort = false;
    progress.message = 'Aborting...';
    for (var _a = 0, _b = root.children; _a < _b.length; _a++) {
        var c = _b[_a];
        abortTree(c);
    }
}
// function shouldNotify(info: ProgressInfo, time: number) {
//     return time - info.lastNotified > info.updateRateMs;
// }
function notifyObserver(info, time) {
    info.lastNotified = time;
    var snapshot = snapshotProgress(info);
    info.observer(snapshot);
}
var ObservableRuntimeContext = /** @class */ (function () {
    function ObservableRuntimeContext(info, node) {
        this.isSynchronous = false;
        this.isExecuting = true;
        this.lastUpdatedTime = 0;
        // used for waiting for cancelled computation trees
        this.onChildrenFinished = void 0;
        this.node = node;
        this.info = info;
    }
    ObservableRuntimeContext.prototype.checkAborted = function () {
        if (this.info.abortToken.abortRequested) {
            this.isAborted = true;
            abort(this.info);
        }
    };
    Object.defineProperty(ObservableRuntimeContext.prototype, "shouldUpdate", {
        get: function () {
            this.checkAborted();
            return now() - this.lastUpdatedTime > this.info.updateRateMs;
        },
        enumerable: false,
        configurable: true
    });
    ObservableRuntimeContext.prototype.updateProgress = function (update) {
        this.checkAborted();
        if (!update)
            return;
        var progress = this.node.progress;
        if (typeof update === 'string') {
            progress.message = update;
            progress.isIndeterminate = true;
        }
        else {
            if (typeof update.canAbort !== 'undefined')
                progress.canAbort = update.canAbort;
            if (typeof update.message !== 'undefined')
                progress.message = update.message;
            if (typeof update.current !== 'undefined')
                progress.current = update.current;
            if (typeof update.max !== 'undefined')
                progress.max = update.max;
            progress.isIndeterminate = typeof progress.current === 'undefined' || typeof progress.max === 'undefined';
            if (typeof update.isIndeterminate !== 'undefined')
                progress.isIndeterminate = update.isIndeterminate;
        }
    };
    ObservableRuntimeContext.prototype.update = function (progress, dontNotify) {
        // The progress tracking and observer notification are separated
        // because the computation can have a tree structure.
        // All nodes of the tree should be regualarly updated at the specified frequency,
        // however, the notification should only be invoked once per the whole tree.
        this.lastUpdatedTime = now();
        this.updateProgress(progress);
        // TODO: do the shouldNotify check here?
        if (!!dontNotify /* || !shouldNotify(this.info, this.lastUpdatedTime)*/)
            return;
        notifyObserver(this.info, this.lastUpdatedTime);
        // The computation could have been aborted during the notifycation phase.
        this.checkAborted();
        return Scheduler.immediatePromise();
    };
    ObservableRuntimeContext.prototype.runChild = function (task, progress) {
        return __awaiter(this, void 0, void 0, function () {
            var node, children, ctx, e_2, idx, i, _i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.updateProgress(progress);
                        node = { progress: defaultProgress(task), children: [] };
                        children = this.node.children;
                        children.push(node);
                        ctx = new ObservableRuntimeContext(this.info, node);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, execute(task, ctx)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_2 = _a.sent();
                        if (Task.isAbort(e_2)) {
                            // need to catch the error here because otherwise
                            // promises for running child tasks in a tree-like computation
                            // will get orphaned and cause "uncaught error in Promise".
                            if (this.isAborted)
                                return [2 /*return*/, void 0];
                        }
                        throw e_2;
                    case 4:
                        idx = children.indexOf(node);
                        if (idx >= 0) {
                            for (i = idx, _i = children.length - 1; i < _i; i++) {
                                children[i] = children[i + 1];
                            }
                            children.pop();
                        }
                        if (children.length === 0 && this.onChildrenFinished)
                            this.onChildrenFinished();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return ObservableRuntimeContext;
}());
