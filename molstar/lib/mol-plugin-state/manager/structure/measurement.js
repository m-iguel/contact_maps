/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { __assign, __awaiter, __extends, __generator } from "tslib";
import { StructureElement } from '../../../mol-model/structure';
import { StateSelection, StateTransform } from '../../../mol-state';
import { StateTransforms } from '../../transforms';
import { PluginCommands } from '../../../mol-plugin/commands';
import { arraySetAdd } from '../../../mol-util/array';
import { PluginStateObject } from '../../objects';
import { StatefulPluginComponent } from '../../component';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { MeasurementRepresentationCommonTextParams } from '../../../mol-repr/shape/loci/common';
import { Color } from '../../../mol-util/color';
export { StructureMeasurementManager };
export var MeasurementGroupTag = 'measurement-group';
export var MeasurementOrderLabelTag = 'measurement-order-label';
export var StructureMeasurementParams = {
    distanceUnitLabel: PD.Text('\u212B', { isEssential: true }),
    textColor: MeasurementRepresentationCommonTextParams.textColor
};
var DefaultStructureMeasurementOptions = PD.getDefaultValues(StructureMeasurementParams);
var StructureMeasurementManager = /** @class */ (function (_super) {
    __extends(StructureMeasurementManager, _super);
    function StructureMeasurementManager(plugin) {
        var _this = _super.call(this, { labels: [], distances: [], angles: [], dihedrals: [], orientations: [], planes: [], options: DefaultStructureMeasurementOptions }) || this;
        _this.plugin = plugin;
        _this.behaviors = {
            state: _this.ev.behavior(_this.state)
        };
        _this._empty = [];
        plugin.state.data.events.changed.subscribe(function (e) {
            if (e.inTransaction || plugin.behaviors.state.isAnimating.value)
                return;
            _this.sync();
        });
        plugin.behaviors.state.isAnimating.subscribe(function (isAnimating) {
            if (!isAnimating && !plugin.behaviors.state.isUpdating.value)
                _this.sync();
        });
        return _this;
    }
    StructureMeasurementManager.prototype.stateUpdated = function () {
        this.behaviors.state.next(this.state);
    };
    StructureMeasurementManager.prototype.getGroup = function () {
        var state = this.plugin.state.data;
        var groupRef = StateSelection.findTagInSubtree(state.tree, StateTransform.RootRef, MeasurementGroupTag);
        var builder = this.plugin.state.data.build();
        if (groupRef)
            return builder.to(groupRef);
        return builder.toRoot().group(StateTransforms.Misc.CreateGroup, { label: "Measurements" }, { tags: MeasurementGroupTag });
    };
    StructureMeasurementManager.prototype.setOptions = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var update, _i, _a, cell, _b, _c, cell, _d, _e, cell, _f, _g, cell;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (this.updateState({ options: options }))
                            this.stateUpdated();
                        update = this.plugin.state.data.build();
                        for (_i = 0, _a = this.state.distances; _i < _a.length; _i++) {
                            cell = _a[_i];
                            update.to(cell).update(function (old) {
                                old.unitLabel = options.distanceUnitLabel;
                                old.textColor = options.textColor;
                            });
                        }
                        for (_b = 0, _c = this.state.labels; _b < _c.length; _b++) {
                            cell = _c[_b];
                            update.to(cell).update(function (old) { old.textColor = options.textColor; });
                        }
                        for (_d = 0, _e = this.state.angles; _d < _e.length; _d++) {
                            cell = _e[_d];
                            update.to(cell).update(function (old) { old.textColor = options.textColor; });
                        }
                        for (_f = 0, _g = this.state.dihedrals; _f < _g.length; _f++) {
                            cell = _g[_f];
                            update.to(cell).update(function (old) { old.textColor = options.textColor; });
                        }
                        if (update.editInfo.count === 0)
                            return [2 /*return*/];
                        return [4 /*yield*/, PluginCommands.State.Update(this.plugin, { state: this.plugin.state.data, tree: update, options: { doNotLogTiming: true } })];
                    case 1:
                        _h.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StructureMeasurementManager.prototype.addDistance = function (a, b, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cellA, cellB, dependsOn, update, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cellA = this.plugin.helpers.substructureParent.get(a.structure);
                        cellB = this.plugin.helpers.substructureParent.get(b.structure);
                        if (!cellA || !cellB)
                            return [2 /*return*/];
                        dependsOn = [cellA.transform.ref];
                        arraySetAdd(dependsOn, cellB.transform.ref);
                        update = this.getGroup();
                        update
                            .apply(StateTransforms.Model.MultiStructureSelectionFromExpression, {
                            selections: [
                                { key: 'a', groupId: 'a', ref: cellA.transform.ref, expression: StructureElement.Loci.toExpression(a) },
                                { key: 'b', groupId: 'b', ref: cellB.transform.ref, expression: StructureElement.Loci.toExpression(b) }
                            ],
                            isTransitive: true,
                            label: 'Distance'
                        }, { dependsOn: dependsOn, tags: options === null || options === void 0 ? void 0 : options.selectionTags })
                            .apply(StateTransforms.Representation.StructureSelectionsDistance3D, __assign(__assign(__assign({ customText: (options === null || options === void 0 ? void 0 : options.customText) || '', unitLabel: this.state.options.distanceUnitLabel, textColor: this.state.options.textColor }, options === null || options === void 0 ? void 0 : options.lineParams), options === null || options === void 0 ? void 0 : options.labelParams), options === null || options === void 0 ? void 0 : options.visualParams), { tags: options === null || options === void 0 ? void 0 : options.reprTags });
                        state = this.plugin.state.data;
                        return [4 /*yield*/, PluginCommands.State.Update(this.plugin, { state: state, tree: update, options: { doNotLogTiming: true } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StructureMeasurementManager.prototype.addAngle = function (a, b, c, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cellA, cellB, cellC, dependsOn, update, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cellA = this.plugin.helpers.substructureParent.get(a.structure);
                        cellB = this.plugin.helpers.substructureParent.get(b.structure);
                        cellC = this.plugin.helpers.substructureParent.get(c.structure);
                        if (!cellA || !cellB || !cellC)
                            return [2 /*return*/];
                        dependsOn = [cellA.transform.ref];
                        arraySetAdd(dependsOn, cellB.transform.ref);
                        arraySetAdd(dependsOn, cellC.transform.ref);
                        update = this.getGroup();
                        update
                            .apply(StateTransforms.Model.MultiStructureSelectionFromExpression, {
                            selections: [
                                { key: 'a', ref: cellA.transform.ref, expression: StructureElement.Loci.toExpression(a) },
                                { key: 'b', ref: cellB.transform.ref, expression: StructureElement.Loci.toExpression(b) },
                                { key: 'c', ref: cellC.transform.ref, expression: StructureElement.Loci.toExpression(c) }
                            ],
                            isTransitive: true,
                            label: 'Angle'
                        }, { dependsOn: dependsOn, tags: options === null || options === void 0 ? void 0 : options.selectionTags })
                            .apply(StateTransforms.Representation.StructureSelectionsAngle3D, __assign(__assign(__assign({ customText: (options === null || options === void 0 ? void 0 : options.customText) || '', textColor: this.state.options.textColor }, options === null || options === void 0 ? void 0 : options.lineParams), options === null || options === void 0 ? void 0 : options.labelParams), options === null || options === void 0 ? void 0 : options.visualParams), { tags: options === null || options === void 0 ? void 0 : options.reprTags });
                        state = this.plugin.state.data;
                        return [4 /*yield*/, PluginCommands.State.Update(this.plugin, { state: state, tree: update, options: { doNotLogTiming: true } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StructureMeasurementManager.prototype.addDihedral = function (a, b, c, d, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cellA, cellB, cellC, cellD, dependsOn, update, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cellA = this.plugin.helpers.substructureParent.get(a.structure);
                        cellB = this.plugin.helpers.substructureParent.get(b.structure);
                        cellC = this.plugin.helpers.substructureParent.get(c.structure);
                        cellD = this.plugin.helpers.substructureParent.get(d.structure);
                        if (!cellA || !cellB || !cellC || !cellD)
                            return [2 /*return*/];
                        dependsOn = [cellA.transform.ref];
                        arraySetAdd(dependsOn, cellB.transform.ref);
                        arraySetAdd(dependsOn, cellC.transform.ref);
                        arraySetAdd(dependsOn, cellD.transform.ref);
                        update = this.getGroup();
                        update
                            .apply(StateTransforms.Model.MultiStructureSelectionFromExpression, {
                            selections: [
                                { key: 'a', ref: cellA.transform.ref, expression: StructureElement.Loci.toExpression(a) },
                                { key: 'b', ref: cellB.transform.ref, expression: StructureElement.Loci.toExpression(b) },
                                { key: 'c', ref: cellC.transform.ref, expression: StructureElement.Loci.toExpression(c) },
                                { key: 'd', ref: cellD.transform.ref, expression: StructureElement.Loci.toExpression(d) }
                            ],
                            isTransitive: true,
                            label: 'Dihedral'
                        }, { dependsOn: dependsOn, tags: options === null || options === void 0 ? void 0 : options.selectionTags })
                            .apply(StateTransforms.Representation.StructureSelectionsDihedral3D, __assign(__assign(__assign({ customText: (options === null || options === void 0 ? void 0 : options.customText) || '', textColor: this.state.options.textColor }, options === null || options === void 0 ? void 0 : options.lineParams), options === null || options === void 0 ? void 0 : options.labelParams), options === null || options === void 0 ? void 0 : options.visualParams), { tags: options === null || options === void 0 ? void 0 : options.reprTags });
                        state = this.plugin.state.data;
                        return [4 /*yield*/, PluginCommands.State.Update(this.plugin, { state: state, tree: update, options: { doNotLogTiming: true } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StructureMeasurementManager.prototype.addLabel = function (a, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cellA, dependsOn, update, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cellA = this.plugin.helpers.substructureParent.get(a.structure);
                        if (!cellA)
                            return [2 /*return*/];
                        dependsOn = [cellA.transform.ref];
                        update = this.getGroup();
                        update
                            .apply(StateTransforms.Model.MultiStructureSelectionFromExpression, {
                            selections: [
                                { key: 'a', ref: cellA.transform.ref, expression: StructureElement.Loci.toExpression(a) },
                            ],
                            isTransitive: true,
                            label: 'Label'
                        }, { dependsOn: dependsOn, tags: options === null || options === void 0 ? void 0 : options.selectionTags })
                            .apply(StateTransforms.Representation.StructureSelectionsLabel3D, __assign(__assign({ textColor: this.state.options.textColor }, options === null || options === void 0 ? void 0 : options.labelParams), options === null || options === void 0 ? void 0 : options.visualParams), { tags: options === null || options === void 0 ? void 0 : options.reprTags });
                        state = this.plugin.state.data;
                        return [4 /*yield*/, PluginCommands.State.Update(this.plugin, { state: state, tree: update, options: { doNotLogTiming: true } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StructureMeasurementManager.prototype.addOrientation = function (locis) {
        return __awaiter(this, void 0, void 0, function () {
            var selections, dependsOn, i, il, l, cell, update, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        selections = [];
                        dependsOn = [];
                        for (i = 0, il = locis.length; i < il; ++i) {
                            l = locis[i];
                            cell = this.plugin.helpers.substructureParent.get(l.structure);
                            if (!cell)
                                continue;
                            arraySetAdd(dependsOn, cell.transform.ref);
                            selections.push({ key: "l".concat(i), ref: cell.transform.ref, expression: StructureElement.Loci.toExpression(l) });
                        }
                        if (selections.length === 0)
                            return [2 /*return*/];
                        update = this.getGroup();
                        update
                            .apply(StateTransforms.Model.MultiStructureSelectionFromExpression, {
                            selections: selections,
                            isTransitive: true,
                            label: 'Orientation'
                        }, { dependsOn: dependsOn })
                            .apply(StateTransforms.Representation.StructureSelectionsOrientation3D);
                        state = this.plugin.state.data;
                        return [4 /*yield*/, PluginCommands.State.Update(this.plugin, { state: state, tree: update, options: { doNotLogTiming: true } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StructureMeasurementManager.prototype.addPlane = function (locis) {
        return __awaiter(this, void 0, void 0, function () {
            var selections, dependsOn, i, il, l, cell, update, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        selections = [];
                        dependsOn = [];
                        for (i = 0, il = locis.length; i < il; ++i) {
                            l = locis[i];
                            cell = this.plugin.helpers.substructureParent.get(l.structure);
                            if (!cell)
                                continue;
                            arraySetAdd(dependsOn, cell.transform.ref);
                            selections.push({ key: "l".concat(i), ref: cell.transform.ref, expression: StructureElement.Loci.toExpression(l) });
                        }
                        if (selections.length === 0)
                            return [2 /*return*/];
                        update = this.getGroup();
                        update
                            .apply(StateTransforms.Model.MultiStructureSelectionFromExpression, {
                            selections: selections,
                            isTransitive: true,
                            label: 'Plane'
                        }, { dependsOn: dependsOn })
                            .apply(StateTransforms.Representation.StructureSelectionsPlane3D);
                        state = this.plugin.state.data;
                        return [4 /*yield*/, PluginCommands.State.Update(this.plugin, { state: state, tree: update, options: { doNotLogTiming: true } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StructureMeasurementManager.prototype.addOrderLabels = function (locis) {
        return __awaiter(this, void 0, void 0, function () {
            var update, current, _i, current_1, obj, order, _a, locis_1, loci, cell, dependsOn, state;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        update = this.getGroup();
                        current = this.plugin.state.data.select(StateSelection.Generators.ofType(PluginStateObject.Molecule.Structure.Selections).withTag(MeasurementOrderLabelTag));
                        for (_i = 0, current_1 = current; _i < current_1.length; _i++) {
                            obj = current_1[_i];
                            update.delete(obj);
                        }
                        order = 1;
                        for (_a = 0, locis_1 = locis; _a < locis_1.length; _a++) {
                            loci = locis_1[_a];
                            cell = this.plugin.helpers.substructureParent.get(loci.structure);
                            if (!cell)
                                continue;
                            dependsOn = [cell.transform.ref];
                            update
                                .apply(StateTransforms.Model.MultiStructureSelectionFromExpression, {
                                selections: [
                                    { key: 'a', ref: cell.transform.ref, expression: StructureElement.Loci.toExpression(loci) },
                                ],
                                isTransitive: true,
                                label: 'Order'
                            }, { dependsOn: dependsOn, tags: MeasurementOrderLabelTag })
                                .apply(StateTransforms.Representation.StructureSelectionsLabel3D, {
                                textColor: Color.fromRgb(255, 255, 255),
                                borderColor: Color.fromRgb(0, 0, 0),
                                textSize: 0.33,
                                borderWidth: 0.3,
                                offsetZ: 0.75,
                                customText: "".concat(order++)
                            }, { tags: MeasurementOrderLabelTag });
                        }
                        state = this.plugin.state.data;
                        return [4 /*yield*/, PluginCommands.State.Update(this.plugin, { state: state, tree: update, options: { doNotLogTiming: true } })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StructureMeasurementManager.prototype.getTransforms = function (transformer) {
        var state = this.plugin.state.data;
        var groupRef = StateSelection.findTagInSubtree(state.tree, StateTransform.RootRef, MeasurementGroupTag);
        var ret = groupRef ? state.select(StateSelection.Generators.ofTransformer(transformer, groupRef)) : this._empty;
        if (ret.length === 0)
            return this._empty;
        return ret;
    };
    StructureMeasurementManager.prototype.sync = function () {
        var labels = [];
        for (var _i = 0, _a = this.getTransforms(StateTransforms.Representation.StructureSelectionsLabel3D); _i < _a.length; _i++) {
            var cell = _a[_i];
            var tags = cell.obj['tags'];
            if (!tags || !tags.includes(MeasurementOrderLabelTag))
                labels.push(cell);
        }
        var updated = this.updateState({
            labels: labels,
            distances: this.getTransforms(StateTransforms.Representation.StructureSelectionsDistance3D),
            angles: this.getTransforms(StateTransforms.Representation.StructureSelectionsAngle3D),
            dihedrals: this.getTransforms(StateTransforms.Representation.StructureSelectionsDihedral3D),
            orientations: this.getTransforms(StateTransforms.Representation.StructureSelectionsOrientation3D),
            planes: this.getTransforms(StateTransforms.Representation.StructureSelectionsPlane3D),
        });
        if (updated)
            this.stateUpdated();
    };
    return StructureMeasurementManager;
}(StatefulPluginComponent));
