import { __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PluginUIComponent } from '../base';
import { Icon, CodeSvg } from '../controls/icons';
import { ApplyActionControl } from './apply-action';
var StateObjectActions = /** @class */ (function (_super) {
    __extends(StateObjectActions, _super);
    function StateObjectActions() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(StateObjectActions.prototype, "current", {
        get: function () {
            return this.props.state.behaviors.currentObject.value;
        },
        enumerable: false,
        configurable: true
    });
    StateObjectActions.prototype.componentDidMount = function () {
        // TODO: handle tree change: some state actions might become invalid
        // this.subscribe(this.props.state.events.changed, o => {
        //     this.setState(createStateObjectActionSelectState(this.props));
        // });
        var _this = this;
        this.subscribe(this.plugin.state.events.object.updated, function (_a) {
            var ref = _a.ref, state = _a.state;
            var current = _this.current;
            if (current.ref !== ref || current.state !== state)
                return;
            _this.forceUpdate();
        });
        this.subscribe(this.plugin.state.data.actions.events.added, function () { return _this.forceUpdate(); });
        this.subscribe(this.plugin.state.data.actions.events.removed, function () { return _this.forceUpdate(); });
    };
    StateObjectActions.prototype.render = function () {
        var _this = this;
        var _a = this.props, state = _a.state, ref = _a.nodeRef;
        var cell = state.cells.get(ref);
        var actions = state.actions.fromCell(cell, this.plugin);
        if (actions.length === 0)
            return null;
        var def = cell.transform.transformer.definition;
        var display = cell.obj ? cell.obj.label : (def.display && def.display.name) || def.name;
        return _jsxs("div", { className: 'msp-state-actions', children: [!this.props.hideHeader && _jsxs("div", { className: 'msp-section-header', children: [_jsx(Icon, { svg: CodeSvg }), " ", "Actions (".concat(display, ")")] }), actions.map(function (act, i) { return _jsx(ApplyActionControl, { state: state, action: act, nodeRef: ref, initiallyCollapsed: i === 0 ? !_this.props.alwaysExpandFirst && _this.props.initiallyCollapsed : _this.props.initiallyCollapsed }, "".concat(act.id)); })] });
    };
    return StateObjectActions;
}(PluginUIComponent));
export { StateObjectActions };
