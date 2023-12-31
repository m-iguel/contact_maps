import { __extends, __spreadArray } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { getStructureThemeTypes } from '../../mol-plugin-state/helpers/structure-representation-params';
import { StructureComponentManager } from '../../mol-plugin-state/manager/structure/component';
import { StructureHierarchyManager } from '../../mol-plugin-state/manager/structure/hierarchy';
import { PluginCommands } from '../../mol-plugin/commands';
import { State } from '../../mol-state';
import { ParamDefinition } from '../../mol-util/param-definition';
import { CollapsableControls, PurePluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, ExpandGroup, IconButton, ToggleButton, ControlRow, TextInput } from '../controls/common';
import { CubeOutlineSvg, IntersectSvg, SetSvg, SubtractSvg, UnionSvg, BookmarksOutlinedSvg, AddSvg, TuneSvg, RestoreSvg, VisibilityOffOutlinedSvg, VisibilityOutlinedSvg, DeleteOutlinedSvg, MoreHorizSvg, CheckSvg } from '../controls/icons';
import { ParameterControls } from '../controls/parameters';
import { UpdateTransformControl } from '../state/update-transform';
import { GenericEntryListControls } from './generic';
var StructureComponentControls = /** @class */ (function (_super) {
    __extends(StructureComponentControls, _super);
    function StructureComponentControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StructureComponentControls.prototype.defaultState = function () {
        return {
            header: 'Components',
            isCollapsed: false,
            isDisabled: false,
            brand: { accent: 'blue', svg: CubeOutlineSvg }
        };
    };
    StructureComponentControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, function (c) { return _this.setState({
            description: StructureHierarchyManager.getSelectedStructuresDescription(_this.plugin)
        }); });
    };
    StructureComponentControls.prototype.renderControls = function () {
        return _jsxs(_Fragment, { children: [_jsx(ComponentEditorControls, {}), _jsx(ComponentListControls, {}), _jsx(GenericEntryListControls, {})] });
    };
    return StructureComponentControls;
}(CollapsableControls));
export { StructureComponentControls };
var ComponentEditorControls = /** @class */ (function (_super) {
    __extends(ComponentEditorControls, _super);
    function ComponentEditorControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isEmpty: true,
            isBusy: false,
            canUndo: false
        };
        _this.togglePreset = _this.toggleAction('preset');
        _this.toggleAdd = _this.toggleAction('add');
        _this.toggleOptions = _this.toggleAction('options');
        _this.hideAction = function () { return _this.setState({ action: void 0 }); };
        _this.applyPreset = function (item) {
            _this.hideAction();
            if (!item)
                return;
            var mng = _this.plugin.managers.structure;
            var structures = mng.hierarchy.selection.structures;
            if (item.value === null)
                mng.component.clear(structures);
            else
                mng.component.applyPreset(structures, item.value);
        };
        _this.undo = function () {
            var task = _this.plugin.state.data.undo();
            if (task)
                _this.plugin.runTask(task);
        };
        return _this;
    }
    Object.defineProperty(ComponentEditorControls.prototype, "isDisabled", {
        get: function () {
            return this.state.isBusy || this.state.isEmpty;
        },
        enumerable: false,
        configurable: true
    });
    ComponentEditorControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, function (c) { return _this.setState({
            action: _this.state.action !== 'options' || c.structures.length === 0 ? void 0 : 'options',
            isEmpty: c.structures.length === 0
        }); });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (v) {
            _this.setState({ isBusy: v, action: _this.state.action !== 'options' ? void 0 : 'options' });
        });
        this.subscribe(this.plugin.state.data.events.historyUpdated, function (_a) {
            var state = _a.state;
            _this.setState({ canUndo: state.canUndo });
        });
    };
    ComponentEditorControls.prototype.toggleAction = function (action) {
        var _this = this;
        return function () { return _this.setState({ action: _this.state.action === action ? void 0 : action }); };
    };
    Object.defineProperty(ComponentEditorControls.prototype, "presetControls", {
        get: function () {
            return _jsx(ActionMenu, { items: this.presetActions, onSelect: this.applyPreset });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ComponentEditorControls.prototype, "presetActions", {
        get: function () {
            var pivot = this.plugin.managers.structure.component.pivotStructure;
            var providers = this.plugin.builders.structure.representation.getPresets(pivot === null || pivot === void 0 ? void 0 : pivot.cell.obj);
            return ActionMenu.createItems(providers, { label: function (p) { return p.display.name; }, category: function (p) { return p.display.group; }, description: function (p) { return p.display.description; } });
        },
        enumerable: false,
        configurable: true
    });
    ComponentEditorControls.prototype.render = function () {
        var undoTitle = this.state.canUndo
            ? "Undo ".concat(this.plugin.state.data.latestUndoLabel)
            : 'Some mistakes of the past can be undone.';
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsx(ToggleButton, { icon: BookmarksOutlinedSvg, label: 'Preset', title: 'Apply a representation preset for the current structure(s).', toggle: this.togglePreset, isSelected: this.state.action === 'preset', disabled: this.isDisabled }), _jsx(ToggleButton, { icon: AddSvg, label: 'Add', title: 'Add a new representation component for a selection.', toggle: this.toggleAdd, isSelected: this.state.action === 'add', disabled: this.isDisabled }), _jsx(ToggleButton, { icon: TuneSvg, label: '', title: 'Options that are applied to all applicable representations.', style: { flex: '0 0 40px', padding: 0 }, toggle: this.toggleOptions, isSelected: this.state.action === 'options', disabled: this.isDisabled }), _jsx(IconButton, { svg: RestoreSvg, className: 'msp-flex-item', flex: '40px', onClick: this.undo, disabled: !this.state.canUndo || this.isDisabled, title: undoTitle })] }), this.state.action === 'preset' && this.presetControls, this.state.action === 'add' && _jsx("div", { className: 'msp-control-offset', children: _jsx(AddComponentControls, { onApply: this.hideAction }) }), this.state.action === 'options' && _jsx("div", { className: 'msp-control-offset', children: _jsx(ComponentOptionsControls, { isDisabled: this.isDisabled }) })] });
    };
    return ComponentEditorControls;
}(PurePluginUIComponent));
var AddComponentControls = /** @class */ (function (_super) {
    __extends(AddComponentControls, _super);
    function AddComponentControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = _this.createState();
        _this.apply = function () {
            var structures = _this.props.forSelection ? _this.currentStructures : _this.selectedStructures;
            _this.props.onApply();
            _this.plugin.managers.structure.component.add(_this.state.values, structures);
        };
        _this.paramsChanged = function (values) { return _this.setState({ values: values }); };
        return _this;
    }
    AddComponentControls.prototype.createState = function () {
        var params = StructureComponentManager.getAddParams(this.plugin);
        return { params: params, values: ParamDefinition.getDefaultValues(params) };
    };
    Object.defineProperty(AddComponentControls.prototype, "selectedStructures", {
        get: function () {
            return this.plugin.managers.structure.component.currentStructures;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AddComponentControls.prototype, "currentStructures", {
        get: function () {
            return this.plugin.managers.structure.hierarchy.current.structures;
        },
        enumerable: false,
        configurable: true
    });
    AddComponentControls.prototype.render = function () {
        return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: this.state.params, values: this.state.values, onChangeValues: this.paramsChanged }), _jsx(Button, { icon: AddSvg, title: 'Use Selection and optional Representation to create a new Component.', className: 'msp-btn-commit msp-btn-commit-on', onClick: this.apply, style: { marginTop: '1px' }, children: "Create Component" })] });
    };
    return AddComponentControls;
}(PurePluginUIComponent));
export { AddComponentControls };
var ComponentOptionsControls = /** @class */ (function (_super) {
    __extends(ComponentOptionsControls, _super);
    function ComponentOptionsControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.update = function (options) { return _this.plugin.managers.structure.component.setOptions(options); };
        return _this;
    }
    ComponentOptionsControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.component.events.optionsUpdated, function () { return _this.forceUpdate(); });
    };
    ComponentOptionsControls.prototype.render = function () {
        return _jsx(ParameterControls, { params: StructureComponentManager.OptionsParams, values: this.plugin.managers.structure.component.state.options, onChangeValues: this.update, isDisabled: this.props.isDisabled });
    };
    return ComponentOptionsControls;
}(PurePluginUIComponent));
var ComponentListControls = /** @class */ (function (_super) {
    __extends(ComponentListControls, _super);
    function ComponentListControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComponentListControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, function () {
            _this.forceUpdate();
        });
    };
    ComponentListControls.prototype.render = function () {
        var componentGroups = this.plugin.managers.structure.hierarchy.currentComponentGroups;
        if (componentGroups.length === 0)
            return null;
        return _jsx("div", { style: { marginTop: '6px' }, children: componentGroups.map(function (g) { return _jsx(StructureComponentGroup, { group: g }, g[0].cell.transform.ref); }) });
    };
    return ComponentListControls;
}(PurePluginUIComponent));
var StructureComponentGroup = /** @class */ (function (_super) {
    __extends(StructureComponentGroup, _super);
    function StructureComponentGroup() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { action: void 0 };
        _this.toggleVisible = function (e) {
            e.preventDefault();
            e.currentTarget.blur();
            _this.plugin.managers.structure.component.toggleVisibility(_this.props.group);
        };
        _this.selectAction = function (item) {
            if (!item)
                return;
            (item === null || item === void 0 ? void 0 : item.value)();
        };
        _this.remove = function () { return _this.plugin.managers.structure.hierarchy.remove(_this.props.group, true); };
        _this.toggleAction = function () { return _this.setState({ action: _this.state.action === 'action' ? void 0 : 'action' }); };
        _this.toggleLabel = function () { return _this.setState({ action: _this.state.action === 'label' ? void 0 : 'label' }); };
        _this.highlight = function (e) {
            e.preventDefault();
            if (!_this.props.group[0].cell.parent)
                return;
            PluginCommands.Interactivity.Object.Highlight(_this.plugin, { state: _this.props.group[0].cell.parent, ref: _this.props.group.map(function (c) { return c.cell.transform.ref; }) });
        };
        _this.clearHighlight = function (e) {
            e.preventDefault();
            PluginCommands.Interactivity.ClearHighlights(_this.plugin);
        };
        _this.focus = function () {
            var allHidden = true;
            for (var _i = 0, _a = _this.props.group; _i < _a.length; _i++) {
                var c = _a[_i];
                if (!c.cell.state.isHidden) {
                    allHidden = false;
                    break;
                }
            }
            if (allHidden) {
                _this.plugin.managers.structure.hierarchy.toggleVisibility(_this.props.group, 'show');
            }
            _this.plugin.managers.camera.focusSpheres(_this.props.group, function (e) {
                var _a;
                if (e.cell.state.isHidden)
                    return;
                return (_a = e.cell.obj) === null || _a === void 0 ? void 0 : _a.data.boundary.sphere;
            });
        };
        _this.updateLabel = function (v) {
            _this.plugin.managers.structure.component.updateLabel(_this.pivot, v);
        };
        return _this;
    }
    Object.defineProperty(StructureComponentGroup.prototype, "pivot", {
        get: function () {
            return this.props.group[0];
        },
        enumerable: false,
        configurable: true
    });
    StructureComponentGroup.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.events.cell.stateUpdated, function (e) {
            if (State.ObjectEvent.isCell(e, _this.pivot.cell))
                _this.forceUpdate();
        });
    };
    Object.defineProperty(StructureComponentGroup.prototype, "colorByActions", {
        get: function () {
            var _this = this;
            var _a, _b;
            var mng = this.plugin.managers.structure.component;
            var repr = this.pivot.representations[0];
            var name = (_a = repr.cell.transform.params) === null || _a === void 0 ? void 0 : _a.colorTheme.name;
            var themes = getStructureThemeTypes(this.plugin, (_b = this.pivot.cell.obj) === null || _b === void 0 ? void 0 : _b.data);
            return ActionMenu.createItemsFromSelectOptions(themes, {
                value: function (o) { return function () { return mng.updateRepresentationsTheme(_this.props.group, { color: o[0] }); }; },
                selected: function (o) { return o[0] === name; }
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureComponentGroup.prototype, "actions", {
        get: function () {
            var _this = this;
            var mng = this.plugin.managers.structure.component;
            var ret = [
                __spreadArray([
                    ActionMenu.Header('Add Representation')
                ], StructureComponentManager.getRepresentationTypes(this.plugin, this.props.group[0])
                    .map(function (t) { return ActionMenu.Item(t[1], function () { return mng.addRepresentation(_this.props.group, t[0]); }); }), true)
            ];
            if (this.pivot.representations.length > 0) {
                ret.push(__spreadArray([
                    ActionMenu.Header('Set Coloring', { isIndependent: true })
                ], this.colorByActions, true));
            }
            if (mng.canBeModified(this.props.group[0])) {
                ret.push([
                    ActionMenu.Header('Modify by Selection'),
                    ActionMenu.Item('Include', function () { return mng.modifyByCurrentSelection(_this.props.group, 'union'); }, { icon: UnionSvg }),
                    ActionMenu.Item('Subtract', function () { return mng.modifyByCurrentSelection(_this.props.group, 'subtract'); }, { icon: SubtractSvg }),
                    ActionMenu.Item('Intersect', function () { return mng.modifyByCurrentSelection(_this.props.group, 'intersect'); }, { icon: IntersectSvg })
                ]);
            }
            ret.push(ActionMenu.Item('Select This', function () { return mng.selectThis(_this.props.group); }, { icon: SetSvg }));
            if (mng.canBeModified(this.props.group[0])) {
                ret.push(ActionMenu.Item('Edit Label', this.toggleLabel));
            }
            return ret;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureComponentGroup.prototype, "reprLabel", {
        get: function () {
            var _a;
            // TODO: handle generic reprs.
            var pivot = this.pivot;
            if (pivot.representations.length === 0)
                return 'No repr.';
            if (pivot.representations.length === 1)
                return (_a = pivot.representations[0].cell.obj) === null || _a === void 0 ? void 0 : _a.label;
            return "".concat(pivot.representations.length, " reprs");
        },
        enumerable: false,
        configurable: true
    });
    StructureComponentGroup.prototype.render = function () {
        var _this = this;
        var _a;
        var component = this.pivot;
        var cell = component.cell;
        var label = (_a = cell.obj) === null || _a === void 0 ? void 0 : _a.label;
        var reprLabel = this.reprLabel;
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsxs(Button, { noOverflow: true, className: 'msp-control-button-label', title: "".concat(label, ". Click to focus."), onClick: this.focus, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: { textAlign: 'left' }, children: [label, _jsx("small", { className: 'msp-25-lower-contrast-text', style: { float: 'right' }, children: reprLabel })] }), _jsx(IconButton, { svg: cell.state.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, onClick: this.toggleVisible, title: "".concat(cell.state.isHidden ? 'Show' : 'Hide', " component"), small: true, className: 'msp-form-control', flex: true }), _jsx(IconButton, { svg: DeleteOutlinedSvg, toggleState: false, onClick: this.remove, title: 'Remove', small: true, className: 'msp-form-control', flex: true }), _jsx(IconButton, { svg: MoreHorizSvg, onClick: this.toggleAction, title: 'Actions', toggleState: this.state.action === 'action', className: 'msp-form-control', flex: true })] }), this.state.action === 'label' && _jsx("div", { className: 'msp-control-offset', style: { marginBottom: '6px' }, children: _jsx(ControlRow, { label: 'Label', control: _jsxs("div", { style: { display: 'flex', textAlignLast: 'center' }, children: [_jsx(TextInput, { onChange: this.updateLabel, value: label, style: { flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', blurOnEnter: true, blurOnEscape: true }), _jsx(IconButton, { svg: CheckSvg, onClick: this.toggleLabel, className: 'msp-form-control msp-control-button-label', flex: true })] }) }) }), this.state.action === 'action' && _jsxs("div", { className: 'msp-accent-offset', children: [_jsx("div", { style: { marginBottom: '6px' }, children: _jsx(ActionMenu, { items: this.actions, onSelect: this.selectAction, noOffset: true }) }), _jsx("div", { style: { marginBottom: '6px' }, children: component.representations.map(function (r) { return _jsx(StructureRepresentationEntry, { group: _this.props.group, representation: r }, r.cell.transform.ref); }) })] })] });
    };
    return StructureComponentGroup;
}(PurePluginUIComponent));
var StructureRepresentationEntry = /** @class */ (function (_super) {
    __extends(StructureRepresentationEntry, _super);
    function StructureRepresentationEntry() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.remove = function () { return _this.plugin.managers.structure.component.removeRepresentations(_this.props.group, _this.props.representation); };
        _this.toggleVisible = function (e) {
            e.preventDefault();
            e.currentTarget.blur();
            _this.plugin.managers.structure.component.toggleVisibility(_this.props.group, _this.props.representation);
        };
        _this.update = function (params) { return _this.plugin.managers.structure.component.updateRepresentations(_this.props.group, _this.props.representation, params); };
        return _this;
    }
    StructureRepresentationEntry.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.events.cell.stateUpdated, function (e) {
            if (State.ObjectEvent.isCell(e, _this.props.representation.cell))
                _this.forceUpdate();
        });
    };
    StructureRepresentationEntry.prototype.render = function () {
        var _a;
        var repr = this.props.representation.cell;
        return _jsxs("div", { className: 'msp-representation-entry', children: [repr.parent && _jsx(ExpandGroup, { header: "".concat(((_a = repr.obj) === null || _a === void 0 ? void 0 : _a.label) || '', " Representation"), noOffset: true, children: _jsx(UpdateTransformControl, { state: repr.parent, transform: repr.transform, customHeader: 'none', customUpdate: this.update, noMargin: true }) }), _jsx(IconButton, { svg: DeleteOutlinedSvg, onClick: this.remove, title: 'Remove', small: true, className: 'msp-default-bg', toggleState: false, style: {
                        position: 'absolute', top: 0, right: '32px', lineHeight: '24px', height: '24px', textAlign: 'right', width: '44px', paddingRight: '6px', background: 'none'
                    } }), _jsx(IconButton, { svg: this.props.representation.cell.state.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, onClick: this.toggleVisible, title: 'Toggle Visibility', small: true, className: 'msp-default-bg', style: {
                        position: 'absolute', top: 0, right: 0, lineHeight: '24px', height: '24px', textAlign: 'right', width: '32px', paddingRight: '6px', background: 'none'
                    } })] });
    };
    return StructureRepresentationEntry;
}(PurePluginUIComponent));
