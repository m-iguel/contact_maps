import { __extends, __spreadArray } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { OrderedSet, SortedArray } from '../../mol-data/int';
import { StructureElement, StructureProperties, Unit } from '../../mol-model/structure';
import { FocusLoci } from '../../mol-plugin/behavior/dynamic/representation';
import { lociLabel } from '../../mol-theme/label';
import { Binding } from '../../mol-util/binding';
import { memoizeLatest } from '../../mol-util/memoize';
import { PluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, IconButton, ToggleButton } from '../controls/common';
import { CancelOutlinedSvg, CenterFocusStrongSvg } from '../controls/icons';
function addSymmetryGroupEntries(entries, location, unitSymmetryGroup, granularity) {
    var idx = SortedArray.indexOf(location.unit.elements, location.element);
    var base = StructureElement.Loci(location.structure, [
        { unit: location.unit, indices: OrderedSet.ofSingleton(idx) }
    ]);
    var extended = granularity === 'residue'
        ? StructureElement.Loci.extendToWholeResidues(base)
        : StructureElement.Loci.extendToWholeChains(base);
    var name = StructureProperties.entity.pdbx_description(location).join(', ');
    for (var _i = 0, _a = unitSymmetryGroup.units; _i < _a.length; _i++) {
        var u = _a[_i];
        var loci = StructureElement.Loci(extended.structure, [
            { unit: u, indices: extended.elements[0].indices }
        ]);
        var label = lociLabel(loci, { reverse: true, hidePrefix: true, htmlStyling: false, granularity: granularity });
        if (!label)
            label = lociLabel(loci, { hidePrefix: false, htmlStyling: false });
        if (unitSymmetryGroup.units.length > 1) {
            label += " | ".concat(loci.elements[0].unit.conformation.operator.name);
        }
        var item = { label: label, category: name, loci: loci };
        if (entries.has(name))
            entries.get(name).push(item);
        else
            entries.set(name, [item]);
    }
}
function getFocusEntries(structure) {
    var entityEntries = new Map();
    var l = StructureElement.Location.create(structure);
    for (var _i = 0, _a = structure.unitSymmetryGroups; _i < _a.length; _i++) {
        var ug = _a[_i];
        if (!Unit.isAtomic(ug.units[0]))
            continue;
        l.unit = ug.units[0];
        l.element = ug.elements[0];
        var isMultiChain = Unit.Traits.is(l.unit.traits, Unit.Trait.MultiChain);
        var entityType = StructureProperties.entity.type(l);
        var isNonPolymer = entityType === 'non-polymer';
        var isBranched = entityType === 'branched';
        var isBirdMolecule = !!StructureProperties.entity.prd_id(l);
        if (isBirdMolecule) {
            addSymmetryGroupEntries(entityEntries, l, ug, 'chain');
        }
        else if (isNonPolymer && !isMultiChain) {
            addSymmetryGroupEntries(entityEntries, l, ug, 'residue');
        }
        else if (isBranched || (isNonPolymer && isMultiChain)) {
            var u = l.unit;
            var residueIndex = u.model.atomicHierarchy.residueAtomSegments.index;
            var prev = -1;
            for (var i = 0, il = u.elements.length; i < il; ++i) {
                var eI = u.elements[i];
                var rI = residueIndex[eI];
                if (rI !== prev) {
                    l.element = eI;
                    addSymmetryGroupEntries(entityEntries, l, ug, 'residue');
                    prev = rI;
                }
            }
        }
    }
    var entries = [];
    entityEntries.forEach(function (e, name) {
        if (e.length === 1) {
            entries.push({ label: "".concat(name, ": ").concat(e[0].label), loci: e[0].loci });
        }
        else if (e.length < 2000) {
            entries.push.apply(entries, e);
        }
    });
    return entries;
}
var StructureFocusControls = /** @class */ (function (_super) {
    __extends(StructureFocusControls, _super);
    function StructureFocusControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isBusy: false, showAction: false };
        _this.getSelectionItems = memoizeLatest(function (structures) {
            var _a;
            var presetItems = [];
            for (var _i = 0, structures_1 = structures; _i < structures_1.length; _i++) {
                var s = structures_1[_i];
                var d = (_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
                if (d) {
                    var entries = getFocusEntries(d);
                    if (entries.length > 0) {
                        presetItems.push(__spreadArray([
                            ActionMenu.Header(d.label, { description: d.label })
                        ], ActionMenu.createItems(entries, {
                            label: function (f) { return f.label; },
                            category: function (f) { return f.category; },
                            description: function (f) { return f.label; }
                        }), true));
                    }
                }
            }
            return presetItems;
        });
        _this.selectAction = function (item, e) {
            if (!item || !_this.state.showAction) {
                _this.setState({ showAction: false });
                return;
            }
            var f = item.value;
            if (e === null || e === void 0 ? void 0 : e.shiftKey) {
                _this.plugin.managers.structure.focus.addFromLoci(f.loci);
            }
            else {
                _this.plugin.managers.structure.focus.set(f);
            }
            _this.focusCamera();
        };
        _this.toggleAction = function () { return _this.setState({ showAction: !_this.state.showAction }); };
        _this.focusCamera = function () {
            var current = _this.plugin.managers.structure.focus.current;
            if (current)
                _this.plugin.managers.camera.focusLoci(current.loci);
        };
        _this.clear = function () {
            _this.plugin.managers.structure.focus.clear();
            _this.plugin.managers.camera.reset();
        };
        _this.highlightCurrent = function () {
            var current = _this.plugin.managers.structure.focus.current;
            if (current)
                _this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: current.loci }, false);
        };
        _this.clearHighlights = function () {
            _this.plugin.managers.interactivity.lociHighlights.clearHighlights();
        };
        return _this;
    }
    StructureFocusControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.focus.behaviors.current, function (c) {
            // clear the memo cache
            _this.getSelectionItems([]);
            _this.forceUpdate();
        });
        this.subscribe(this.plugin.managers.structure.focus.events.historyUpdated, function (c) {
            _this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (v) {
            _this.setState({ isBusy: v, showAction: false });
        });
    };
    Object.defineProperty(StructureFocusControls.prototype, "isDisabled", {
        get: function () {
            return this.state.isBusy || this.plugin.managers.structure.hierarchy.selection.structures.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StructureFocusControls.prototype, "actionItems", {
        get: function () {
            var historyItems = [];
            var history = this.plugin.managers.structure.focus.history;
            if (history.length > 0) {
                historyItems.push(__spreadArray([
                    ActionMenu.Header('History', { description: 'Previously focused on items.' })
                ], ActionMenu.createItems(history, {
                    label: function (f) { return f.label; },
                    description: function (f) {
                        return f.category && f.label !== f.category
                            ? "".concat(f.category, " | ").concat(f.label)
                            : f.label;
                    }
                }), true));
            }
            var presetItems = this.getSelectionItems(this.plugin.managers.structure.hierarchy.selection.structures);
            if (presetItems.length === 1) {
                var item = presetItems[0];
                var header = item[0];
                header.initiallyExpanded = true;
            }
            var items = [];
            if (presetItems.length > 0)
                items.push.apply(items, presetItems);
            if (historyItems.length > 0)
                items.push.apply(items, historyItems);
            return items;
        },
        enumerable: false,
        configurable: true
    });
    StructureFocusControls.prototype.getToggleBindingLabel = function () {
        var _a;
        var t = this.plugin.state.behaviors.transforms.get(FocusLoci.id);
        if (!t)
            return '';
        var binding = (_a = t.params) === null || _a === void 0 ? void 0 : _a.bindings.clickFocus;
        if (!binding || Binding.isEmpty(binding))
            return '';
        return Binding.formatTriggers(binding);
    };
    StructureFocusControls.prototype.render = function () {
        var current = this.plugin.managers.structure.focus.current;
        var label = (current === null || current === void 0 ? void 0 : current.label) || 'Nothing Focused';
        var title = 'Click to Center Camera';
        if (!current) {
            title = 'Select focus using the menu';
            var binding = this.getToggleBindingLabel();
            if (binding) {
                title += "\nor use '".concat(binding, "' on element");
            }
        }
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsx(Button, { noOverflow: true, onClick: this.focusCamera, title: title, onMouseEnter: this.highlightCurrent, onMouseLeave: this.clearHighlights, disabled: this.isDisabled || !current, style: { textAlignLast: current ? 'left' : void 0 }, children: label }), current && _jsx(IconButton, { svg: CancelOutlinedSvg, onClick: this.clear, title: 'Clear', className: 'msp-form-control', flex: true, disabled: this.isDisabled }), _jsx(ToggleButton, { icon: CenterFocusStrongSvg, title: 'Select a focus target to center on an show its surroundings. Hold shift to focus on multiple targets.', toggle: this.toggleAction, isSelected: this.state.showAction, disabled: this.isDisabled, style: { flex: '0 0 40px', padding: 0 } })] }), this.state.showAction && _jsx(ActionMenu, { items: this.actionItems, onSelect: this.selectAction })] });
    };
    return StructureFocusControls;
}(PluginUIComponent));
export { StructureFocusControls };
