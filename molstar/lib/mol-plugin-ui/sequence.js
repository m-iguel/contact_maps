import { __assign, __extends } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as React from 'react';
import { PluginUIComponent } from './base';
import { PluginStateObject as PSO } from '../mol-plugin-state/objects';
import { Sequence } from './sequence/sequence';
import { Structure, StructureElement, StructureProperties as SP, Unit } from '../mol-model/structure';
import { PolymerSequenceWrapper } from './sequence/polymer';
import { MarkerAction } from '../mol-util/marker-action';
import { PureSelectControl } from './controls/parameters';
import { ParamDefinition as PD } from '../mol-util/param-definition';
import { HeteroSequenceWrapper } from './sequence/hetero';
import { StateSelection } from '../mol-state';
import { ChainSequenceWrapper } from './sequence/chain';
import { ElementSequenceWrapper } from './sequence/element';
import { elementLabel } from '../mol-theme/label';
import { Icon, HelpOutlineSvg } from './controls/icons';
import { arrayEqual } from '../mol-util/array';
var MaxDisplaySequenceLength = 5000;
// TODO: add virtualized Select controls (at best with a search box)?
var MaxSelectOptionsCount = 1000;
var MaxSequenceWrappersCount = 30;
export function opKey(l) {
    var ids = SP.unit.pdbx_struct_oper_list_ids(l);
    var ncs = SP.unit.struct_ncs_oper_id(l);
    var hkl = SP.unit.hkl(l);
    var spgrOp = SP.unit.spgrOp(l);
    return "".concat(ids.sort().join(','), "|").concat(ncs, "|").concat(hkl, "|").concat(spgrOp);
}
export function splitModelEntityId(modelEntityId) {
    var _a = modelEntityId.split('|'), modelIdx = _a[0], entityId = _a[1];
    return [parseInt(modelIdx), entityId];
}
export function getSequenceWrapper(state, structureSelection) {
    var structure = state.structure, modelEntityId = state.modelEntityId, chainGroupId = state.chainGroupId, operatorKey = state.operatorKey;
    var l = StructureElement.Location.create(structure);
    var _a = splitModelEntityId(modelEntityId), modelIdx = _a[0], entityId = _a[1];
    var units = [];
    for (var _i = 0, _b = structure.units; _i < _b.length; _i++) {
        var unit = _b[_i];
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        if (structure.getModelIndex(unit.model) !== modelIdx)
            continue;
        if (SP.entity.id(l) !== entityId)
            continue;
        if (unit.chainGroupId !== chainGroupId)
            continue;
        if (opKey(l) !== operatorKey)
            continue;
        units.push(unit);
    }
    if (units.length > 0) {
        var data = { structure: structure, units: units };
        var unit = units[0];
        var sw = void 0;
        if (unit.polymerElements.length) {
            var l_1 = StructureElement.Location.create(structure, unit, unit.elements[0]);
            var entitySeq = unit.model.sequence.byEntityKey[SP.entity.key(l_1)];
            // check if entity sequence is available
            if (entitySeq && entitySeq.sequence.length <= MaxDisplaySequenceLength) {
                sw = new PolymerSequenceWrapper(data);
            }
            else {
                var polymerElementCount = units.reduce(function (a, v) { return a + v.polymerElements.length; }, 0);
                if (Unit.isAtomic(unit) || polymerElementCount > MaxDisplaySequenceLength) {
                    sw = new ChainSequenceWrapper(data);
                }
                else {
                    sw = new ElementSequenceWrapper(data);
                }
            }
        }
        else if (Unit.isAtomic(unit)) {
            var residueCount = units.reduce(function (a, v) { return a + v.residueCount; }, 0);
            if (residueCount > MaxDisplaySequenceLength) {
                sw = new ChainSequenceWrapper(data);
            }
            else {
                sw = new HeteroSequenceWrapper(data);
            }
        }
        else {
            console.warn('should not happen, expecting coarse units to be polymeric');
            sw = new ChainSequenceWrapper(data);
        }
        sw.markResidue(structureSelection.getLoci(structure), MarkerAction.Select);
        return sw;
    }
    else {
        return 'No sequence available';
    }
}
export function getModelEntityOptions(structure, polymersOnly) {
    if (polymersOnly === void 0) { polymersOnly = false; }
    var options = [];
    var l = StructureElement.Location.create(structure);
    var seen = new Set();
    for (var _i = 0, _a = structure.units; _i < _a.length; _i++) {
        var unit = _a[_i];
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        var id = SP.entity.id(l);
        var modelIdx = structure.getModelIndex(unit.model);
        var key = "".concat(modelIdx, "|").concat(id);
        if (seen.has(key))
            continue;
        if (polymersOnly && SP.entity.type(l) !== 'polymer')
            continue;
        var description = SP.entity.pdbx_description(l).join(', ');
        if (structure.models.length) {
            if (structure.representativeModel) { // indicates model trajectory
                description += " (Model ".concat(structure.models[modelIdx].modelNum, ")");
            }
            else if (description.startsWith('Polymer ')) { // indicates generic entity name
                description += " (".concat(structure.models[modelIdx].entry, ")");
            }
        }
        var label = "".concat(id, ": ").concat(description);
        options.push([key, label]);
        seen.add(key);
        if (options.length > MaxSelectOptionsCount) {
            return [['', 'Too many entities']];
        }
    }
    if (options.length === 0)
        options.push(['', 'No entities']);
    return options;
}
export function getChainOptions(structure, modelEntityId) {
    var options = [];
    var l = StructureElement.Location.create(structure);
    var seen = new Set();
    var _a = splitModelEntityId(modelEntityId), modelIdx = _a[0], entityId = _a[1];
    for (var _i = 0, _b = structure.units; _i < _b.length; _i++) {
        var unit = _b[_i];
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        if (structure.getModelIndex(unit.model) !== modelIdx)
            continue;
        if (SP.entity.id(l) !== entityId)
            continue;
        var id = unit.chainGroupId;
        if (seen.has(id))
            continue;
        // TODO handle special case
        // - more than one chain in a unit
        var label = elementLabel(l, { granularity: 'chain', hidePrefix: true, htmlStyling: false });
        options.push([id, label]);
        seen.add(id);
        if (options.length > MaxSelectOptionsCount) {
            return [[-1, 'Too many chains']];
        }
    }
    if (options.length === 0)
        options.push([-1, 'No chains']);
    return options;
}
export function getOperatorOptions(structure, modelEntityId, chainGroupId) {
    var options = [];
    var l = StructureElement.Location.create(structure);
    var seen = new Set();
    var _a = splitModelEntityId(modelEntityId), modelIdx = _a[0], entityId = _a[1];
    for (var _i = 0, _b = structure.units; _i < _b.length; _i++) {
        var unit = _b[_i];
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        if (structure.getModelIndex(unit.model) !== modelIdx)
            continue;
        if (SP.entity.id(l) !== entityId)
            continue;
        if (unit.chainGroupId !== chainGroupId)
            continue;
        var id = opKey(l);
        if (seen.has(id))
            continue;
        var label = unit.conformation.operator.name;
        options.push([id, label]);
        seen.add(id);
        if (options.length > MaxSelectOptionsCount) {
            return [['', 'Too many operators']];
        }
    }
    if (options.length === 0)
        options.push(['', 'No operators']);
    return options;
}
export function getStructureOptions(state) {
    var _a;
    var options = [];
    var all = [];
    var structures = state.select(StateSelection.Generators.rootsOfType(PSO.Molecule.Structure));
    for (var _i = 0, structures_1 = structures; _i < structures_1.length; _i++) {
        var s = structures_1[_i];
        if (!((_a = s.obj) === null || _a === void 0 ? void 0 : _a.data))
            continue;
        all.push(s.obj.data);
        options.push([s.transform.ref, s.obj.data.label]);
    }
    if (options.length === 0)
        options.push(['', 'No structure']);
    return { options: options, all: all };
}
var SequenceViewModeParam = PD.Select('single', [['single', 'Chain'], ['polymers', 'Polymers'], ['all', 'Everything']]);
var SequenceView = /** @class */ (function (_super) {
    __extends(SequenceView, _super);
    function SequenceView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { structureOptions: { options: [], all: [] }, structure: Structure.Empty, structureRef: '', modelEntityId: '', chainGroupId: -1, operatorKey: '', mode: 'single' };
        _this.setParamProps = function (p) {
            var state = __assign({}, _this.state);
            switch (p.name) {
                case 'mode':
                    state.mode = p.value;
                    if (_this.state.mode === state.mode)
                        return;
                    if (state.mode === 'all' || state.mode === 'polymers') {
                        break;
                    }
                case 'structure':
                    if (p.name === 'structure')
                        state.structureRef = p.value;
                    state.structure = _this.getStructure(state.structureRef);
                    state.modelEntityId = getModelEntityOptions(state.structure)[0][0];
                    state.chainGroupId = getChainOptions(state.structure, state.modelEntityId)[0][0];
                    state.operatorKey = getOperatorOptions(state.structure, state.modelEntityId, state.chainGroupId)[0][0];
                    break;
                case 'entity':
                    state.modelEntityId = p.value;
                    state.chainGroupId = getChainOptions(state.structure, state.modelEntityId)[0][0];
                    state.operatorKey = getOperatorOptions(state.structure, state.modelEntityId, state.chainGroupId)[0][0];
                    break;
                case 'chain':
                    state.chainGroupId = p.value;
                    state.operatorKey = getOperatorOptions(state.structure, state.modelEntityId, state.chainGroupId)[0][0];
                    break;
                case 'operator':
                    state.operatorKey = p.value;
                    break;
            }
            _this.setState(state);
        };
        return _this;
    }
    SequenceView.prototype.componentDidMount = function () {
        var _this = this;
        if (this.plugin.state.data.select(StateSelection.Generators.rootsOfType(PSO.Molecule.Structure)).length > 0)
            this.setState(this.getInitialState());
        this.subscribe(this.plugin.state.events.object.updated, function (_a) {
            var ref = _a.ref, obj = _a.obj;
            if (ref === _this.state.structureRef && obj && obj.type === PSO.Molecule.Structure.type && obj.data !== _this.state.structure) {
                _this.sync();
            }
        });
        this.subscribe(this.plugin.state.events.object.created, function (_a) {
            var obj = _a.obj;
            if (obj && obj.type === PSO.Molecule.Structure.type) {
                _this.sync();
            }
        });
        this.subscribe(this.plugin.state.events.object.removed, function (_a) {
            var obj = _a.obj;
            if (obj && obj.type === PSO.Molecule.Structure.type && obj.data === _this.state.structure) {
                _this.sync();
            }
        });
    };
    SequenceView.prototype.sync = function () {
        var structureOptions = getStructureOptions(this.plugin.state.data);
        if (arrayEqual(structureOptions.all, this.state.structureOptions.all))
            return;
        this.setState(this.getInitialState());
    };
    SequenceView.prototype.getStructure = function (ref) {
        var state = this.plugin.state.data;
        var cell = state.select(ref)[0];
        if (!ref || !cell || !cell.obj)
            return Structure.Empty;
        return cell.obj.data;
    };
    SequenceView.prototype.getSequenceWrapper = function (params) {
        return {
            wrapper: getSequenceWrapper(this.state, this.plugin.managers.structure.selection),
            label: "".concat(PD.optionLabel(params.chain, this.state.chainGroupId), " | ").concat(PD.optionLabel(params.entity, this.state.modelEntityId))
        };
    };
    SequenceView.prototype.getSequenceWrappers = function (params) {
        if (this.state.mode === 'single')
            return [this.getSequenceWrapper(params)];
        var structure = this.getStructure(this.state.structureRef);
        var wrappers = [];
        for (var _i = 0, _a = getModelEntityOptions(structure, this.state.mode === 'polymers'); _i < _a.length; _i++) {
            var _b = _a[_i], modelEntityId = _b[0], eLabel = _b[1];
            for (var _c = 0, _d = getChainOptions(structure, modelEntityId); _c < _d.length; _c++) {
                var _e = _d[_c], chainGroupId = _e[0], cLabel = _e[1];
                for (var _f = 0, _g = getOperatorOptions(structure, modelEntityId, chainGroupId); _f < _g.length; _f++) {
                    var operatorKey = _g[_f][0];
                    wrappers.push({
                        wrapper: getSequenceWrapper({
                            structure: structure,
                            modelEntityId: modelEntityId,
                            chainGroupId: chainGroupId,
                            operatorKey: operatorKey
                        }, this.plugin.managers.structure.selection),
                        label: "".concat(cLabel, " | ").concat(eLabel)
                    });
                    if (wrappers.length > MaxSequenceWrappersCount)
                        return [];
                }
            }
        }
        return wrappers;
    };
    SequenceView.prototype.getInitialState = function () {
        var _a;
        var structureOptions = getStructureOptions(this.plugin.state.data);
        var structureRef = structureOptions.options[0][0];
        var structure = this.getStructure(structureRef);
        var modelEntityId = getModelEntityOptions(structure)[0][0];
        var chainGroupId = getChainOptions(structure, modelEntityId)[0][0];
        var operatorKey = getOperatorOptions(structure, modelEntityId, chainGroupId)[0][0];
        if (this.state.structure && this.state.structure === structure) {
            modelEntityId = this.state.modelEntityId;
            chainGroupId = this.state.chainGroupId;
            operatorKey = this.state.operatorKey;
        }
        return { structureOptions: structureOptions, structure: structure, structureRef: structureRef, modelEntityId: modelEntityId, chainGroupId: chainGroupId, operatorKey: operatorKey, mode: (_a = this.props.defaultMode) !== null && _a !== void 0 ? _a : 'single' };
    };
    Object.defineProperty(SequenceView.prototype, "params", {
        get: function () {
            var _a = this.state, structureOptions = _a.structureOptions, structure = _a.structure, modelEntityId = _a.modelEntityId, chainGroupId = _a.chainGroupId;
            var entityOptions = getModelEntityOptions(structure);
            var chainOptions = getChainOptions(structure, modelEntityId);
            var operatorOptions = getOperatorOptions(structure, modelEntityId, chainGroupId);
            return {
                structure: PD.Select(structureOptions.options[0][0], structureOptions.options, { shortLabel: true }),
                entity: PD.Select(entityOptions[0][0], entityOptions, { shortLabel: true }),
                chain: PD.Select(chainOptions[0][0], chainOptions, { shortLabel: true, twoColumns: true, label: 'Chain' }),
                operator: PD.Select(operatorOptions[0][0], operatorOptions, { shortLabel: true, twoColumns: true }),
                mode: SequenceViewModeParam
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SequenceView.prototype, "values", {
        get: function () {
            return {
                structure: this.state.structureRef,
                entity: this.state.modelEntityId,
                chain: this.state.chainGroupId,
                operator: this.state.operatorKey,
                mode: this.state.mode
            };
        },
        enumerable: false,
        configurable: true
    });
    SequenceView.prototype.render = function () {
        if (this.getStructure(this.state.structureRef) === Structure.Empty) {
            return _jsx("div", { className: 'msp-sequence', children: _jsxs("div", { className: 'msp-sequence-select', children: [_jsx(Icon, { svg: HelpOutlineSvg, style: { cursor: 'help', position: 'absolute', right: 0, top: 0 }, title: 'Shows a sequence of one or more chains. Use the controls to alter selection.' }), _jsx("span", { children: "Sequence" }), _jsx("span", { style: { fontWeight: 'normal' }, children: "No structure available" })] }) });
        }
        var params = this.params;
        var values = this.values;
        var sequenceWrappers = this.getSequenceWrappers(params);
        return _jsxs("div", { className: 'msp-sequence', children: [_jsxs("div", { className: 'msp-sequence-select', children: [_jsx(Icon, { svg: HelpOutlineSvg, style: { cursor: 'help', position: 'absolute', right: 0, top: 0 }, title: 'This shows a single sequence. Use the controls to show a different sequence.' }), _jsx("span", { children: "Sequence of" }), _jsx(PureSelectControl, { title: "[Structure] ".concat(PD.optionLabel(params.structure, values.structure)), param: params.structure, name: 'structure', value: values.structure, onChange: this.setParamProps }), _jsx(PureSelectControl, { title: "[Mode]", param: SequenceViewModeParam, name: 'mode', value: values.mode, onChange: this.setParamProps }), values.mode === 'single' && _jsx(PureSelectControl, { title: "[Entity] ".concat(PD.optionLabel(params.entity, values.entity)), param: params.entity, name: 'entity', value: values.entity, onChange: this.setParamProps }), values.mode === 'single' && _jsx(PureSelectControl, { title: "[Chain] ".concat(PD.optionLabel(params.chain, values.chain)), param: params.chain, name: 'chain', value: values.chain, onChange: this.setParamProps }), params.operator.options.length > 1 && _jsx(_Fragment, { children: _jsx(PureSelectControl, { title: "[Instance] ".concat(PD.optionLabel(params.operator, values.operator)), param: params.operator, name: 'operator', value: values.operator, onChange: this.setParamProps }) })] }), _jsx(NonEmptySequenceWrapper, { children: sequenceWrappers.map(function (s, i) {
                        var elem = typeof s.wrapper === 'string'
                            ? _jsx("div", { className: 'msp-sequence-wrapper', children: s.wrapper }, i)
                            : _jsx(Sequence, { sequenceWrapper: s.wrapper }, i);
                        if (values.mode === 'single')
                            return elem;
                        return _jsxs(React.Fragment, { children: [_jsx("div", { className: 'msp-sequence-chain-label', children: s.label }), elem] }, i);
                    }) })] });
    };
    return SequenceView;
}(PluginUIComponent));
export { SequenceView };
function NonEmptySequenceWrapper(_a) {
    var children = _a.children;
    return _jsx("div", { className: 'msp-sequence-wrapper-non-empty', children: children });
}
