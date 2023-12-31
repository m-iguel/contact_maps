import { __extends, __spreadArray } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { debounceTime, filter } from 'rxjs/operators';
import { PluginCommands } from '../../mol-plugin/commands';
import { StateObject, StateTransform } from '../../mol-state';
import { StateTreeSpine } from '../../mol-state/tree/spine';
import { PluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, ControlGroup, IconButton } from '../controls/common';
import { Icon, HomeOutlinedSvg, ArrowRightSvg, ArrowDropDownSvg, DeleteOutlinedSvg, VisibilityOffOutlinedSvg, VisibilityOutlinedSvg, CloseSvg } from '../controls/icons';
import { ApplyActionControl } from './apply-action';
import { UpdateTransformControl } from './update-transform';
var StateTree = /** @class */ (function (_super) {
    __extends(StateTree, _super);
    function StateTree() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { showActions: true };
        return _this;
    }
    StateTree.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.events.cell.created, function (e) {
            if (e.cell.transform.parent === StateTransform.RootRef)
                _this.forceUpdate();
        });
        this.subscribe(this.plugin.state.events.cell.removed, function (e) {
            if (e.parent === StateTransform.RootRef)
                _this.forceUpdate();
        });
    };
    StateTree.getDerivedStateFromProps = function (props, state) {
        var n = props.state.tree.root.ref;
        var children = props.state.tree.children.get(n);
        var showActions = children.size === 0;
        if (state.showActions === showActions)
            return null;
        return { showActions: showActions };
    };
    StateTree.prototype.render = function () {
        var ref = this.props.state.tree.root.ref;
        if (this.state.showActions) {
            return _jsxs("div", { style: { margin: '10px', cursor: 'default' }, children: [_jsx("p", { children: "Nothing to see here yet." }), _jsxs("p", { children: ["Structures and Volumes can be loaded from the ", _jsx(Icon, { svg: HomeOutlinedSvg }), " tab."] })] });
        }
        return _jsx(StateTreeNode, { cell: this.props.state.cells.get(ref), depth: 0 });
    };
    return StateTree;
}(PluginUIComponent));
export { StateTree };
var StateTreeNode = /** @class */ (function (_super) {
    __extends(StateTreeNode, _super);
    function StateTreeNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isCollapsed: !!_this.props.cell.state.isCollapsed,
            isNull: StateTreeNode.isNull(_this.props.cell),
            showLabel: StateTreeNode.showLabel(_this.props.cell)
        };
        return _this;
    }
    StateTreeNode.prototype.is = function (e) {
        return e.ref === this.ref && e.state === this.props.cell.parent;
    };
    Object.defineProperty(StateTreeNode.prototype, "ref", {
        get: function () {
            return this.props.cell.transform.ref;
        },
        enumerable: false,
        configurable: true
    });
    StateTreeNode.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.events.cell.stateUpdated, function (e) {
            if (_this.props.cell === e.cell && _this.is(e) && e.state.cells.has(_this.ref)) {
                if (_this.state.isCollapsed !== !!e.cell.state.isCollapsed
                    || _this.state.isNull !== StateTreeNode.isNull(e.cell)
                    || _this.state.showLabel !== StateTreeNode.showLabel(e.cell)) {
                    _this.forceUpdate();
                }
            }
        });
        this.subscribe(this.plugin.state.events.cell.created, function (e) {
            if (_this.props.cell.parent === e.state && _this.ref === e.cell.transform.parent) {
                _this.forceUpdate();
            }
        });
        this.subscribe(this.plugin.state.events.cell.removed, function (e) {
            if (_this.props.cell.parent === e.state && _this.ref === e.parent) {
                _this.forceUpdate();
            }
        });
    };
    StateTreeNode.getDerivedStateFromProps = function (props, state) {
        var isNull = StateTreeNode.isNull(props.cell);
        var showLabel = StateTreeNode.showLabel(props.cell);
        if (!!props.cell.state.isCollapsed === state.isCollapsed && state.isNull === isNull && state.showLabel === showLabel)
            return null;
        return { isCollapsed: !!props.cell.state.isCollapsed, isNull: isNull, showLabel: showLabel };
    };
    StateTreeNode.hasDecorator = function (cell) {
        var _a;
        var children = cell.parent.tree.children.get(cell.transform.ref);
        if (children.size !== 1)
            return false;
        return !!((_a = cell.parent) === null || _a === void 0 ? void 0 : _a.tree.transforms.get(children.first()).transformer.definition.isDecorator);
    };
    StateTreeNode.isNull = function (cell) {
        return !cell || !cell.parent || cell.obj === StateObject.Null || !cell.parent.tree.transforms.has(cell.transform.ref);
    };
    StateTreeNode.showLabel = function (cell) {
        return (cell.transform.ref !== StateTransform.RootRef) && (cell.status !== 'ok' || (!cell.state.isGhost && !StateTreeNode.hasDecorator(cell)));
    };
    StateTreeNode.prototype.render = function () {
        var _this = this;
        if (this.state.isNull) {
            return null;
        }
        var cell = this.props.cell;
        var children = cell.parent.tree.children.get(this.ref);
        if (!this.state.showLabel) {
            if (children.size === 0)
                return null;
            return _jsx(_Fragment, { children: children.map(function (c) { return _jsx(StateTreeNode, { cell: cell.parent.cells.get(c), depth: _this.props.depth }, c); }) });
        }
        var newDepth = this.props.depth + 1;
        return _jsxs(_Fragment, { children: [_jsx(StateTreeNodeLabel, { cell: cell, depth: this.props.depth }), children.size === 0
                    ? void 0
                    : _jsx("div", { style: { display: this.state.isCollapsed ? 'none' : 'block' }, children: children.map(function (c) { return _jsx(StateTreeNode, { cell: cell.parent.cells.get(c), depth: newDepth }, c); }) })] });
    };
    return StateTreeNode;
}(PluginUIComponent));
var StateTreeNodeLabel = /** @class */ (function (_super) {
    __extends(StateTreeNodeLabel, _super);
    function StateTreeNodeLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isCurrent: _this.props.cell.parent.current === _this.ref,
            isCollapsed: !!_this.props.cell.state.isCollapsed,
            action: void 0,
            currentAction: void 0
        };
        _this.setCurrent = function (e) {
            e === null || e === void 0 ? void 0 : e.preventDefault();
            e === null || e === void 0 ? void 0 : e.currentTarget.blur();
            PluginCommands.State.SetCurrentObject(_this.plugin, { state: _this.props.cell.parent, ref: _this.ref });
        };
        _this.setCurrentRoot = function (e) {
            e === null || e === void 0 ? void 0 : e.preventDefault();
            e === null || e === void 0 ? void 0 : e.currentTarget.blur();
            PluginCommands.State.SetCurrentObject(_this.plugin, { state: _this.props.cell.parent, ref: StateTransform.RootRef });
        };
        _this.remove = function (e) {
            e === null || e === void 0 ? void 0 : e.preventDefault();
            PluginCommands.State.RemoveObject(_this.plugin, { state: _this.props.cell.parent, ref: _this.ref, removeParentGhosts: true });
        };
        _this.toggleVisible = function (e) {
            e.preventDefault();
            PluginCommands.State.ToggleVisibility(_this.plugin, { state: _this.props.cell.parent, ref: _this.ref });
            e.currentTarget.blur();
        };
        _this.toggleExpanded = function (e) {
            e.preventDefault();
            PluginCommands.State.ToggleExpanded(_this.plugin, { state: _this.props.cell.parent, ref: _this.ref });
            e.currentTarget.blur();
        };
        _this.highlight = function (e) {
            e.preventDefault();
            PluginCommands.Interactivity.Object.Highlight(_this.plugin, { state: _this.props.cell.parent, ref: _this.ref });
            e.currentTarget.blur();
        };
        _this.clearHighlight = function (e) {
            e.preventDefault();
            PluginCommands.Interactivity.ClearHighlights(_this.plugin);
            e.currentTarget.blur();
        };
        _this.hideApply = function () {
            _this.setCurrentRoot();
        };
        _this.selectAction = function (item) {
            if (!item)
                return;
            (item === null || item === void 0 ? void 0 : item.value)();
        };
        return _this;
    }
    StateTreeNodeLabel.prototype.is = function (e) {
        return e.ref === this.ref && e.state === this.props.cell.parent;
    };
    Object.defineProperty(StateTreeNodeLabel.prototype, "ref", {
        get: function () {
            return this.props.cell.transform.ref;
        },
        enumerable: false,
        configurable: true
    });
    StateTreeNodeLabel.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.events.cell.stateUpdated.pipe(filter(function (e) { return _this.is(e); }), debounceTime(33)), function (e) {
            _this.forceUpdate();
        });
        this.subscribe(this.props.cell.parent.behaviors.currentObject, function (e) {
            if (!_this.is(e)) {
                if (_this.state.isCurrent && e.state.transforms.has(_this.ref)) {
                    _this._setCurrent(_this.props.cell.parent.current === _this.ref, _this.state.isCollapsed);
                }
                return;
            }
            if (e.state.transforms.has(_this.ref)) {
                _this._setCurrent(_this.props.cell.parent.current === _this.ref, !!_this.props.cell.state.isCollapsed);
            }
        });
    };
    StateTreeNodeLabel.prototype._setCurrent = function (isCurrent, isCollapsed) {
        if (isCurrent) {
            this.setState({ isCurrent: isCurrent, action: 'options', currentAction: void 0, isCollapsed: isCollapsed });
        }
        else {
            this.setState({ isCurrent: isCurrent, action: void 0, currentAction: void 0, isCollapsed: isCollapsed });
        }
    };
    StateTreeNodeLabel.getDerivedStateFromProps = function (props, state) {
        var isCurrent = props.cell.parent.current === props.cell.transform.ref;
        var isCollapsed = !!props.cell.state.isCollapsed;
        if (state.isCollapsed === isCollapsed && state.isCurrent === isCurrent)
            return null;
        return { isCurrent: isCurrent, isCollapsed: isCollapsed, action: void 0, currentAction: void 0 };
    };
    Object.defineProperty(StateTreeNodeLabel.prototype, "actions", {
        get: function () {
            var _this = this;
            var cell = this.props.cell;
            var actions = __spreadArray([], cell.parent.actions.fromCell(cell, this.plugin), true);
            if (actions.length === 0)
                return;
            actions.sort(function (a, b) { return a.definition.display.name < b.definition.display.name ? -1 : a.definition.display.name === b.definition.display.name ? 0 : 1; });
            return __spreadArray([
                ActionMenu.Header('Apply Action')
            ], actions.map(function (a) { return ActionMenu.Item(a.definition.display.name, function () { return _this.setState({ action: 'apply', currentAction: a }); }); }), true);
        },
        enumerable: false,
        configurable: true
    });
    StateTreeNodeLabel.prototype.updates = function (margin) {
        var cell = this.props.cell;
        var decoratorChain = StateTreeSpine.getDecoratorChain(cell.parent, cell.transform.ref);
        var decorators = [];
        for (var i = decoratorChain.length - 1; i >= 0; i--) {
            var d = decoratorChain[i];
            decorators.push(_jsx(UpdateTransformControl, { state: cell.parent, transform: d.transform, noMargin: true, wrapInExpander: true, expanderHeaderLeftMargin: margin }, "".concat(d.transform.transformer.id, "-").concat(i)));
        }
        return _jsx("div", { className: 'msp-tree-updates-wrapper', children: decorators });
    };
    StateTreeNodeLabel.prototype.render = function () {
        var cell = this.props.cell;
        var n = cell.transform;
        if (!cell)
            return null;
        var isCurrent = this.is(cell.parent.behaviors.currentObject.value);
        var disabled = cell.status !== 'error' && cell.status !== 'ok';
        var label;
        if (cell.status === 'error' || !cell.obj) {
            var name_1 = cell.status === 'error' ? cell.errorText : n.transformer.definition.display.name;
            label = _jsxs(Button, { className: 'msp-btn-tree-label msp-no-hover-outline', noOverflow: true, title: name_1, onClick: this.state.isCurrent ? this.setCurrentRoot : this.setCurrent, disabled: disabled, children: [cell.status === 'error' && _jsxs("b", { children: ["[", cell.status, "]"] }), " ", _jsx("span", { children: name_1 })] });
        }
        else {
            var obj = cell.obj;
            var title = "".concat(obj.label, " ").concat(obj.description ? obj.description : '');
            label = _jsxs(Button, { className: "msp-btn-tree-label msp-type-class-".concat(obj.type.typeClass), noOverflow: true, disabled: disabled, title: title, onClick: this.state.isCurrent ? this.setCurrentRoot : this.setCurrent, children: [_jsx("span", { children: obj.label }), " ", obj.description ? _jsx("small", { children: obj.description }) : void 0] });
        }
        var children = cell.parent.tree.children.get(this.ref);
        var cellState = cell.state;
        var expand = _jsx(IconButton, { svg: cellState.isCollapsed ? ArrowRightSvg : ArrowDropDownSvg, flex: '20px', disabled: disabled, onClick: this.toggleExpanded, transparent: true, className: 'msp-no-hover-outline', style: { visibility: children.size > 0 ? 'visible' : 'hidden' } });
        var remove = !cell.state.isLocked ? _jsx(IconButton, { svg: DeleteOutlinedSvg, onClick: this.remove, disabled: disabled, small: true, toggleState: false }) : void 0;
        var visibility = _jsx(IconButton, { svg: cellState.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, disabled: disabled, small: true, onClick: this.toggleVisible });
        var marginStyle = {
            marginLeft: "".concat(this.props.depth * 8, "px")
        };
        var row = _jsxs("div", { className: "msp-flex-row msp-tree-row".concat(isCurrent ? ' msp-tree-row-current' : ''), onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: marginStyle, children: [expand, label, remove, visibility] });
        if (!isCurrent)
            return row;
        if (this.state.action === 'apply' && this.state.currentAction) {
            return _jsxs("div", { style: { marginBottom: '1px' }, children: [row, _jsx(ControlGroup, { header: "Apply ".concat(this.state.currentAction.definition.display.name), initialExpanded: true, hideExpander: true, hideOffset: false, onHeaderClick: this.hideApply, topRightIcon: CloseSvg, headerLeftMargin: "".concat(this.props.depth * 8 + 21, "px"), children: _jsx(ApplyActionControl, { onApply: this.hideApply, state: this.props.cell.parent, action: this.state.currentAction, nodeRef: this.props.cell.transform.ref, hideHeader: true, noMargin: true }) })] });
        }
        if (this.state.action === 'options') {
            var actions = this.actions;
            var updates = this.updates("".concat(this.props.depth * 8 + 21, "px"));
            return _jsxs("div", { style: { marginBottom: '1px' }, children: [row, updates, actions && _jsx("div", { style: { marginLeft: "".concat(this.props.depth * 8 + 21, "px"), marginTop: '-1px' }, children: _jsx(ActionMenu, { items: actions, onSelect: this.selectAction }) })] });
        }
        return row;
    };
    return StateTreeNodeLabel;
}(PluginUIComponent));
