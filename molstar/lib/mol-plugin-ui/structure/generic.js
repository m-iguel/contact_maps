import { __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { PluginCommands } from '../../mol-plugin/commands';
import { State } from '../../mol-state';
import { PurePluginUIComponent } from '../base';
import { IconButton } from '../controls/common';
import { UpdateTransformControl } from '../state/update-transform';
import { VisibilityOffOutlinedSvg, VisibilityOutlinedSvg, MoreHorizSvg } from '../controls/icons';
var GenericEntryListControls = /** @class */ (function (_super) {
    __extends(GenericEntryListControls, _super);
    function GenericEntryListControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(GenericEntryListControls.prototype, "current", {
        get: function () {
            return this.plugin.managers.structure.hierarchy.behaviors.selection;
        },
        enumerable: false,
        configurable: true
    });
    GenericEntryListControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.current, function () { return _this.forceUpdate(); });
    };
    Object.defineProperty(GenericEntryListControls.prototype, "unitcell", {
        get: function () {
            var _a;
            var selection = this.plugin.managers.structure.hierarchy.selection;
            if (selection.structures.length === 0)
                return null;
            var refs = [];
            for (var _i = 0, _b = selection.structures; _i < _b.length; _i++) {
                var s = _b[_i];
                var model = s.model;
                if ((model === null || model === void 0 ? void 0 : model.unitcell) && ((_a = model.unitcell) === null || _a === void 0 ? void 0 : _a.cell.obj))
                    refs.push(model.unitcell);
            }
            if (refs.length === 0)
                return null;
            return _jsx(GenericEntry, { refs: refs, labelMultiple: 'Unit Cells' });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GenericEntryListControls.prototype, "customControls", {
        get: function () {
            var _this = this;
            var controls = [];
            this.plugin.genericRepresentationControls.forEach(function (provider, key) {
                var _a = provider(_this.plugin.managers.structure.hierarchy.selection), refs = _a[0], labelMultiple = _a[1];
                if (refs.length > 0) {
                    controls.push(_jsx("div", { children: _jsx(GenericEntry, { refs: refs, labelMultiple: labelMultiple }) }, key));
                }
            });
            return controls.length > 0 ? controls : null;
        },
        enumerable: false,
        configurable: true
    });
    GenericEntryListControls.prototype.render = function () {
        return _jsx(_Fragment, { children: _jsxs("div", { style: { marginTop: '6px' }, children: [this.unitcell, this.customControls] }) });
    };
    return GenericEntryListControls;
}(PurePluginUIComponent));
export { GenericEntryListControls };
var GenericEntry = /** @class */ (function (_super) {
    __extends(GenericEntry, _super);
    function GenericEntry() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { showOptions: false };
        _this.toggleVisibility = function (e) {
            e.preventDefault();
            _this.plugin.managers.structure.hierarchy.toggleVisibility(_this.props.refs);
            e.currentTarget.blur();
        };
        _this.highlight = function (e) {
            e.preventDefault();
            if (!_this.pivot.cell.parent)
                return;
            PluginCommands.Interactivity.Object.Highlight(_this.plugin, {
                state: _this.pivot.cell.parent,
                ref: _this.props.refs.map(function (c) { return c.cell.transform.ref; })
            });
        };
        _this.clearHighlight = function (e) {
            e.preventDefault();
            PluginCommands.Interactivity.ClearHighlights(_this.plugin);
        };
        _this.focus = function (e) {
            var _a;
            e.preventDefault();
            var allHidden = true;
            for (var _i = 0, _b = _this.props.refs; _i < _b.length; _i++) {
                var uc = _b[_i];
                if (!uc.cell.state.isHidden) {
                    allHidden = false;
                    break;
                }
            }
            if (allHidden) {
                _this.plugin.managers.structure.hierarchy.toggleVisibility(_this.props.refs, 'show');
            }
            var loci = [];
            for (var _c = 0, _d = _this.props.refs; _c < _d.length; _c++) {
                var uc = _d[_c];
                if (uc.cell.state.isHidden) {
                    continue;
                }
                var l = (_a = uc.cell.obj) === null || _a === void 0 ? void 0 : _a.data.repr.getLoci();
                if (l)
                    loci.push(l);
            }
            _this.plugin.managers.camera.focusLoci(loci);
        };
        _this.toggleOptions = function () { return _this.setState({ showOptions: !_this.state.showOptions }); };
        return _this;
    }
    GenericEntry.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.events.cell.stateUpdated, function (e) {
            var _a;
            if (State.ObjectEvent.isCell(e, (_a = _this.pivot) === null || _a === void 0 ? void 0 : _a.cell))
                _this.forceUpdate();
        });
    };
    Object.defineProperty(GenericEntry.prototype, "pivot", {
        get: function () { return this.props.refs[0]; },
        enumerable: false,
        configurable: true
    });
    GenericEntry.prototype.render = function () {
        var _a = this.props, refs = _a.refs, labelMultiple = _a.labelMultiple;
        if (refs.length === 0)
            return null;
        var pivot = refs[0];
        var label, description;
        if (refs.length === 1) {
            var obj = pivot.cell.obj;
            if (!obj)
                return null;
            label = obj === null || obj === void 0 ? void 0 : obj.label;
            description = obj === null || obj === void 0 ? void 0 : obj.description;
        }
        else {
            label = "".concat(refs.length, " ").concat(labelMultiple || 'Objects');
        }
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsxs("button", { className: 'msp-form-control msp-control-button-label', title: "".concat(label, ". Click to focus."), onClick: this.focus, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: { textAlign: 'left' }, children: [label, " ", _jsx("small", { children: description })] }), _jsx(IconButton, { svg: pivot.cell.state.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, className: 'msp-form-control', onClick: this.toggleVisibility, title: "".concat(pivot.cell.state.isHidden ? 'Show' : 'Hide'), small: true, flex: true }), refs.length === 1 && _jsx(IconButton, { svg: MoreHorizSvg, className: 'msp-form-control', onClick: this.toggleOptions, title: 'Options', toggleState: this.state.showOptions, flex: true })] }), (refs.length === 1 && this.state.showOptions && pivot.cell.parent) && _jsx(_Fragment, { children: _jsx("div", { className: 'msp-control-offset', children: _jsx(UpdateTransformControl, { state: pivot.cell.parent, transform: pivot.cell.transform, customHeader: 'none', autoHideApply: true }) }) })] });
    };
    return GenericEntry;
}(PurePluginUIComponent));
export { GenericEntry };
