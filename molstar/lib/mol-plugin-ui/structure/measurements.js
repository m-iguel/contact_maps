import { __extends } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Loci } from '../../mol-model/loci';
import { StructureMeasurementParams } from '../../mol-plugin-state/manager/structure/measurement';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { angleLabel, dihedralLabel, distanceLabel, lociLabel, structureElementLociLabelMany } from '../../mol-theme/label';
import { CollapsableControls, PurePluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, ExpandGroup, IconButton, ToggleButton } from '../controls/common';
import { AddSvg, ArrowDownwardSvg, ArrowUpwardSvg, DeleteOutlinedSvg, HelpOutlineSvg, Icon, MoreHorizSvg, PencilRulerSvg, SetSvg, TuneSvg, VisibilityOffOutlinedSvg, VisibilityOutlinedSvg } from '../controls/icons';
import { ParameterControls } from '../controls/parameters';
import { UpdateTransformControl } from '../state/update-transform';
import { ToggleSelectionModeButton } from './selection';
// TODO details, options (e.g. change text for labels)
var StructureMeasurementsControls = /** @class */ (function (_super) {
    __extends(StructureMeasurementsControls, _super);
    function StructureMeasurementsControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StructureMeasurementsControls.prototype.defaultState = function () {
        return {
            isCollapsed: false,
            header: 'Measurements',
            brand: { accent: 'gray', svg: PencilRulerSvg }
        };
    };
    StructureMeasurementsControls.prototype.renderControls = function () {
        return _jsxs(_Fragment, { children: [_jsx(MeasurementControls, {}), _jsx(MeasurementList, {})] });
    };
    return StructureMeasurementsControls;
}(CollapsableControls));
export { StructureMeasurementsControls };
var MeasurementList = /** @class */ (function (_super) {
    __extends(MeasurementList, _super);
    function MeasurementList() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MeasurementList.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.measurement.behaviors.state, function () {
            _this.forceUpdate();
        });
    };
    MeasurementList.prototype.renderGroup = function (cells, header) {
        var group = [];
        for (var _a = 0, cells_1 = cells; _a < cells_1.length; _a++) {
            var cell = cells_1[_a];
            if (cell.obj)
                group.push(_jsx(MeasurementEntry, { cell: cell }, cell.obj.id));
        }
        return group.length ? _jsx(ExpandGroup, { header: header, initiallyExpanded: true, children: group }) : null;
    };
    MeasurementList.prototype.render = function () {
        var measurements = this.plugin.managers.structure.measurement.state;
        return _jsxs("div", { style: { marginTop: '6px' }, children: [this.renderGroup(measurements.labels, 'Labels'), this.renderGroup(measurements.distances, 'Distances'), this.renderGroup(measurements.angles, 'Angles'), this.renderGroup(measurements.dihedrals, 'Dihedrals'), this.renderGroup(measurements.orientations, 'Orientations'), this.renderGroup(measurements.planes, 'Planes')] });
    };
    return MeasurementList;
}(PurePluginUIComponent));
export { MeasurementList };
var MeasurementControls = /** @class */ (function (_super) {
    __extends(MeasurementControls, _super);
    function MeasurementControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isBusy: false, action: void 0 };
        _this.measureDistance = function () {
            var loci = _this.plugin.managers.structure.selection.additionsHistory;
            _this.plugin.managers.structure.measurement.addDistance(loci[0].loci, loci[1].loci);
        };
        _this.measureAngle = function () {
            var loci = _this.plugin.managers.structure.selection.additionsHistory;
            _this.plugin.managers.structure.measurement.addAngle(loci[0].loci, loci[1].loci, loci[2].loci);
        };
        _this.measureDihedral = function () {
            var loci = _this.plugin.managers.structure.selection.additionsHistory;
            _this.plugin.managers.structure.measurement.addDihedral(loci[0].loci, loci[1].loci, loci[2].loci, loci[3].loci);
        };
        _this.addLabel = function () {
            var loci = _this.plugin.managers.structure.selection.additionsHistory;
            _this.plugin.managers.structure.measurement.addLabel(loci[0].loci);
        };
        _this.addOrientation = function () {
            var locis = [];
            _this.plugin.managers.structure.selection.entries.forEach(function (v) {
                locis.push(v.selection);
            });
            _this.plugin.managers.structure.measurement.addOrientation(locis);
        };
        _this.addPlane = function () {
            var locis = [];
            _this.plugin.managers.structure.selection.entries.forEach(function (v) {
                locis.push(v.selection);
            });
            _this.plugin.managers.structure.measurement.addPlane(locis);
        };
        _this.selectAction = function (item) {
            _this.toggleAdd();
            if (!item)
                return;
            (item === null || item === void 0 ? void 0 : item.value)();
        };
        _this.toggleAdd = function () { return _this.setState({ action: _this.state.action === 'add' ? void 0 : 'add' }); };
        _this.toggleOptions = function () { return _this.setState({ action: _this.state.action === 'options' ? void 0 : 'options' }); };
        return _this;
    }
    MeasurementControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.selection.events.additionsHistoryUpdated, function () {
            _this.forceUpdate();
            _this.updateOrderLabels();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (v) {
            _this.setState({ isBusy: v });
        });
    };
    MeasurementControls.prototype.componentWillUnmount = function () {
        this.clearOrderLabels();
        _super.prototype.componentWillUnmount.call(this);
    };
    MeasurementControls.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.state.action !== prevState.action)
            this.updateOrderLabels();
    };
    MeasurementControls.prototype.clearOrderLabels = function () {
        this.plugin.managers.structure.measurement.addOrderLabels([]);
    };
    MeasurementControls.prototype.updateOrderLabels = function () {
        if (this.state.action !== 'add') {
            this.clearOrderLabels();
            return;
        }
        var locis = [];
        var history = this.selection.additionsHistory;
        for (var idx = 0; idx < history.length && idx < 4; idx++)
            locis.push(history[idx].loci);
        this.plugin.managers.structure.measurement.addOrderLabels(locis);
    };
    Object.defineProperty(MeasurementControls.prototype, "selection", {
        get: function () {
            return this.plugin.managers.structure.selection;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeasurementControls.prototype, "actions", {
        get: function () {
            var history = this.selection.additionsHistory;
            var ret = [
                { kind: 'item', label: "Label ".concat(history.length === 0 ? ' (1 selection item required)' : ' (1st selection item)'), value: this.addLabel, disabled: history.length === 0 },
                { kind: 'item', label: "Distance ".concat(history.length < 2 ? ' (2 selection items required)' : ' (top 2 selection items)'), value: this.measureDistance, disabled: history.length < 2 },
                { kind: 'item', label: "Angle ".concat(history.length < 3 ? ' (3 selection items required)' : ' (top 3 items)'), value: this.measureAngle, disabled: history.length < 3 },
                { kind: 'item', label: "Dihedral ".concat(history.length < 4 ? ' (4 selection items required)' : ' (top 4 selection items)'), value: this.measureDihedral, disabled: history.length < 4 },
                { kind: 'item', label: "Orientation ".concat(history.length === 0 ? ' (selection required)' : ' (current selection)'), value: this.addOrientation, disabled: history.length === 0 },
                { kind: 'item', label: "Plane ".concat(history.length === 0 ? ' (selection required)' : ' (current selection)'), value: this.addPlane, disabled: history.length === 0 },
            ];
            return ret;
        },
        enumerable: false,
        configurable: true
    });
    MeasurementControls.prototype.highlight = function (loci) {
        this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: loci }, false);
    };
    MeasurementControls.prototype.moveHistory = function (e, direction) {
        this.plugin.managers.structure.selection.modifyHistory(e, direction, 4);
    };
    MeasurementControls.prototype.focusLoci = function (loci) {
        this.plugin.managers.camera.focusLoci(loci);
    };
    MeasurementControls.prototype.historyEntry = function (e, idx) {
        var _this = this;
        var history = this.plugin.managers.structure.selection.additionsHistory;
        return _jsxs("div", { className: 'msp-flex-row', onMouseEnter: function () { return _this.highlight(e.loci); }, onMouseLeave: function () { return _this.plugin.managers.interactivity.lociHighlights.clearHighlights(); }, children: [_jsxs(Button, { noOverflow: true, title: 'Click to focus. Hover to highlight.', onClick: function () { return _this.focusLoci(e.loci); }, style: { width: 'auto', textAlign: 'left' }, children: [idx, ". ", _jsx("span", { dangerouslySetInnerHTML: { __html: e.label } })] }), history.length > 1 && _jsx(IconButton, { svg: ArrowUpwardSvg, small: true, className: 'msp-form-control', onClick: function () { return _this.moveHistory(e, 'up'); }, flex: '20px', title: 'Move up' }), history.length > 1 && _jsx(IconButton, { svg: ArrowDownwardSvg, small: true, className: 'msp-form-control', onClick: function () { return _this.moveHistory(e, 'down'); }, flex: '20px', title: 'Move down' }), _jsx(IconButton, { svg: DeleteOutlinedSvg, small: true, className: 'msp-form-control', onClick: function () { return _this.plugin.managers.structure.selection.modifyHistory(e, 'remove'); }, flex: true, title: 'Remove' })] }, e.id);
    };
    MeasurementControls.prototype.add = function () {
        var history = this.plugin.managers.structure.selection.additionsHistory;
        var entries = [];
        for (var i = 0, _i = Math.min(history.length, 4); i < _i; i++) {
            entries.push(this.historyEntry(history[i], i + 1));
        }
        var shouldShowToggleHint = this.plugin.config.get(PluginConfig.Viewport.ShowSelectionMode);
        var toggleHint = shouldShowToggleHint ? (_jsxs(_Fragment, { children: [' ', "(toggle ", _jsx(ToggleSelectionModeButton, { inline: true }), " mode)"] })) : null;
        return _jsxs(_Fragment, { children: [_jsx(ActionMenu, { items: this.actions, onSelect: this.selectAction }), entries.length > 0 && _jsx("div", { className: 'msp-control-offset', children: entries }), entries.length === 0 && _jsx("div", { className: 'msp-control-offset msp-help-text', children: _jsxs("div", { className: 'msp-help-description', children: [_jsx(Icon, { svg: HelpOutlineSvg, inline: true }), "Add one or more selections", toggleHint] }) })] });
    };
    MeasurementControls.prototype.render = function () {
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsx(ToggleButton, { icon: AddSvg, label: 'Add', toggle: this.toggleAdd, isSelected: this.state.action === 'add', disabled: this.state.isBusy, className: 'msp-btn-apply-simple' }), _jsx(ToggleButton, { icon: TuneSvg, label: '', title: 'Options', toggle: this.toggleOptions, isSelected: this.state.action === 'options', disabled: this.state.isBusy, style: { flex: '0 0 40px', padding: 0 } })] }), this.state.action === 'add' && this.add(), this.state.action === 'options' && _jsx(MeasurementsOptions, {})] });
    };
    return MeasurementControls;
}(PurePluginUIComponent));
export { MeasurementControls };
var MeasurementsOptions = /** @class */ (function (_super) {
    __extends(MeasurementsOptions, _super);
    function MeasurementsOptions() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isDisabled: false };
        _this.changed = function (options) {
            _this.plugin.managers.structure.measurement.setOptions(options);
        };
        return _this;
    }
    MeasurementsOptions.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.measurement.behaviors.state, function () {
            _this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (v) {
            _this.setState({ isDisabled: v });
        });
    };
    MeasurementsOptions.prototype.render = function () {
        var measurements = this.plugin.managers.structure.measurement.state;
        return _jsx("div", { className: 'msp-control-offset', children: _jsx(ParameterControls, { params: StructureMeasurementParams, values: measurements.options, onChangeValues: this.changed, isDisabled: this.state.isDisabled }) });
    };
    return MeasurementsOptions;
}(PurePluginUIComponent));
var MeasurementEntry = /** @class */ (function (_super) {
    __extends(MeasurementEntry, _super);
    function MeasurementEntry() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { showUpdate: false };
        _this.delete = function () {
            PluginCommands.State.RemoveObject(_this.plugin, { state: _this.props.cell.parent, ref: _this.props.cell.transform.parent, removeParentGhosts: true });
        };
        _this.toggleVisibility = function (e) {
            e.preventDefault();
            PluginCommands.State.ToggleVisibility(_this.plugin, { state: _this.props.cell.parent, ref: _this.props.cell.transform.parent });
            e.currentTarget.blur();
        };
        _this.highlight = function () {
            var _a;
            var selections = _this.selections;
            if (!selections)
                return;
            _this.plugin.managers.interactivity.lociHighlights.clearHighlights();
            for (var _b = 0, _c = _this.lociArray; _b < _c.length; _b++) {
                var loci = _c[_b];
                _this.plugin.managers.interactivity.lociHighlights.highlight({ loci: loci }, false);
            }
            var reprLocis = (_a = _this.props.cell.obj) === null || _a === void 0 ? void 0 : _a.data.repr.getAllLoci();
            if (reprLocis) {
                for (var _d = 0, reprLocis_1 = reprLocis; _d < reprLocis_1.length; _d++) {
                    var loci = reprLocis_1[_d];
                    _this.plugin.managers.interactivity.lociHighlights.highlight({ loci: loci }, false);
                }
            }
        };
        _this.clearHighlight = function () {
            _this.plugin.managers.interactivity.lociHighlights.clearHighlights();
        };
        _this.toggleUpdate = function () { return _this.setState({ showUpdate: !_this.state.showUpdate }); };
        _this.focus = function () {
            var selections = _this.selections;
            if (!selections)
                return;
            var sphere = Loci.getBundleBoundingSphere({ loci: _this.lociArray });
            if (sphere) {
                _this.plugin.managers.camera.focusSphere(sphere);
            }
        };
        _this.selectAction = function (item) {
            if (!item)
                return;
            _this.setState({ showUpdate: false });
            (item === null || item === void 0 ? void 0 : item.value)();
        };
        return _this;
    }
    MeasurementEntry.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.state.events.cell.stateUpdated, function (e) {
            _this.forceUpdate();
        });
    };
    Object.defineProperty(MeasurementEntry.prototype, "selections", {
        get: function () {
            var _a;
            return (_a = this.props.cell.obj) === null || _a === void 0 ? void 0 : _a.data.sourceData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeasurementEntry.prototype, "lociArray", {
        get: function () {
            var selections = this.selections;
            if (!selections)
                return [];
            if (selections.infos)
                return [selections.infos[0].loci];
            if (selections.pairs)
                return selections.pairs[0].loci;
            if (selections.triples)
                return selections.triples[0].loci;
            if (selections.quads)
                return selections.quads[0].loci;
            if (selections.locis)
                return selections.locis;
            return [];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeasurementEntry.prototype, "label", {
        get: function () {
            var selections = this.selections;
            if (!selections)
                return '<empty>';
            if (selections.infos)
                return lociLabel(selections.infos[0].loci, { condensed: true });
            if (selections.pairs)
                return distanceLabel(selections.pairs[0], { condensed: true, unitLabel: this.plugin.managers.structure.measurement.state.options.distanceUnitLabel });
            if (selections.triples)
                return angleLabel(selections.triples[0], { condensed: true });
            if (selections.quads)
                return dihedralLabel(selections.quads[0], { condensed: true });
            if (selections.locis)
                return structureElementLociLabelMany(selections.locis, { countsOnly: true });
            return '<empty>';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeasurementEntry.prototype, "actions", {
        get: function () {
            var _this = this;
            this.props.cell.sourceRef;
            return [ActionMenu.Item('Select This', function () { return _this.plugin.managers.structure.selection.fromSelections(_this.props.cell.sourceRef); }, { icon: SetSvg })];
        },
        enumerable: false,
        configurable: true
    });
    MeasurementEntry.prototype.render = function () {
        var cell = this.props.cell;
        var obj = cell.obj;
        if (!obj)
            return null;
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, children: [_jsx("button", { className: 'msp-form-control msp-control-button-label msp-no-overflow', title: 'Click to focus. Hover to highlight.', onClick: this.focus, style: { width: 'auto', textAlign: 'left' }, children: _jsx("span", { dangerouslySetInnerHTML: { __html: this.label } }) }), _jsx(IconButton, { svg: cell.state.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, small: true, className: 'msp-form-control', onClick: this.toggleVisibility, flex: true, title: cell.state.isHidden ? 'Show' : 'Hide' }), _jsx(IconButton, { svg: DeleteOutlinedSvg, small: true, className: 'msp-form-control', onClick: this.delete, flex: true, title: 'Delete', toggleState: false }), _jsx(IconButton, { svg: MoreHorizSvg, className: 'msp-form-control', onClick: this.toggleUpdate, flex: true, title: 'Actions', toggleState: this.state.showUpdate })] }, obj.id), this.state.showUpdate && cell.parent && _jsx(_Fragment, { children: _jsxs("div", { className: 'msp-accent-offset', children: [_jsx(ActionMenu, { items: this.actions, onSelect: this.selectAction, noOffset: true }), _jsx(ExpandGroup, { header: 'Options', noOffset: true, children: _jsx(UpdateTransformControl, { state: cell.parent, transform: cell.transform, customHeader: 'none', autoHideApply: true }) })] }) })] });
    };
    return MeasurementEntry;
}(PurePluginUIComponent));
