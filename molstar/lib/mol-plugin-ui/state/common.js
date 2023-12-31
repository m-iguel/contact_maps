import { __assign, __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { PurePluginUIComponent } from '../base';
import { ParameterControls } from '../controls/parameters';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { BehaviorSubject, skip } from 'rxjs';
import { Icon, RefreshSvg, CheckSvg, ArrowRightSvg, ArrowDropDownSvg, TuneSvg } from '../controls/icons';
import { ExpandGroup, ToggleButton, Button, IconButton } from '../controls/common';
export { StateTransformParameters, TransformControlBase };
var StateTransformParameters = /** @class */ (function (_super) {
    __extends(StateTransformParameters, _super);
    function StateTransformParameters() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onChange = function (_a) {
            var _b;
            var name = _a.name, value = _a.value;
            var params = __assign(__assign({}, _this.props.params), (_b = {}, _b[name] = value, _b));
            _this.props.events.onChange(params, _this.areInitial(params), _this.validate(params));
        };
        return _this;
    }
    StateTransformParameters.prototype.validate = function (params) {
        // TODO
        return void 0;
    };
    StateTransformParameters.prototype.areInitial = function (params) {
        return PD.areEqual(this.props.info.params, params, this.props.info.initialValues);
    };
    StateTransformParameters.prototype.render = function () {
        return _jsx(ParameterControls, { params: this.props.info.params, values: this.props.params, onChange: this.onChange, onEnter: this.props.events.onEnter, isDisabled: this.props.isDisabled });
    };
    return StateTransformParameters;
}(PurePluginUIComponent));
(function (StateTransformParameters) {
    function areParamsEmpty(params) {
        var keys = Object.keys(params);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var k = keys_1[_i];
            if (!params[k].isHidden)
                return false;
        }
        return true;
    }
    function infoFromAction(plugin, state, action, nodeRef) {
        var source = state.cells.get(nodeRef).obj;
        var params = action.definition.params ? action.definition.params(source, plugin) : {};
        var initialValues = PD.getDefaultValues(params);
        return {
            initialValues: initialValues,
            params: params,
            isEmpty: areParamsEmpty(params)
        };
    }
    StateTransformParameters.infoFromAction = infoFromAction;
    function infoFromTransform(plugin, state, transform) {
        var cell = state.cells.get(transform.ref);
        // const source: StateObjectCell | undefined = (cell.sourceRef && state.cells.get(cell.sourceRef)!) || void 0;
        // const create = transform.transformer.definition.params;
        // const params = create ? create((source && source.obj) as any, plugin) : { };
        var params = (cell.params && cell.params.definition) || {};
        var initialValues = (cell.params && cell.params.values) || {};
        return {
            initialValues: initialValues,
            params: params,
            isEmpty: areParamsEmpty(params)
        };
    }
    StateTransformParameters.infoFromTransform = infoFromTransform;
})(StateTransformParameters || (StateTransformParameters = {}));
var TransformControlBase = /** @class */ (function (_super) {
    __extends(TransformControlBase, _super);
    function TransformControlBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.busy = new BehaviorSubject(false);
        _this.onEnter = function () {
            if (_this.state.error)
                return;
            _this.apply();
        };
        _this.autoApplyHandle = void 0;
        _this.events = {
            onEnter: _this.onEnter,
            onChange: function (params, isInitial, errors) {
                _this.clearAutoApply();
                _this.setState({ params: params, isInitial: isInitial, error: errors && errors[0] }, function () {
                    if (!isInitial && !_this.state.error && _this.canAutoApply(params)) {
                        _this.clearAutoApply();
                        _this.autoApplyHandle = setTimeout(_this.apply, 50);
                    }
                });
            }
        };
        _this.apply = function () { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.clearAutoApply();
                        this.setState({ busy: true });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, this.applyAction()];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        e_1 = _c.sent();
                        console.error(e_1);
                        return [3 /*break*/, 5];
                    case 4:
                        (_b = (_a = this.props).onApply) === null || _b === void 0 ? void 0 : _b.call(_a);
                        this.busy.next(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        _this.refresh = function () {
            _this.setState({ params: _this.getInfo().initialValues, isInitial: true, error: void 0 });
        };
        _this.setDefault = function () {
            var info = _this.getInfo();
            var params = PD.getDefaultValues(info.params);
            _this.setState({ params: params, isInitial: PD.areEqual(info.params, params, info.initialValues), error: void 0 });
        };
        _this.toggleExpanded = function () {
            _this.setState({ isCollapsed: !_this.state.isCollapsed });
        };
        return _this;
    }
    TransformControlBase.prototype.clearAutoApply = function () {
        if (this.autoApplyHandle !== void 0) {
            clearTimeout(this.autoApplyHandle);
            this.autoApplyHandle = void 0;
        }
    };
    TransformControlBase.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.behaviors.state.isBusy, function (busy) {
            if (_this.busy.value !== busy)
                _this.busy.next(busy);
        });
        this.subscribe(this.busy.pipe(skip(1)), function (busy) {
            _this.setState({ busy: busy });
        });
    };
    TransformControlBase.prototype.renderApply = function () {
        var canApply = this.canApply();
        if (this.props.autoHideApply && (!canApply || this.canAutoApply(this.state.params)))
            return null;
        return _jsxs("div", { className: 'msp-transform-apply-wrap', children: [_jsx(IconButton, { svg: RefreshSvg, className: 'msp-transform-default-params', onClick: this.setDefault, disabled: this.state.busy, title: 'Set default params' }), _jsx("div", { className: "msp-transform-apply-wider", children: _jsx(Button, { icon: canApply ? CheckSvg : void 0, className: "msp-btn-commit msp-btn-commit-".concat(canApply ? 'on' : 'off'), onClick: this.apply, disabled: !canApply, children: this.props.applyLabel || this.applyText() }) })] });
    };
    TransformControlBase.prototype.renderDefault = function () {
        var info = this.getInfo();
        var isEmpty = info.isEmpty && this.isUpdate();
        var display = this.getHeader();
        var tId = this.getTransformerId();
        var ParamEditor = this.plugin.customParamEditors.has(tId)
            ? this.plugin.customParamEditors.get(tId)
            : StateTransformParameters;
        var wrapClass = this.state.isCollapsed
            ? 'msp-transform-wrapper msp-transform-wrapper-collapsed'
            : 'msp-transform-wrapper';
        var params = null;
        if (!isEmpty && !this.state.isCollapsed) {
            var _a = this.getSourceAndTarget(), a = _a.a, b = _a.b, bCell = _a.bCell;
            var applyControl = this.renderApply();
            params = _jsxs(_Fragment, { children: [_jsx(ParamEditor, { info: info, a: a, b: b, bCell: bCell, events: this.events, params: this.state.params, isDisabled: this.state.busy }), applyControl] });
        }
        var ctrl = _jsxs("div", { className: wrapClass, style: { marginBottom: this.props.noMargin ? 0 : void 0 }, children: [display !== 'none' && !this.props.wrapInExpander && _jsx("div", { className: 'msp-transform-header', children: _jsxs(Button, { onClick: this.toggleExpanded, title: display.description, children: [!isEmpty && _jsx(Icon, { svg: this.state.isCollapsed ? ArrowRightSvg : ArrowDropDownSvg }), display.name] }) }), params] });
        if (isEmpty || !this.props.wrapInExpander)
            return ctrl;
        return _jsx(ExpandGroup, { header: this.isUpdate() ? "Update ".concat(display === 'none' ? '' : display.name) : "Apply ".concat(display === 'none' ? '' : display.name), headerLeftMargin: this.props.expanderHeaderLeftMargin, children: ctrl });
    };
    TransformControlBase.prototype.renderSimple = function () {
        var _a, _b, _c;
        var info = this.getInfo();
        var canApply = this.canApply();
        var apply = _jsxs("div", { className: 'msp-flex-row', children: [_jsx(Button, { icon: (_a = this.props.simpleApply) === null || _a === void 0 ? void 0 : _a.icon, title: (_b = this.props.simpleApply) === null || _b === void 0 ? void 0 : _b.title, disabled: this.state.busy || !canApply, onClick: this.apply, className: 'msp-btn-apply-simple', children: (_c = this.props.simpleApply) === null || _c === void 0 ? void 0 : _c.header }), !info.isEmpty && _jsx(ToggleButton, { icon: TuneSvg, label: '', title: 'Options', toggle: this.toggleExpanded, isSelected: !this.state.isCollapsed, disabled: this.state.busy, style: { flex: '0 0 40px', padding: 0 } })] });
        if (this.state.isCollapsed)
            return apply;
        var tId = this.getTransformerId();
        var ParamEditor = this.plugin.customParamEditors.has(tId)
            ? this.plugin.customParamEditors.get(tId)
            : StateTransformParameters;
        var _d = this.getSourceAndTarget(), a = _d.a, b = _d.b, bCell = _d.bCell;
        return _jsxs(_Fragment, { children: [apply, _jsx(ParamEditor, { info: info, a: a, b: b, bCell: bCell, events: this.events, params: this.state.params, isDisabled: this.state.busy })] });
    };
    TransformControlBase.prototype.render = function () {
        // console.log('rendering', ((this.props as any)?.transform?.transformer || (this.props as any)?.action)?.definition.display.name, +new Date)
        return this.props.simpleApply ? this.renderSimple() : this.renderDefault();
    };
    return TransformControlBase;
}(PurePluginUIComponent));
