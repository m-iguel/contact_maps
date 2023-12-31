import { __awaiter, __extends, __generator } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Mat4 } from '../../mol-math/linear-algebra';
import { SIFTSMapping } from '../../mol-model-props/sequence/sifts-mapping';
import { QueryContext, StructureElement, StructureProperties, StructureSelection } from '../../mol-model/structure';
import { alignAndSuperpose, superpose } from '../../mol-model/structure/structure/util/superposition';
import { alignAndSuperposeWithSIFTSMapping } from '../../mol-model/structure/structure/util/superposition-sifts-mapping';
import { StructureSelectionQueries } from '../../mol-plugin-state/helpers/structure-selection-query';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { StateObjectRef } from '../../mol-state';
import { elementLabel, structureElementStatsLabel } from '../../mol-theme/label';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { stripTags } from '../../mol-util/string';
import { CollapsableControls, PurePluginUIComponent } from '../base';
import { Button, IconButton, ToggleButton } from '../controls/common';
import { ArrowDownwardSvg, ArrowUpwardSvg, DeleteOutlinedSvg, HelpOutlineSvg, Icon, SuperposeAtomsSvg, SuperposeChainsSvg, SuperpositionSvg, TuneSvg } from '../controls/icons';
import { ParameterControls } from '../controls/parameters';
import { ToggleSelectionModeButton } from './selection';
var StructureSuperpositionControls = /** @class */ (function (_super) {
    __extends(StructureSuperpositionControls, _super);
    function StructureSuperpositionControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StructureSuperpositionControls.prototype.defaultState = function () {
        return {
            isCollapsed: false,
            header: 'Superposition',
            brand: { accent: 'gray', svg: SuperpositionSvg },
            isHidden: true
        };
    };
    StructureSuperpositionControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, function (sel) {
            _this.setState({ isHidden: sel.structures.length < 2 });
        });
    };
    StructureSuperpositionControls.prototype.renderControls = function () {
        return _jsx(_Fragment, { children: _jsx(SuperpositionControls, {}) });
    };
    return StructureSuperpositionControls;
}(CollapsableControls));
export { StructureSuperpositionControls };
export var StructureSuperpositionParams = {
    alignSequences: PD.Boolean(true, { isEssential: true, description: 'For Chain-based 3D superposition, perform a sequence alignment and use the aligned residue pairs to guide the 3D superposition.' }),
    traceOnly: PD.Boolean(true, { description: 'For Chain- and Uniprot-based 3D superposition, base superposition only on CA (and equivalent) atoms.' })
};
var DefaultStructureSuperpositionOptions = PD.getDefaultValues(StructureSuperpositionParams);
var SuperpositionTag = 'SuperpositionTransform';
;
;
var SuperpositionControls = /** @class */ (function (_super) {
    __extends(SuperpositionControls, _super);
    function SuperpositionControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isBusy: false,
            canUseDb: false,
            action: undefined,
            options: DefaultStructureSuperpositionOptions
        };
        _this.superposeChains = function () { return __awaiter(_this, void 0, void 0, function () {
            var query, entries, locis, pivot, coordinateSystem, transforms, eA, i, il, eB, _a, bTransform, rmsd, labelA, labelB;
            var _this = this;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        query = (this.state.options.traceOnly ? StructureSelectionQueries.trace : StructureSelectionQueries.polymer).query;
                        entries = this.chainEntries;
                        locis = entries.map(function (e) {
                            var s = StructureElement.Loci.toStructure(e.loci);
                            var loci = StructureSelection.toLociWithSourceUnits(query(new QueryContext(s)));
                            return StructureElement.Loci.remap(loci, _this.getRootStructure(e.loci.structure));
                        });
                        pivot = this.plugin.managers.structure.hierarchy.findStructure((_b = locis[0]) === null || _b === void 0 ? void 0 : _b.structure);
                        coordinateSystem = (_d = (_c = pivot === null || pivot === void 0 ? void 0 : pivot.transform) === null || _c === void 0 ? void 0 : _c.cell.obj) === null || _d === void 0 ? void 0 : _d.data.coordinateSystem;
                        transforms = this.state.options.alignSequences
                            ? alignAndSuperpose(locis)
                            : superpose(locis);
                        eA = entries[0];
                        i = 1, il = locis.length;
                        _e.label = 1;
                    case 1:
                        if (!(i < il)) return [3 /*break*/, 4];
                        eB = entries[i];
                        _a = transforms[i - 1], bTransform = _a.bTransform, rmsd = _a.rmsd;
                        return [4 /*yield*/, this.transform(eB.cell, bTransform, coordinateSystem)];
                    case 2:
                        _e.sent();
                        labelA = stripTags(eA.label);
                        labelB = stripTags(eB.label);
                        this.plugin.log.info("Superposed [".concat(labelA, "] and [").concat(labelB, "] with RMSD ").concat(rmsd.toFixed(2), "."));
                        _e.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this.cameraReset()];
                    case 5:
                        _e.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.superposeAtoms = function () { return __awaiter(_this, void 0, void 0, function () {
            var entries, atomLocis, transforms, pivot, coordinateSystem, eA, i, il, eB, _a, bTransform, rmsd, labelA, labelB, count;
            var _this = this;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        entries = this.atomEntries;
                        atomLocis = entries.map(function (e) {
                            return StructureElement.Loci.remap(e.loci, _this.getRootStructure(e.loci.structure));
                        });
                        transforms = superpose(atomLocis);
                        pivot = this.plugin.managers.structure.hierarchy.findStructure((_b = atomLocis[0]) === null || _b === void 0 ? void 0 : _b.structure);
                        coordinateSystem = (_d = (_c = pivot === null || pivot === void 0 ? void 0 : pivot.transform) === null || _c === void 0 ? void 0 : _c.cell.obj) === null || _d === void 0 ? void 0 : _d.data.coordinateSystem;
                        eA = entries[0];
                        i = 1, il = atomLocis.length;
                        _e.label = 1;
                    case 1:
                        if (!(i < il)) return [3 /*break*/, 4];
                        eB = entries[i];
                        _a = transforms[i - 1], bTransform = _a.bTransform, rmsd = _a.rmsd;
                        return [4 /*yield*/, this.transform(eB.cell, bTransform, coordinateSystem)];
                    case 2:
                        _e.sent();
                        labelA = stripTags(eA.label);
                        labelB = stripTags(eB.label);
                        count = entries[i].atoms.length;
                        this.plugin.log.info("Superposed ".concat(count, " ").concat(count === 1 ? 'atom' : 'atoms', " of [").concat(labelA, "] and [").concat(labelB, "] with RMSD ").concat(rmsd.toFixed(2), "."));
                        _e.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this.cameraReset()];
                    case 5:
                        _e.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.superposeDb = function () { return __awaiter(_this, void 0, void 0, function () {
            var input, traceOnly, structures, _a, entries, failedPairs, zeroOverlapPairs, coordinateSystem, rmsd, _i, entries_1, xform, formatPairs;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        input = this.plugin.managers.structure.hierarchy.behaviors.selection.value.structures;
                        traceOnly = this.state.options.traceOnly;
                        structures = input.map(function (s) { var _a; return (_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data; });
                        _a = alignAndSuperposeWithSIFTSMapping(structures, { traceOnly: traceOnly }), entries = _a.entries, failedPairs = _a.failedPairs, zeroOverlapPairs = _a.zeroOverlapPairs;
                        coordinateSystem = (_d = (_c = (_b = input[0]) === null || _b === void 0 ? void 0 : _b.transform) === null || _c === void 0 ? void 0 : _c.cell.obj) === null || _d === void 0 ? void 0 : _d.data.coordinateSystem;
                        rmsd = 0;
                        _i = 0, entries_1 = entries;
                        _e.label = 1;
                    case 1:
                        if (!(_i < entries_1.length)) return [3 /*break*/, 4];
                        xform = entries_1[_i];
                        return [4 /*yield*/, this.transform(input[xform.other].cell, xform.transform.bTransform, coordinateSystem)];
                    case 2:
                        _e.sent();
                        rmsd += xform.transform.rmsd;
                        _e.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        rmsd /= Math.max(entries.length - 1, 1);
                        formatPairs = function (pairs) {
                            return "[".concat(pairs.map(function (_a) {
                                var i = _a[0], j = _a[1];
                                return "(".concat(structures[i].models[0].entryId, ", ").concat(structures[j].models[0].entryId, ")");
                            }).join(', '), "]");
                        };
                        if (zeroOverlapPairs.length) {
                            this.plugin.log.warn("Superposition: No UNIPROT mapping overlap between structures ".concat(formatPairs(zeroOverlapPairs), "."));
                        }
                        if (failedPairs.length) {
                            this.plugin.log.error("Superposition: Failed to superpose structures ".concat(formatPairs(failedPairs), "."));
                        }
                        if (!entries.length) return [3 /*break*/, 6];
                        this.plugin.log.info("Superposed ".concat(entries.length + 1, " structures with avg. RMSD ").concat(rmsd.toFixed(2), " \u00C5."));
                        return [4 /*yield*/, this.cameraReset()];
                    case 5:
                        _e.sent();
                        _e.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        _this.toggleByChains = function () { return _this.setState({ action: _this.state.action === 'byChains' ? void 0 : 'byChains' }); };
        _this.toggleByAtoms = function () { return _this.setState({ action: _this.state.action === 'byAtoms' ? void 0 : 'byAtoms' }); };
        _this.toggleOptions = function () { return _this.setState({ action: _this.state.action === 'options' ? void 0 : 'options' }); };
        _this.setOptions = function (values) {
            _this.setState({ options: values });
        };
        return _this;
    }
    SuperpositionControls.prototype.componentDidMount = function () {
        var _this = this;
        this.subscribe(this.selection.events.changed, function () {
            _this.forceUpdate();
        });
        this.subscribe(this.selection.events.additionsHistoryUpdated, function () {
            _this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, function (v) {
            _this.setState({ isBusy: v });
        });
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, function (sel) {
            _this.setState({ canUseDb: sel.structures.every(function (s) { var _a; return !!((_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data) && s.cell.obj.data.models.some(function (m) { return SIFTSMapping.Provider.isApplicable(m); }); }) });
        });
    };
    Object.defineProperty(SuperpositionControls.prototype, "selection", {
        get: function () {
            return this.plugin.managers.structure.selection;
        },
        enumerable: false,
        configurable: true
    });
    SuperpositionControls.prototype.transform = function (s, matrix, coordinateSystem) {
        return __awaiter(this, void 0, void 0, function () {
            var r, o, transform, params, b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        r = StateObjectRef.resolveAndCheck(this.plugin.state.data, s);
                        if (!r)
                            return [2 /*return*/];
                        o = this.plugin.state.data.selectQ(function (q) { return q.byRef(r.transform.ref).subtree().withTransformer(StateTransforms.Model.TransformStructureConformation); })[0];
                        transform = coordinateSystem && !Mat4.isIdentity(coordinateSystem.matrix)
                            ? Mat4.mul(Mat4(), coordinateSystem.matrix, matrix)
                            : matrix;
                        params = {
                            transform: {
                                name: 'matrix',
                                params: { data: transform, transpose: false }
                            }
                        };
                        b = o
                            ? this.plugin.state.data.build().to(o).update(params)
                            : this.plugin.state.data.build().to(s)
                                .insert(StateTransforms.Model.TransformStructureConformation, params, { tags: SuperpositionTag });
                        return [4 /*yield*/, this.plugin.runTask(this.plugin.state.data.updateTree(b))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SuperpositionControls.prototype.getRootStructure = function (s) {
        var _a;
        var parent = this.plugin.helpers.substructureParent.get(s);
        return (_a = this.plugin.state.data.selectQ(function (q) { return q.byValue(parent).rootOfType(PluginStateObject.Molecule.Structure); })[0].obj) === null || _a === void 0 ? void 0 : _a.data;
    };
    SuperpositionControls.prototype.cameraReset = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (res) { return requestAnimationFrame(res); })];
                    case 1:
                        _a.sent();
                        PluginCommands.Camera.Reset(this.plugin);
                        return [2 /*return*/];
                }
            });
        });
    };
    SuperpositionControls.prototype.highlight = function (loci) {
        this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: loci }, false);
    };
    SuperpositionControls.prototype.moveHistory = function (e, direction) {
        this.plugin.managers.structure.selection.modifyHistory(e, direction, void 0, true);
    };
    SuperpositionControls.prototype.focusLoci = function (loci) {
        this.plugin.managers.camera.focusLoci(loci);
    };
    SuperpositionControls.prototype.lociEntry = function (e, idx) {
        var _this = this;
        return _jsx("div", { className: 'msp-flex-row', children: _jsx(Button, { noOverflow: true, title: 'Click to focus. Hover to highlight.', onClick: function () { return _this.focusLoci(e.loci); }, style: { width: 'auto', textAlign: 'left' }, onMouseEnter: function () { return _this.highlight(e.loci); }, onMouseLeave: function () { return _this.plugin.managers.interactivity.lociHighlights.clearHighlights(); }, children: _jsx("span", { dangerouslySetInnerHTML: { __html: e.label } }) }) }, idx);
    };
    SuperpositionControls.prototype.historyEntry = function (e, idx) {
        var _this = this;
        var history = this.plugin.managers.structure.selection.additionsHistory;
        return _jsxs("div", { className: 'msp-flex-row', children: [_jsxs(Button, { noOverflow: true, title: 'Click to focus. Hover to highlight.', onClick: function () { return _this.focusLoci(e.loci); }, style: { width: 'auto', textAlign: 'left' }, onMouseEnter: function () { return _this.highlight(e.loci); }, onMouseLeave: function () { return _this.plugin.managers.interactivity.lociHighlights.clearHighlights(); }, children: [idx, ". ", _jsx("span", { dangerouslySetInnerHTML: { __html: e.label } })] }), history.length > 1 && _jsx(IconButton, { svg: ArrowUpwardSvg, small: true, className: 'msp-form-control', onClick: function () { return _this.moveHistory(e, 'up'); }, flex: '20px', title: 'Move up' }), history.length > 1 && _jsx(IconButton, { svg: ArrowDownwardSvg, small: true, className: 'msp-form-control', onClick: function () { return _this.moveHistory(e, 'down'); }, flex: '20px', title: 'Move down' }), _jsx(IconButton, { svg: DeleteOutlinedSvg, small: true, className: 'msp-form-control', onClick: function () { return _this.plugin.managers.structure.selection.modifyHistory(e, 'remove'); }, flex: true, title: 'Remove' })] }, e.id);
    };
    SuperpositionControls.prototype.atomsLociEntry = function (e, idx) {
        var _this = this;
        return _jsxs("div", { children: [_jsx("div", { className: 'msp-control-group-header', children: _jsx("div", { className: 'msp-no-overflow', title: e.label, children: e.label }) }), _jsx("div", { className: 'msp-control-offset', children: e.atoms.map(function (h, i) { return _this.historyEntry(h, i); }) })] }, idx);
    };
    Object.defineProperty(SuperpositionControls.prototype, "chainEntries", {
        get: function () {
            var _this = this;
            var location = StructureElement.Location.create();
            var entries = [];
            this.plugin.managers.structure.selection.entries.forEach(function (_a, ref) {
                var selection = _a.selection;
                var cell = StateObjectRef.resolveAndCheck(_this.plugin.state.data, ref);
                if (!cell || StructureElement.Loci.isEmpty(selection))
                    return;
                // only single polymer chain selections
                var l = StructureElement.Loci.getFirstLocation(selection, location);
                if (selection.elements.length > 1 || StructureProperties.entity.type(l) !== 'polymer')
                    return;
                var stats = StructureElement.Stats.ofLoci(selection);
                var counts = structureElementStatsLabel(stats, { countsOnly: true });
                var chain = elementLabel(l, { reverse: true, granularity: 'chain' }).split('|');
                var label = "".concat(counts, " | ").concat(chain[0], " | ").concat(chain[chain.length - 1]);
                entries.push({ loci: selection, label: label, cell: cell });
            });
            return entries;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SuperpositionControls.prototype, "atomEntries", {
        get: function () {
            var _this = this;
            var structureEntries = new Map();
            var history = this.plugin.managers.structure.selection.additionsHistory;
            for (var i = 0, il = history.length; i < il; ++i) {
                var e = history[i];
                if (StructureElement.Loci.size(e.loci) !== 1)
                    continue;
                var k = e.loci.structure;
                if (structureEntries.has(k))
                    structureEntries.get(k).push(e);
                else
                    structureEntries.set(k, [e]);
            }
            var entries = [];
            structureEntries.forEach(function (atoms, structure) {
                var cell = _this.plugin.helpers.substructureParent.get(structure);
                var elements = [];
                for (var i = 0, il = atoms.length; i < il; ++i) {
                    // note, we don't do loci union here to keep order of selected atoms
                    // for atom pairing during superposition
                    elements.push(atoms[i].loci.elements[0]);
                }
                var loci = StructureElement.Loci(atoms[0].loci.structure, elements);
                var label = loci.structure.label.split(' | ')[0];
                entries.push({ loci: loci, label: label, cell: cell, atoms: atoms });
            });
            return entries;
        },
        enumerable: false,
        configurable: true
    });
    SuperpositionControls.prototype.toggleHint = function () {
        var shouldShowToggleHint = this.plugin.config.get(PluginConfig.Viewport.ShowSelectionMode);
        return shouldShowToggleHint ? (_jsxs(_Fragment, { children: [' ', "(toggle ", _jsx(ToggleSelectionModeButton, { inline: true }), " mode)"] })) : null;
    };
    SuperpositionControls.prototype.addByChains = function () {
        var _this = this;
        var entries = this.chainEntries;
        return _jsxs(_Fragment, { children: [entries.length > 0 && _jsx("div", { className: 'msp-control-offset', children: entries.map(function (e, i) { return _this.lociEntry(e, i); }) }), entries.length < 2 && _jsx("div", { className: 'msp-control-offset msp-help-text', children: _jsxs("div", { className: 'msp-help-description', children: [_jsx(Icon, { svg: HelpOutlineSvg, inline: true }), "Add 2 or more selections", this.toggleHint(), " from separate structures. Selections must be limited to single polymer chains or residues therein."] }) }), entries.length > 1 && _jsx(Button, { title: 'Superpose structures by selected chains.', className: 'msp-btn-commit msp-btn-commit-on', onClick: this.superposeChains, style: { marginTop: '1px' }, children: "Superpose" })] });
    };
    SuperpositionControls.prototype.addByAtoms = function () {
        var _this = this;
        var entries = this.atomEntries;
        return _jsxs(_Fragment, { children: [entries.length > 0 && _jsx("div", { className: 'msp-control-offset', children: entries.map(function (e, i) { return _this.atomsLociEntry(e, i); }) }), entries.length < 2 && _jsx("div", { className: 'msp-control-offset msp-help-text', children: _jsxs("div", { className: 'msp-help-description', children: [_jsx(Icon, { svg: HelpOutlineSvg, inline: true }), "Add 1 or more selections", this.toggleHint(), " from separate structures. Selections must be limited to single atoms."] }) }), entries.length > 1 && _jsx(Button, { title: 'Superpose structures by selected atoms.', className: 'msp-btn-commit msp-btn-commit-on', onClick: this.superposeAtoms, style: { marginTop: '1px' }, children: "Superpose" })] });
    };
    SuperpositionControls.prototype.superposeByDbMapping = function () {
        return _jsx(_Fragment, { children: _jsx(Button, { icon: SuperposeChainsSvg, title: 'Superpose structures using intersection of residues from SIFTS UNIPROT mapping.', className: 'msp-btn msp-btn-block', onClick: this.superposeDb, style: { marginTop: '1px' }, disabled: this.state.isBusy, children: "Uniprot" }) });
    };
    SuperpositionControls.prototype.render = function () {
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsx(ToggleButton, { icon: SuperposeChainsSvg, label: 'Chains', toggle: this.toggleByChains, isSelected: this.state.action === 'byChains', disabled: this.state.isBusy }), _jsx(ToggleButton, { icon: SuperposeAtomsSvg, label: 'Atoms', toggle: this.toggleByAtoms, isSelected: this.state.action === 'byAtoms', disabled: this.state.isBusy }), this.state.canUseDb && this.superposeByDbMapping(), _jsx(ToggleButton, { icon: TuneSvg, label: '', title: 'Options', toggle: this.toggleOptions, isSelected: this.state.action === 'options', disabled: this.state.isBusy, style: { flex: '0 0 40px', padding: 0 } })] }), this.state.action === 'byChains' && this.addByChains(), this.state.action === 'byAtoms' && this.addByAtoms(), this.state.action === 'options' && _jsx("div", { className: 'msp-control-offset', children: _jsx(ParameterControls, { params: StructureSuperpositionParams, values: this.state.options, onChangeValues: this.setOptions, isDisabled: this.state.isBusy }) })] });
    };
    return SuperpositionControls;
}(PurePluginUIComponent));
export { SuperpositionControls };
