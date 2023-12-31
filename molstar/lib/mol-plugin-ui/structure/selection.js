import { __extends, __spreadArray } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Jason Pattle <jpattle.exscientia.co.uk>
 */
import * as React from 'react';
import { getElementQueries, getNonStandardResidueQueries, getPolymerAndBranchedEntityQueries, StructureSelectionQueries } from '../../mol-plugin-state/helpers/structure-selection-query';
import { InteractivityManager } from '../../mol-plugin-state/manager/interactivity';
import { StructureComponentManager } from '../../mol-plugin-state/manager/structure/component';
import { PluginConfig } from '../../mol-plugin/config';
import { compileIdListSelection } from '../../mol-script/util/id-list';
import { memoizeLatest } from '../../mol-util/memoize';
import { ParamDefinition } from '../../mol-util/param-definition';
import { capitalize, stripTags } from '../../mol-util/string';
import { PluginUIComponent, PurePluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, ControlGroup, IconButton, ToggleButton } from '../controls/common';
import { BrushSvg, CancelOutlinedSvg, CloseSvg, CubeOutlineSvg, HelpOutlineSvg, Icon, IntersectSvg, RemoveSvg, RestoreSvg, SelectionModeSvg, SetSvg, SubtractSvg, UnionSvg } from '../controls/icons';
import { ParameterControls, PureSelectControl } from '../controls/parameters';
import { HelpGroup, HelpText, ViewportHelpContent } from '../viewport/help';
import { AddComponentControls } from './components';
var ToggleSelectionModeButton = /** @class */ (function (_super) {
    __extends(ToggleSelectionModeButton, _super);
    function ToggleSelectionModeButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._toggleSelMode = function () {
            _this.plugin.selectionMode = !_this.plugin.selectionMode;
        };
        return _this;
    }
    ToggleSelectionModeButton.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, function () { return _this.forceUpdate(); });
        this.subscribe(this.plugin.layout.events.updated, function () { return _this.forceUpdate(); });
        this.subscribe(this.plugin.behaviors.interaction.selectionMode, function () { return _this.forceUpdate(); });
    };
    ToggleSelectionModeButton.prototype.render = function () {
        var style = this.props.inline
            ? { background: 'transparent', width: 'auto', height: 'auto', lineHeight: 'unset' }
            : { background: 'transparent' };
        return _jsx(IconButton, { svg: SelectionModeSvg, onClick: this._toggleSelMode, title: 'Toggle Selection Mode', style: style, toggleState: this.plugin.selectionMode });
    };
    return ToggleSelectionModeButton;
}(PurePluginUIComponent));
export { ToggleSelectionModeButton };
var StructureSelectionParams = {
    granularity: InteractivityManager.Params.granularity,
};
var ActionHeader = new Map([
    ['add', 'Add/Union Selection'],
    ['remove', 'Remove/Subtract Selection'],
    ['intersect', 'Intersect Selection'],
    ['set', 'Set Selection']
]);
var StructureSelectionActionsControls = /** @class */ (function (_super) {
    __extends(StructureSelectionActionsControls, _super);
    function StructureSelectionActionsControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            action: void 0,
            helper: void 0,
            isEmpty: true,
            isBusy: false,
            canUndo: false,
        };
        _this.set = function (modifier, selectionQuery) {
            _this.plugin.managers.structure.selection.fromSelectionQuery(modifier, selectionQuery, false);
        };
        _this.selectQuery = function (item, e) {
            if (!item || !_this.state.action) {
                _this.setState({ action: void 0 });
                return;
            }
            var q = _this.state.action;
            if (e === null || e === void 0 ? void 0 : e.shiftKey) {
                _this.set(q, item.value);
            }
            else {
                _this.setState({ action: void 0 }, function () {
                    _this.set(q, item.value);
                });
            }
        };
        _this.selectHelper = function (item, e) {
            console.log(item);
            if (!item || !_this.state.action) {
                _this.setState({ action: void 0, helper: void 0 });
                return;
            }
            _this.setState({ helper: item.value.kind });
        };
        _this.queriesItems = [];
        _this.queriesVersion = -1;
        _this.helpersItems = void 0;
        _this.toggleAdd = _this.showAction('add');
        _this.toggleRemove = _this.showAction('remove');
        _this.toggleIntersect = _this.showAction('intersect');
        _this.toggleSet = _this.showAction('set');
        _this.toggleTheme = _this.showAction('theme');
        _this.toggleAddComponent = _this.showAction('add-component');
        _this.toggleHelp = _this.showAction('help');
        _this.setGranuality = function (_a) {
            var value = _a.value;
            _this.plugin.managers.interactivity.setProps({ granularity: value });
        };
        _this.turnOff = function () { return _this.plugin.selectionMode = false; };
        _this.undo = function () {
            var task = _this.plugin.state.data.undo();
            if (task)
                _this.plugin.runTask(task);
        };
        _this.subtract = function () {
            var sel = _this.plugin.managers.structure.hierarchy.getStructuresWithSelection();
            var components = [];
            for (var _i = 0, sel_1 = sel; _i < sel_1.length; _i++) {
                var s = sel_1[_i];
                components.push.apply(components, s.components);
            }
            if (components.length === 0)
                return;
            _this.plugin.managers.structure.component.modifyByCurrentSelection(components, 'subtract');
        };
        return _this;
    }
    StructureSelectionActionsControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, function (c) {
            var isEmpty = c.hierarchy.structures.length === 0;
            if (_this.state.isEmpty !== isEmpty) {
                _this.setState({ isEmpty: isEmpty });
            }
            // trigger elementQueries and nonStandardResidueQueries recalculation
            _this.queriesVersion = -1;
            _this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (v) {
            _this.setState({ isBusy: v, action: void 0 });
        });
        this.subscribe(this.plugin.managers.interactivity.events.propsUpdated, function () {
            _this.forceUpdate();
        });
        this.subscribe(this.plugin.state.data.events.historyUpdated, function (_a) {
            var state = _a.state;
            _this.setState({ canUndo: state.canUndo });
        });
    };
    Object.defineProperty(StructureSelectionActionsControls.prototype, "isDisabled", {
        get: function () {
            return this.state.isBusy || this.state.isEmpty;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureSelectionActionsControls.prototype, "structures", {
        get: function () {
            var _a;
            var structures = [];
            for (var _i = 0, _b = this.plugin.managers.structure.hierarchy.selection.structures; _i < _b.length; _i++) {
                var s = _b[_i];
                var structure = (_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
                if (structure)
                    structures.push(structure);
            }
            return structures;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureSelectionActionsControls.prototype, "queries", {
        get: function () {
            var registry = this.plugin.query.structure.registry;
            if (registry.version !== this.queriesVersion) {
                var structures = this.structures;
                var queries = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], registry.list, true), getPolymerAndBranchedEntityQueries(structures), true), getNonStandardResidueQueries(structures), true), getElementQueries(structures), true).sort(function (a, b) { return b.priority - a.priority; });
                this.queriesItems = ActionMenu.createItems(queries, {
                    filter: function (q) { return q !== StructureSelectionQueries.current && !q.isHidden; },
                    label: function (q) { return q.label; },
                    category: function (q) { return q.category; },
                    description: function (q) { return q.description; }
                });
                this.queriesVersion = registry.version;
            }
            return this.queriesItems;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureSelectionActionsControls.prototype, "helpers", {
        get: function () {
            if (this.helpersItems)
                return this.helpersItems;
            // TODO: this is an initial implementation of the helper UI
            //       the plan is to add support to input queries in different languages
            //       after this has been implemented in mol-script
            var helpers = [
                { kind: 'residue-list', category: 'Helpers', label: 'Atom/Residue Identifier List', description: 'Create a selection from a list of atom/residue ranges.' }
            ];
            this.helpersItems = ActionMenu.createItems(helpers, {
                label: function (q) { return q.label; },
                category: function (q) { return q.category; },
                description: function (q) { return q.description; }
            });
            return this.helpersItems;
        },
        enumerable: false,
        configurable: true
    });
    StructureSelectionActionsControls.prototype.showAction = function (q) {
        var _this = this;
        return function () { return _this.setState({ action: _this.state.action === q ? void 0 : q, helper: void 0 }); };
    };
    StructureSelectionActionsControls.prototype.render = function () {
        var _this = this;
        var granularity = this.plugin.managers.interactivity.props.granularity;
        var undoTitle = this.state.canUndo
            ? "Undo ".concat(this.plugin.state.data.latestUndoLabel)
            : 'Some mistakes of the past can be undone.';
        var children = void 0;
        if (this.state.action && !this.state.helper) {
            children = _jsxs(_Fragment, { children: [(this.state.action && this.state.action !== 'theme' && this.state.action !== 'add-component' && this.state.action !== 'help') && _jsxs("div", { className: 'msp-selection-viewport-controls-actions', children: [_jsx(ActionMenu, { header: ActionHeader.get(this.state.action), title: 'Click to close.', items: this.queries, onSelect: this.selectQuery, noOffset: true }), _jsx(ActionMenu, { items: this.helpers, onSelect: this.selectHelper, noOffset: true })] }), this.state.action === 'theme' && _jsx("div", { className: 'msp-selection-viewport-controls-actions', children: _jsx(ControlGroup, { header: 'Theme', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleTheme, topRightIcon: CloseSvg, children: _jsx(ApplyThemeControls, { onApply: this.toggleTheme }) }) }), this.state.action === 'add-component' && _jsx("div", { className: 'msp-selection-viewport-controls-actions', children: _jsx(ControlGroup, { header: 'Add Component', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleAddComponent, topRightIcon: CloseSvg, children: _jsx(AddComponentControls, { onApply: this.toggleAddComponent, forSelection: true }) }) }), this.state.action === 'help' && _jsx("div", { className: 'msp-selection-viewport-controls-actions', children: _jsxs(ControlGroup, { header: 'Help', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleHelp, topRightIcon: CloseSvg, maxHeight: '300px', children: [_jsx(HelpGroup, { header: 'Selection Operations', children: _jsxs(HelpText, { children: ["Use ", _jsx(Icon, { svg: UnionSvg, inline: true }), " ", _jsx(Icon, { svg: SubtractSvg, inline: true }), " ", _jsx(Icon, { svg: IntersectSvg, inline: true }), " ", _jsx(Icon, { svg: SetSvg, inline: true }), " to modify the selection."] }) }), _jsx(HelpGroup, { header: 'Representation Operations', children: _jsxs(HelpText, { children: ["Use ", _jsx(Icon, { svg: BrushSvg, inline: true }), " ", _jsx(Icon, { svg: CubeOutlineSvg, inline: true }), " ", _jsx(Icon, { svg: RemoveSvg, inline: true }), " ", _jsx(Icon, { svg: RestoreSvg, inline: true }), " to color, create components, remove from components, or undo actions."] }) }), _jsx(ViewportHelpContent, { selectOnly: true })] }) })] });
        }
        else if (ActionHeader.has(this.state.action) && this.state.helper === 'residue-list') {
            var close_1 = function () { return _this.setState({ action: void 0, helper: void 0 }); };
            children = _jsx("div", { className: 'msp-selection-viewport-controls-actions', children: _jsx(ControlGroup, { header: 'Atom/Residue Identifier List', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: close_1, topRightIcon: CloseSvg, children: _jsx(ResidueListSelectionHelper, { modifier: this.state.action, plugin: this.plugin, close: close_1 }) }) });
        }
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', style: { background: 'none' }, children: [_jsx(PureSelectControl, { title: "Picking Level for selecting and highlighting", param: StructureSelectionParams.granularity, name: 'granularity', value: granularity, onChange: this.setGranuality, isDisabled: this.isDisabled }), _jsx(ToggleButton, { icon: UnionSvg, title: "".concat(ActionHeader.get('add'), ". Hold shift key to keep menu open."), toggle: this.toggleAdd, isSelected: this.state.action === 'add', disabled: this.isDisabled }), _jsx(ToggleButton, { icon: SubtractSvg, title: "".concat(ActionHeader.get('remove'), ". Hold shift key to keep menu open."), toggle: this.toggleRemove, isSelected: this.state.action === 'remove', disabled: this.isDisabled }), _jsx(ToggleButton, { icon: IntersectSvg, title: "".concat(ActionHeader.get('intersect'), ". Hold shift key to keep menu open."), toggle: this.toggleIntersect, isSelected: this.state.action === 'intersect', disabled: this.isDisabled }), _jsx(ToggleButton, { icon: SetSvg, title: "".concat(ActionHeader.get('set'), ". Hold shift key to keep menu open."), toggle: this.toggleSet, isSelected: this.state.action === 'set', disabled: this.isDisabled }), _jsx(ToggleButton, { icon: BrushSvg, title: 'Apply Theme to Selection', toggle: this.toggleTheme, isSelected: this.state.action === 'theme', disabled: this.isDisabled, style: { marginLeft: '10px' } }), _jsx(ToggleButton, { icon: CubeOutlineSvg, title: 'Create Component of Selection with Representation', toggle: this.toggleAddComponent, isSelected: this.state.action === 'add-component', disabled: this.isDisabled }), _jsx(IconButton, { svg: RemoveSvg, title: 'Remove/subtract Selection from all Components', onClick: this.subtract, disabled: this.isDisabled }), _jsx(IconButton, { svg: RestoreSvg, onClick: this.undo, disabled: !this.state.canUndo || this.isDisabled, title: undoTitle }), _jsx(ToggleButton, { icon: HelpOutlineSvg, title: 'Show/hide help', toggle: this.toggleHelp, style: { marginLeft: '10px' }, isSelected: this.state.action === 'help' }), this.plugin.config.get(PluginConfig.Viewport.ShowSelectionMode) && (_jsx(IconButton, { svg: CancelOutlinedSvg, title: 'Turn selection mode off', onClick: this.turnOff }))] }), children] });
    };
    return StructureSelectionActionsControls;
}(PluginUIComponent));
export { StructureSelectionActionsControls };
var StructureSelectionStatsControls = /** @class */ (function (_super) {
    __extends(StructureSelectionStatsControls, _super);
    function StructureSelectionStatsControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isEmpty: true,
            isBusy: false
        };
        _this.clear = function () { return _this.plugin.managers.interactivity.lociSelects.deselectAll(); };
        _this.focus = function () {
            if (_this.plugin.managers.structure.selection.stats.elementCount === 0)
                return;
            var sphere = _this.plugin.managers.structure.selection.getBoundary().sphere;
            _this.plugin.managers.camera.focusSphere(sphere);
        };
        _this.highlight = function (e) {
            _this.plugin.managers.interactivity.lociHighlights.clearHighlights();
            _this.plugin.managers.structure.selection.entries.forEach(function (e) {
                _this.plugin.managers.interactivity.lociHighlights.highlight({ loci: e.selection }, false);
            });
        };
        _this.clearHighlight = function () {
            _this.plugin.managers.interactivity.lociHighlights.clearHighlights();
        };
        return _this;
    }
    StructureSelectionStatsControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.selection.events.changed, function () {
            _this.forceUpdate();
        });
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, function (c) {
            var isEmpty = c.structures.length === 0;
            if (_this.state.isEmpty !== isEmpty) {
                _this.setState({ isEmpty: isEmpty });
            }
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (v) {
            _this.setState({ isBusy: v });
        });
    };
    Object.defineProperty(StructureSelectionStatsControls.prototype, "isDisabled", {
        get: function () {
            return this.state.isBusy || this.state.isEmpty;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureSelectionStatsControls.prototype, "stats", {
        get: function () {
            var stats = this.plugin.managers.structure.selection.stats;
            if (stats.structureCount === 0 || stats.elementCount === 0) {
                return 'Nothing Selected';
            }
            else {
                return "".concat(stripTags(stats.label), " Selected");
            }
        },
        enumerable: false,
        configurable: true
    });
    StructureSelectionStatsControls.prototype.render = function () {
        var stats = this.plugin.managers.structure.selection.stats;
        var empty = stats.structureCount === 0 || stats.elementCount === 0;
        if (empty && this.props.hideOnEmpty)
            return null;
        return _jsx(_Fragment, { children: _jsxs("div", { className: 'msp-flex-row', children: [_jsx(Button, { noOverflow: true, onClick: this.focus, title: 'Click to Focus Selection', disabled: empty, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: { textAlignLast: !empty ? 'left' : void 0 }, children: this.stats }), !empty && _jsx(IconButton, { svg: CancelOutlinedSvg, onClick: this.clear, title: 'Clear', className: 'msp-form-control', flex: true })] }) });
    };
    return StructureSelectionStatsControls;
}(PluginUIComponent));
export { StructureSelectionStatsControls };
var ApplyThemeControls = /** @class */ (function (_super) {
    __extends(ApplyThemeControls, _super);
    function ApplyThemeControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._params = memoizeLatest(function (pivot) { return StructureComponentManager.getThemeParams(_this.plugin, pivot); });
        _this.state = { values: ParamDefinition.getDefaultValues(_this.params) };
        _this.apply = function () {
            var _a, _b;
            _this.plugin.managers.structure.component.applyTheme(_this.state.values, _this.plugin.managers.structure.hierarchy.current.structures);
            (_b = (_a = _this.props).onApply) === null || _b === void 0 ? void 0 : _b.call(_a);
        };
        _this.paramsChanged = function (values) { return _this.setState({ values: values }); };
        return _this;
    }
    Object.defineProperty(ApplyThemeControls.prototype, "params", {
        get: function () { return this._params(this.plugin.managers.structure.component.pivotStructure); },
        enumerable: false,
        configurable: true
    });
    ApplyThemeControls.prototype.render = function () {
        return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: this.params, values: this.state.values, onChangeValues: this.paramsChanged }), _jsx(Button, { icon: BrushSvg, className: 'msp-btn-commit msp-btn-commit-on', onClick: this.apply, style: { marginTop: '1px' }, children: "Apply Theme" })] });
    };
    return ApplyThemeControls;
}(PurePluginUIComponent));
var ResidueListIdTypeParams = {
    idType: ParamDefinition.Select('auth', ParamDefinition.arrayToOptions(['auth', 'label', 'atom-id'])),
    identifiers: ParamDefinition.Text('', { description: 'A comma separated list of atom identifiers (e.g. 10, 15-25) or residue ranges in given chain (e.g. A 10-15, B 25, C 30:i)' })
};
var DefaultResidueListIdTypeParams = ParamDefinition.getDefaultValues(ResidueListIdTypeParams);
function ResidueListSelectionHelper(_a) {
    var modifier = _a.modifier, plugin = _a.plugin, close = _a.close;
    var _b = React.useState(DefaultResidueListIdTypeParams), state = _b[0], setState = _b[1];
    var apply = function () {
        if (state.identifiers.trim().length === 0)
            return;
        try {
            close();
            var query = compileIdListSelection(state.identifiers, state.idType);
            plugin.managers.structure.selection.fromCompiledQuery(modifier, query, false);
        }
        catch (e) {
            console.error(e);
            plugin.log.error('Failed to create selection');
        }
    };
    return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: ResidueListIdTypeParams, values: state, onChangeValues: setState, onEnter: apply }), _jsxs(Button, { className: 'msp-btn-commit msp-btn-commit-on', disabled: state.identifiers.trim().length === 0, onClick: apply, style: { marginTop: '1px' }, children: [capitalize(modifier), " Selection"] })] });
}
