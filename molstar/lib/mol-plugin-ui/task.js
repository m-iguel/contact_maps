import { __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginReactContext, PluginUIComponent } from './base';
import { OrderedMap } from 'immutable';
import { IconButton } from './controls/common';
import { CancelSvg } from './controls/icons';
import { useContext, useEffect, useState } from 'react';
import { useBehavior } from './hooks/use-behavior';
export function BackgroundTaskProgress() {
    var plugin = useContext(PluginReactContext);
    var _a = useState(OrderedMap()), tracked = _a[0], setTracked = _a[1];
    useEffect(function () {
        var started = plugin.events.task.progress.subscribe(function (e) {
            var _a;
            var hideOverlay = !!((_a = plugin.spec.components) === null || _a === void 0 ? void 0 : _a.hideTaskOverlay);
            if (e.level === 'background' && (hideOverlay || !e.useOverlay)) {
                setTracked(function (tracked) { return tracked.set(e.id, e); });
            }
        });
        var finished = plugin.events.task.finished.subscribe(function (_a) {
            var id = _a.id;
            setTracked(function (tracked) { return tracked.delete(id); });
        });
        return function () {
            started.unsubscribe();
            finished.unsubscribe();
        };
    }, [plugin]);
    return _jsxs("div", { className: 'msp-background-tasks', children: [tracked.valueSeq().map(function (e) { return _jsx(ProgressEntry, { event: e }, e.id); }), _jsx(CanvasCommitState, {})] });
}
function CanvasCommitState() {
    var _a;
    var plugin = useContext(PluginReactContext);
    var queueSize = useBehavior((_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.commitQueueSize);
    if (!queueSize)
        return null;
    return _jsx("div", { className: 'msp-task-state', children: _jsx("div", { children: _jsxs("div", { children: ["Commiting renderables... ", queueSize, " remaining"] }) }) });
}
var ProgressEntry = /** @class */ (function (_super) {
    __extends(ProgressEntry, _super);
    function ProgressEntry() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.abort = function () {
            _this.plugin.managers.task.requestAbort(_this.props.event.progress.root.progress.taskId, 'User Request');
        };
        return _this;
    }
    ProgressEntry.prototype.render = function () {
        var root = this.props.event.progress.root;
        var subtaskCount = countSubtasks(this.props.event.progress.root) - 1;
        var pr = root.progress.isIndeterminate
            ? void 0
            : _jsxs(_Fragment, { children: ["[", root.progress.current, "/", root.progress.max, "]"] });
        var subtasks = subtaskCount > 0
            ? _jsxs(_Fragment, { children: ["[", subtaskCount, " subtask(s)]"] })
            : void 0;
        return _jsx("div", { className: 'msp-task-state', children: _jsxs("div", { children: [root.progress.canAbort && _jsx(IconButton, { svg: CancelSvg, onClick: this.abort, title: 'Abort' }), _jsxs("div", { children: [root.progress.message, " ", pr, " ", subtasks] })] }) });
    };
    return ProgressEntry;
}(PluginUIComponent));
function countSubtasks(progress) {
    if (progress.children.length === 0)
        return 1;
    var sum = 0;
    for (var _i = 0, _a = progress.children; _i < _a.length; _i++) {
        var c = _a[_i];
        sum += countSubtasks(c);
    }
    return sum;
}
export function OverlayTaskProgress() {
    var plugin = useContext(PluginReactContext);
    var _a = useState(OrderedMap()), tracked = _a[0], setTracked = _a[1];
    useEffect(function () {
        var started = plugin.events.task.progress.subscribe(function (e) {
            if (!!e.useOverlay) {
                setTracked(function (tracked) { return tracked.set(e.id, e); });
            }
        });
        var finished = plugin.events.task.finished.subscribe(function (_a) {
            var id = _a.id;
            setTracked(function (tracked) { return tracked.delete(id); });
        });
        return function () {
            started.unsubscribe();
            finished.unsubscribe();
        };
    }, [plugin]);
    if (tracked.size === 0)
        return null;
    return _jsx("div", { className: 'msp-overlay-tasks', children: tracked.valueSeq().map(function (e) { return _jsx(ProgressEntry, { event: e }, e.id); }) });
}
